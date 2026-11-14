# Episode 019 — 68-second vertical 9:16 production storyboard

**Visual grammar:** Keep all six clean separated panels in one 1080×1920 frame, 2 columns × 3 rows. Each panel stays visible. Animate only the active panel with zoom-in within its boundary, moving packet trails, a highlighted border and a progress indicator. Safe margins 90px. Burn subtitles into lower safe area, never over the diagram. Use original low-volume ambient synth bed and soft packet ticks only when properly licensed.

### 00:00–00:10 | Customer sees checkout stuck
**Animation:** Show storefront spinner and growing retry counter.
**Spoken:** A checkout that never finishes can trigger risky retries.
**On-screen caption:** A checkout that never finishes can trigger risky retries.

### 00:10–00:20 | Two threads, opposite lock order
**Animation:** Animate blue and orange threads taking opposing locks.
**Spoken:** Two requests can hold different locks, then wait forever for each other.
**On-screen caption:** Two requests can hold different locks, then wait forever for each other.

### 00:20–00:30 | CPU stays low
**Animation:** Zoom to thread-state indicators and lock owners.
**Spoken:** Low CPU does not mean the service is healthy. Threads may be blocked.
**On-screen caption:** Low CPU does not mean the service is healthy. Threads may be blocked.

### 00:30–00:42 | Capture evidence
**Animation:** Animate three snapshots and JFR timeline.
**Spoken:** Capture repeated thread dumps, inspect lock owners, and correlate JFR with traces.
**On-screen caption:** Capture repeated thread dumps, inspect lock owners, and correlate JFR with traces.

### 00:42–00:55 | Redesign checkout
**Animation:** Animate conditional inventory update, payment idempotency, outbox.
**Spoken:** Keep transactions short. Avoid remote calls inside locks. Reconcile uncertain payments.
**On-screen caption:** Keep transactions short. Avoid remote calls inside locks. Reconcile uncertain payments.

### 00:55–01:08 | Validate the fix
**Animation:** Animate p99 chart, one-payment counter, green order status.
**Spoken:** Test contention, retries, and downstream failures before claiming improvement.
**On-screen caption:** Test contention, retries, and downstream failures before claiming improvement.

**Voice direction:** warm, conversational, confident senior architect; measured ~125–140 wpm, natural pauses, clear “J-F-R”, no robotic monotone. Validate voice and caption synchronization by listening and visually inspecting before publishing. No narrated MP4 is included in this package.
