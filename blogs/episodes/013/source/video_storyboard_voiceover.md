# 72-second 9:16 production kit — NOT a rendered or narrated video

## Audio policy

Record a natural, clear English senior-architect voice. Mix light unobtrusive sound at least 18 dB below speech. Burn captions into the final video and verify against recorded narration. SRT/VTT here are timing drafts; resync to actual audio.

## Motion design

1080×1920, 30 fps. Animated packets follow the architecture arrows, node glows indicate state, zoom to failing component, then animate correction. No static-slide-only output.

### 00–12s — Flash-sale symptom
**Voiceover:** Customers see 503 at checkout; the order status is uncertain. Follow the highlighted request and observe the state change.
**On screen:** Customers see 503 at checkout; the order status is uncertain.
**Motion:** Slide and zoom into architecture node 1; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 12–24s — Request route
**Voiceover:** Browser packet enters gateway and selects a checkout endpoint. Follow the highlighted request and observe the state change.
**On screen:** Browser packet enters gateway and selects a checkout endpoint.
**Motion:** Slide and zoom into architecture node 2; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 24–36s — Root cause
**Voiceover:** Terminating pod still receives traffic while readiness is stale. Follow the highlighted request and observe the state change.
**On screen:** Terminating pod still receives traffic while readiness is stale.
**Motion:** Slide and zoom into architecture node 3; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 36–48s — Safer deployment
**Voiceover:** Readiness fails first; connections drain before pod termination. Follow the highlighted request and observe the state change.
**On screen:** Readiness fails first; connections drain before pod termination.
**Motion:** Slide and zoom into architecture node 4; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 48–60s — Retry safety
**Voiceover:** Idempotency key protects POST /checkout from duplicate orders. Here is the design rule: Use readiness probes, preStop drain, graceful shutdown, bounded gateway retries only for safe operations, and durable idempotency keys for order placement. Propagate trace IDs and measure 502/503 rates.
**On screen:** Idempotency key protects POST /checkout from duplicate orders.
**Motion:** Slide and zoom into architecture node 5; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 60–72s — Validate
**Voiceover:** Trace request IDs, watch 5xx, drain behavior, and order uniqueness. Follow the highlighted request and observe the state change.
**On screen:** Trace request IDs, watch 5xx, drain behavior, and order uniqueness.
**Motion:** Slide and zoom into architecture node 6; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.
