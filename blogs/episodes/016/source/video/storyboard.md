# 9:16 motion storyboard (70 seconds)

## 00–10s — THE CHECKOUT SPINNER
Voiceover: Flash-sale customers tap Pay. The checkout spinner keeps turning, even though the database is healthy.
Motion: animated data packet travels across browser, gateway, virtual-thread worker and payment provider. Zoom into the bottleneck; counters and labels pulse. Subtle click/swoosh only under narration.

## 10–20s — WHY REQUESTS QUEUE
Voiceover: Each traditional platform thread waits while the payment API responds. A limited thread pool fills up.
Motion: animated data packet travels across browser, gateway, virtual-thread worker and payment provider. Zoom into the bottleneck; counters and labels pulse. Subtle click/swoosh only under narration.

## 20–30s — JAVA 21 VIRTUAL THREADS
Voiceover: Virtual threads allow many blocking requests to wait without occupying an operating system thread.
Motion: animated data packet travels across browser, gateway, virtual-thread worker and payment provider. Zoom into the bottleneck; counters and labels pulse. Subtle click/swoosh only under narration.

## 30–40s — THE IMPORTANT LIMIT
Voiceover: But virtual threads do not increase database connections, payment capacity, or CPU throughput.
Motion: animated data packet travels across browser, gateway, virtual-thread worker and payment provider. Zoom into the bottleneck; counters and labels pulse. Subtle click/swoosh only under narration.

## 40–50s — SAFE CHECKOUT DESIGN
Voiceover: Use bounded downstream concurrency, timeouts, idempotency keys, and a durable order state machine.
Motion: animated data packet travels across browser, gateway, virtual-thread worker and payment provider. Zoom into the bottleneck; counters and labels pulse. Subtle click/swoosh only under narration.

## 50–60s — MEASURE BEFORE SHIPPING
Voiceover: Load test queue time, p ninety nine latency, connection pool waits, and payment-provider errors.
Motion: animated data packet travels across browser, gateway, virtual-thread worker and payment provider. Zoom into the bottleneck; counters and labels pulse. Subtle click/swoosh only under narration.

## 60–70s — CUSTOMER OUTCOME
Voiceover: Fewer requests stuck waiting for threads, without promising impossible throughput or duplicate-free payments.
Motion: animated data packet travels across browser, gateway, virtual-thread worker and payment provider. Zoom into the bottleneck; counters and labels pulse. Subtle click/swoosh only under narration.
