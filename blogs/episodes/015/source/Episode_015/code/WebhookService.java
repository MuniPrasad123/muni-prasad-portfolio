package example.webhooks;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WebhookService {
  private final JdbcTemplate db;
  public WebhookService(JdbcTemplate db) { this.db = db; }

  // Caller MUST authenticate the provider signature over the raw body first.
  @Transactional
  public boolean acceptVerifiedSuccess(String provider, String eventId, String paymentId) {
    int inserted = db.update("INSERT INTO webhook_inbox(provider,event_id,payment_id) VALUES (?,?,?) ON CONFLICT DO NOTHING", provider, eventId, paymentId);
    if (inserted == 0) return false; // Already durably processed; ACK safely.
    int changed = db.update("UPDATE payments SET status='SUCCEEDED' WHERE payment_id=? AND status='PENDING'", paymentId);
    if (changed == 1) {
      db.update("INSERT INTO outbox(event_key,event_type,payload) VALUES (?, 'PaymentSucceeded', jsonb_build_object('paymentId', ?)) ON CONFLICT DO NOTHING", "payment-succeeded:"+paymentId, paymentId);
    }
    return true;
  }
}
