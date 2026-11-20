# LinkedIn carousel — 7 slides

1. **ONE PAYMENT. THREE EMAILS.** Customer Maya pays $120 once but sees three confirmations. Show customer icon, one bank transaction and three email cards.
2. **THE ACK WAS LOST.** Payment provider sends `evt_501`; merchant processes it; HTTP response disappears. Show request and broken return arrow.
3. **RETRY IS NORMAL. DUPLICATE WORK IS NOT.** Same event delivered again; unsafe code sends a second email and shipment. Show red duplicated arrows.
4. **PROTECTION 1: INBOX.** PostgreSQL unique `(provider,event_id)` accepts event once; repeated deliveries safely ACK. Show lock closing on duplicate.
5. **PROTECTION 2: PAYMENT STATE GUARD.** `PENDING -> SUCCEEDED` only once. Show state turnstile; new event ID does not bypass it.
6. **PROTECTION 3: OUTBOX + CONSUMER IDEMPOTENCY.** Commit state and business intent atomically; retry dispatch with stable key. Show independent workers and dedup.
7. **CUSTOMER OUTCOME.** One payment, one logical confirmation, one fulfillment intent. Call to action: Which retry failure have you debugged?

Use horizontal carousel-friendly 4:5 panels, readable icons, short titles, consistent teal/amber/navy palette. No fabricated metrics.
