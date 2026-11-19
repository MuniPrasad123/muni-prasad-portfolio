# Episode 014 voiceover and storyboard

Pending natural-English recording. Six 18-second scenes, three six-second cues each (108 seconds). Calm senior-architect delivery. Record against these cues, then align subtitles to actual speech and review before release.

## 00:00:00.000 — One payment, two answers

Visual: Checkout confirmed → Shopper worries → History pending. Write: PAID v2; read: PENDING v1.

00:00:00.000–00:00:06.000: Imagine buying sneakers for four thousand nine hundred and ninety-nine rupees. Checkout confirms your payment.

00:00:06.000–00:00:12.000: Then My Orders says payment pending. You wonder whether to pay again.

00:00:12.000–00:00:18.000: This is an illustrative incident. Your payment succeeded; its history view is behind.

## 00:00:18.000 — Commands change. Queries read.

Visual: Order command → Write PostgreSQL → Read PostgreSQL. Write: Authority; read: Optimized view.

00:00:18.000–00:00:24.000: A command changes information. A query reads it. CQRS separates those responsibilities.

00:00:24.000–00:00:30.000: Here we also use separate databases. The write database owns the order; history reads an optimized view.

00:00:30.000–00:00:36.000: That separation adds delay and operating costs. A single database is often enough.

## 00:00:36.000 — Commit intent, then publish

Visual: Order + outbox → Publisher → Kafka: order-events. Write: PAID v2 + outbox; read: PENDING v1.

00:00:36.000–00:00:42.000: The provider outcome is verified outside PostgreSQL. One local transaction then saves paid version two and an outbox event.

00:00:42.000–00:00:48.000: A publisher sends that snapshot to Kafka using the order ID as its key.

00:00:48.000–00:00:54.000: Retries can publish duplicates. An outbox preserves intent; it does not make delivery instantaneous.

## 00:00:54.000 — A delayed view is not a failed payment

Visual: Kafka backlog → Consumer delayed → History synchronizing. Write: PAID v2; read: PENDING v1.

00:00:54.000–00:01:00.000: The projection consumer is delayed. Kafka has the event, but the read database still holds pending version one.

00:01:00.000–00:01:06.000: Use verified confirmation to explain that history is synchronizing. Do not request another payment.

00:01:06.000–00:01:12.000: If payment itself is unknown, keep it under verification instead of promising success.

## 00:01:12.000 — Accept newer. Reject stale. Ignore duplicates.

Visual: Apply PAID v2 → Reject PENDING v1 → Ignore duplicate v2. Write: PAID v2; read: PAID v2.

00:01:12.000–00:01:18.000: The consumer recovers and applies paid version two. A separate replay path later republishes an older snapshot.

00:01:18.000–00:01:24.000: Kafka has not reordered its partition. An atomic database version guard rejects that older business version.

00:01:24.000–00:01:30.000: Identical duplicates change nothing. Conflicting payloads at the same version need investigation.

## 00:01:30.000 — Recover the view. Preserve the payment.

Visual: Freshness alert → Authoritative repair → History paid. Write: PAID v2; read: PAID v2.

00:01:30.000–00:01:36.000: Monitor pending outbox age, projection freshness and repair failures. Kafka lag alone cannot detect an unpublished event.

00:01:36.000–00:01:42.000: Reconciliation fetches the authoritative snapshot and applies the same guard. It never charges the shopper.

00:01:42.000–00:01:48.000: History now shows paid. Complete snapshots can skip versions; deltas may need gap recovery.
