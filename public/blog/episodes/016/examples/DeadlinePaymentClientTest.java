import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/** Local fixture only: no external payment provider or production signature contract. */
public final class DeadlinePaymentClientTest {
  public static void main(String[] args) throws Exception {
    var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
    var workers=Executors.newVirtualThreadPerTaskExecutor();server.setExecutor(workers);
    var stored=new ConcurrentHashMap<String,String>();var accepted=new CountDownLatch(1);var release=new CountDownLatch(1);var effects=new AtomicInteger();
    server.createContext("/authorize",exchange->{
      var ref=exchange.getRequestHeaders().getFirst("Idempotency-Key");
      if(stored.putIfAbsent(ref,"CONFIRMED")==null)effects.incrementAndGet();
      accepted.countDown();
      try{release.await(5,TimeUnit.SECONDS);byte[] body="CONFIRMED".getBytes();exchange.sendResponseHeaders(200,body.length);exchange.getResponseBody().write(body);}catch(InterruptedException e){Thread.currentThread().interrupt();}finally{exchange.close();}
    });
    server.createContext("/payments/",exchange->{
      var ref=exchange.getRequestURI().getPath().substring("/payments/".length());
      byte[] body=stored.getOrDefault(ref,"UNKNOWN").getBytes();exchange.sendResponseHeaders(200,body.length);exchange.getResponseBody().write(body);exchange.close();
    });server.start();
    try {
      var endpoint=URI.create("http://127.0.0.1:"+server.getAddress().getPort()+"/authorize");
      var client=new DeadlinePaymentClient(endpoint,Duration.ofMillis(300),Duration.ofSeconds(2));
      client.lookup("warmup"); // initialize the HTTP transport before testing the held response
      var bulkhead=new PaymentBulkhead(1,0,Duration.ZERO);
      try{bulkhead.call(()->client.authorize("attempt-ASHA-101","{}"));throw new AssertionError("Expected response timeout");}catch(HttpTimeoutException expected){}
      if(!accepted.await(3,TimeUnit.SECONDS))throw new AssertionError("Provider did not receive operation");
      // Local HTTP task ended, so its permit releases. Remote acceptance was NOT undone.
      if(bulkhead.availablePermits()!=1||effects.get()!=1)throw new AssertionError("Local/remote boundary violated");
      var result=client.lookup("attempt-ASHA-101");
      if(!result.body().equals("CONFIRMED")||effects.get()!=1)throw new AssertionError("Unsafe recovery");
      System.out.println("PASS: actual HTTP timeout; original-reference lookup recovers without another authorization");
    }finally{release.countDown();server.stop(0);workers.shutdownNow();workers.close();}
  }
}
