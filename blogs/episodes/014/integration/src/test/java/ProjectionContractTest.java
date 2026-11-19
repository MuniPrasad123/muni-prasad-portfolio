import org.junit.jupiter.api.*;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.kafka.KafkaContainer;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.sql.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

// Infrastructure contract tests, not tests of the omitted Spring/provider adapters.
class ProjectionContractTest {
  static final PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:17-alpine");
  static final KafkaContainer kafka = new KafkaContainer("apache/kafka-native:3.9.1");
  static final String UPSERT = """
    INSERT INTO order_projection(order_id,status,version) VALUES (?,?,?)
    ON CONFLICT(order_id) DO UPDATE SET status=EXCLUDED.status,version=EXCLUDED.version
    WHERE order_projection.version < EXCLUDED.version
    """;
  static Connection connect() throws SQLException {return DriverManager.getConnection(pg.getJdbcUrl(),pg.getUsername(),pg.getPassword());}
  @BeforeAll static void start() throws Exception {
    pg.start(); kafka.start();
    try(var c=connect();var s=c.createStatement()){
      s.execute("CREATE TABLE order_projection(order_id text PRIMARY KEY,status text NOT NULL,version bigint NOT NULL)");
      s.execute("CREATE TABLE orders(order_id text PRIMARY KEY,status text NOT NULL,version bigint NOT NULL)");
      s.execute("CREATE TABLE outbox(event_id text PRIMARY KEY,order_id text NOT NULL,version bigint NOT NULL,UNIQUE(order_id,version))");
    }
  }
  @AfterAll static void stop(){kafka.stop();pg.stop();}
  @BeforeEach void clear() throws Exception {try(var c=connect();var s=c.createStatement()){s.execute("TRUNCATE order_projection,orders,outbox");}}
  static String apply(Connection c,String order,String status,long version) throws SQLException {
    c.setAutoCommit(false);
    try(var s=c.prepareStatement(UPSERT)){
      s.setString(1,order);s.setString(2,status);s.setLong(3,version);
      int changed=s.executeUpdate();
      if(changed==1){c.commit();return "APPLIED";}
      try(var q=c.prepareStatement("SELECT status,version FROM order_projection WHERE order_id=? FOR UPDATE")){
        q.setString(1,order);
        try(var r=q.executeQuery()){
          assertTrue(r.next());long stored=r.getLong(2);
          if(stored==version && !r.getString(1).equals(status)){c.rollback();return "CONFLICT";}
          c.commit();return stored>version?"STALE":"DUPLICATE";
        }
      }
    }catch(SQLException e){c.rollback();throw e;}
  }
  static void assertPaid() throws Exception {try(var c=connect();var s=c.createStatement();var r=s.executeQuery("SELECT status,version FROM order_projection WHERE order_id='ORD-101'")){assertTrue(r.next());assertEquals("PAID",r.getString(1));assertEquals(2,r.getLong(2));}}
  @Test void kafkaSnapshotsCommitBeforeOffsetsAndReplaySafely() throws Exception {
    String topic="order-events-"+UUID.randomUUID();
    var producerProps=new Properties();producerProps.put("bootstrap.servers",kafka.getBootstrapServers());producerProps.put("acks","all");
    try(var producer=new KafkaProducer<String,String>(producerProps,new StringSerializer(),new StringSerializer())){
      // Explicit application replay: Kafka preserves this partition's record order.
      for(String snapshot:List.of("PAID:2","PENDING:1","PAID:2"))producer.send(new ProducerRecord<>(topic,0,"ORD-101",snapshot)).get(20,TimeUnit.SECONDS);
    }
    var props=new Properties();props.put("bootstrap.servers",kafka.getBootstrapServers());props.put("group.id","projection-"+UUID.randomUUID());props.put("auto.offset.reset","earliest");props.put("enable.auto.commit","false");
    List<String> results=new ArrayList<>();
    try(var consumer=new KafkaConsumer<String,String>(props,new StringDeserializer(),new StringDeserializer());var db=connect()){
      consumer.subscribe(List.of(topic));long deadline=System.nanoTime()+Duration.ofSeconds(40).toNanos();
      while(results.size()<3 && System.nanoTime()<deadline){
        for(var record:consumer.poll(Duration.ofMillis(500))){
          var fields=record.value().split(":");results.add(apply(db,record.key(),fields[0],Long.parseLong(fields[1])));
        }
        if(!results.isEmpty())consumer.commitSync(); // after DB commits, never before
      }
      assertEquals(List.of("APPLIED","STALE","DUPLICATE"),results);
      // Reopen/replay against persisted DB state, not an in-memory set.
    }
    try(var db=connect()){assertEquals("DUPLICATE",apply(db,"ORD-101","PAID",2));}
    assertPaid();
  }
  @Test void equalVersionConflictPreservesStoredSnapshot() throws Exception {
    try(var db=connect()){assertEquals("APPLIED",apply(db,"ORD-101","PAID",2));assertEquals("CONFLICT",apply(db,"ORD-101","PENDING",2));}
    assertPaid();
  }
  @Test void concurrentOlderAndNewerWritesCannotRegress() throws Exception {
    try(var pool=Executors.newFixedThreadPool(2)){
      var gate=new CountDownLatch(1);
      var a=pool.submit(()->{gate.await();try(var db=connect()){return apply(db,"ORD-101","PENDING",1);}});
      var b=pool.submit(()->{gate.await();try(var db=connect()){return apply(db,"ORD-101","PAID",2);}});
      gate.countDown();a.get(10,TimeUnit.SECONDS);b.get(10,TimeUnit.SECONDS);
    }
    assertPaid();
  }
  @Test void failedOutboxInsertRollsBackOrderTransition() throws Exception {
    try(var db=connect();var s=db.createStatement()){
      s.execute("INSERT INTO orders VALUES ('ORD-101','PENDING',1)");
      s.execute("INSERT INTO outbox VALUES ('existing','ORD-101',2)");
      db.setAutoCommit(false);
      assertThrows(SQLException.class,()->{
        s.executeUpdate("UPDATE orders SET status='PAID',version=2 WHERE order_id='ORD-101'");
        s.executeUpdate("INSERT INTO outbox VALUES ('retry','ORD-101',2)");
        db.commit();
      });
      db.rollback();
      try(var r=s.executeQuery("SELECT status,version FROM orders WHERE order_id='ORD-101'")){assertTrue(r.next());assertEquals("PENDING",r.getString(1));assertEquals(1,r.getLong(2));}
      try(var r=s.executeQuery("SELECT count(*) FROM outbox")){assertTrue(r.next());assertEquals(1,r.getInt(1));}
    }
  }
}
