# 72-second 9:16 production kit — NOT a rendered or narrated video

## Audio policy

Record a natural, clear English senior-architect voice. Mix light unobtrusive sound at least 18 dB below speech. Burn captions into the final video and verify against recorded narration. SRT/VTT here are timing drafts; resync to actual audio.

## Motion design

1080×1920, 30 fps. Animated packets follow the architecture arrows, node glows indicate state, zoom to failing component, then animate correction. No static-slide-only output.

### 00–12s — Customer confusion
**Voiceover:** Payment succeeds but My Orders still says Pending. Follow the highlighted request and observe the state change.
**On screen:** Payment succeeds but My Orders still says Pending.
**Motion:** Slide and zoom into architecture node 1; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 12–24s — Command side
**Voiceover:** Payment callback updates order and outbox atomically. Follow the highlighted request and observe the state change.
**On screen:** Payment callback updates order and outbox atomically.
**Motion:** Slide and zoom into architecture node 2; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 24–36s — Kafka flow
**Voiceover:** Outbox relay publishes versioned OrderPaid event. Follow the highlighted request and observe the state change.
**On screen:** Outbox relay publishes versioned OrderPaid event.
**Motion:** Slide and zoom into architecture node 3; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 36–48s — Projection lag
**Voiceover:** Read model may be behind; do not mislabel payment as failed. Follow the highlighted request and observe the state change.
**On screen:** Read model may be behind; do not mislabel payment as failed.
**Motion:** Slide and zoom into architecture node 4; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 48–60s — Version guard
**Voiceover:** Duplicate and older events cannot roll the projection backward. Here is the design rule: Commit order state and outbox event in one database transaction, publish asynchronously, consume idempotently using monotonically increasing versions, and reconcile stale projections. Show pending synchronization rather than falsely claiming payment failed.
**On screen:** Duplicate and older events cannot roll the projection backward.
**Motion:** Slide and zoom into architecture node 5; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.

### 60–72s — Reconciliation
**Voiceover:** Detect lag, replay safely, and show synchronization status. Follow the highlighted request and observe the state change.
**On screen:** Detect lag, replay safely, and show synchronization status.
**Motion:** Slide and zoom into architecture node 6; animate packet travel, failure pulse and success state.
**Audio cue:** soft transition, speech first.
