import example.webhooks.WebhookService;
import example.webhooks.WebhookService.*;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import javax.crypto.Mac;
import javax.crypto.KeyGenerator;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

class WebhookContractTest {
  static final PostgreSQLContainer<?> pg=new PostgreSQLContainer<>("postgres:17-alpine");
  static JdbcTemplate db; static TransactionTemplate tx; static WebhookService service;
  @BeforeAll static void start() throws Exception {
    pg.start();var source=new DriverManagerDataSource(pg.getJdbcUrl(),pg.getUsername(),pg.getPassword());
    db=new JdbcTemplate(source);tx=new TransactionTemplate(new DataSourceTransactionManager(source));service=new WebhookService(db);
    String schema=Files.readString(Path.of("../../../../public/blog/episodes/015/examples/schema.sql"));
    db.execute(schema);
  }
  @AfterAll static void stop(){pg.stop();}
  @BeforeEach void reset(){db.execute("TRUNCATE webhook_inbox,outbox,webhook_reconciliation,payments");db.update("INSERT INTO payments VALUES ('acme','merchant_1','pay_100','order_100',12000,'USD','PENDING')");}
  static VerifiedSuccess event(String id){return new VerifiedSuccess("acme","merchant_1",id,"pay_100","order_100",12000,"USD","fixture-body-sha256");}
  static Outcome accept(VerifiedSuccess event){return tx.execute(status->service.acceptVerifiedSuccess(event));}
  static int count(String table){return db.queryForObject("SELECT count(*) FROM "+table,Integer.class);}
  @Test void lostAckAndDuplicateEventPreserveOneIntent(){
    assertEquals(Outcome.APPLIED,accept(event("evt_501")));
    // Simulate lost HTTP response AFTER tx.execute returns (the transaction is committed).
    assertEquals(Outcome.DUPLICATE,accept(event("evt_501")));
    assertEquals(Outcome.DUPLICATE,accept(event("evt_501")));
    assertEquals(1,count("webhook_inbox"));assertEquals(1,count("outbox"));
  }
  @Test void distinctIdCannotCreateAnotherBusinessTransition(){
    assertEquals(Outcome.APPLIED,accept(event("evt_501")));
    assertEquals(Outcome.ALREADY_SUCCEEDED,accept(event("evt_502")));
    assertEquals(2,count("webhook_inbox"));assertEquals(1,count("outbox"));
  }
  @Test void refundedPaymentDoesNotRegressAndCreatesDurableRepairCandidate(){
    db.update("UPDATE payments SET status='REFUNDED'");
    assertEquals(Outcome.RECONCILE,accept(event("evt_late")));
    assertEquals("REFUNDED",db.queryForObject("SELECT status FROM payments",String.class));
    assertEquals(0,count("outbox"));assertEquals(1,count("webhook_reconciliation"));
  }
  @Test void wrongMerchantAndMismatchedTermsRollbackInbox(){
    var wrong=new VerifiedSuccess("acme","merchant_2","evt_501","pay_100","order_100",12000,"USD","hash");
    assertThrows(RuntimeException.class,()->accept(wrong));
    var amount=new VerifiedSuccess("acme","merchant_1","evt_501","pay_100","order_100",1,"USD","hash");
    assertThrows(IllegalArgumentException.class,()->accept(amount));
    assertEquals(0,count("webhook_inbox"));assertEquals(0,count("outbox"));
    assertEquals("PENDING",db.queryForObject("SELECT status FROM payments",String.class));
  }
  @Test void outboxFailureRollsBackEntireAcceptanceTransaction(){
    db.update("INSERT INTO outbox(event_key,event_type,payload) VALUES ('payment-succeeded:acme:merchant_1:pay_100','Fixture','{}')");
    assertThrows(RuntimeException.class,()->accept(event("evt_501")));
    assertEquals(0,count("webhook_inbox"));assertEquals(1,count("outbox"));
    assertEquals("PENDING",db.queryForObject("SELECT status FROM payments",String.class));
  }
  @Test void conflictingPayloadForOneEventIdentityIsNotSilentlyAcknowledged(){
    accept(event("evt_501"));
    var conflicting=new VerifiedSuccess("acme","merchant_1","evt_501","pay_100","order_100",12000,"USD","different-body");
    assertThrows(IllegalStateException.class,()->accept(conflicting));assertEquals(1,count("outbox"));
  }
  @Test void twoReplicasWithDifferentDeliveryIdsStillCreateOneBusinessIntent() throws Exception {
    try(var pool=Executors.newFixedThreadPool(2)){
      var gate=new CountDownLatch(1);
      var a=pool.submit(()->{gate.await();return accept(event("evt_501"));});
      var b=pool.submit(()->{gate.await();return accept(event("evt_502"));});
      gate.countDown();a.get(10,TimeUnit.SECONDS);b.get(10,TimeUnit.SECONDS);
    }
    assertEquals(2,count("webhook_inbox"));assertEquals(1,count("outbox"));
  }
  @Test void rawBodySignatureFixtureRejectsMutationBeforeServiceCall() throws Exception {
    // Generic HMAC fixture ONLY, not any provider's signature protocol.
    var key=KeyGenerator.getInstance("HmacSHA256").generateKey();var mac=Mac.getInstance("HmacSHA256");mac.init(key);
    byte[] original="{\"eventId\":\"evt_501\"}".getBytes(StandardCharsets.UTF_8);
    byte[] signature=mac.doFinal(original);
    byte[] changed="{ \"eventId\":\"evt_501\" }".getBytes(StandardCharsets.UTF_8);
    boolean authentic=MessageDigest.isEqual(signature,mac.doFinal(changed));
    if(authentic)accept(event("evt_501"));
    assertFalse(authentic);assertEquals(0,count("webhook_inbox"));assertEquals(0,count("outbox"));
  }
}
