# Episode 008 — Narrated Video Storyboard

**Format:** 720×1280 (9:16), H.264, 12 fps, AAC mono, English eSpeak synthetic narration.
**Duration:** ~85.5 seconds.
**Audio:** original low-level synthesized ambient pad and scene-transition cues. Speech track was rendered; final media audio verification is documented in README.
**Accessibility:** burned-in short captions plus full-sentence SRT and WebVTT.

## Scene-by-scene production notes

### Scene 01 — PAYMENT APPROVED. (00:00:00,000 --> 00:00:09,049)

**Spoken voiceover:** “A shopper pays three hundred ninety-nine dollars. The payment provider authorizes the charge, but inventory rejects the last item. What now?”

**On-screen caption:** One order. Two services. A dangerous partial failure.

**Animation:** Two conflicting cards; $399 purchase, payment green, inventory red. Animated request packet falls into a red failure state. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 02 — ROLLBACK IS NOT ENOUGH (00:00:09,229 --> 00:00:19,007)

**Spoken voiceover:** “A Spring transaction cannot roll back an external payment. Each microservice commits independently. We need a business recovery workflow, called a Saga.”

**On-screen caption:** A database rollback cannot undo a payment provider action.

**Animation:** Zoom from @Transactional order database to an external provider, with a red transaction-boundary barrier. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 03 — MEET THE SAGA (00:00:19,187 --> 00:00:28,084)

**Spoken voiceover:** “A durable orchestrator tracks the order. Commands travel through an outbox and Kafka. Every step records a result before moving forward.”

**On-screen caption:** Persist progress, issue commands, observe outcomes.

**Animation:** Orchestrator, Payment, Inventory, and Outbox/Kafka as moving nodes; two packets traverse distinct command paths. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 04 — THE SAFER PATH (00:00:28,264 --> 00:00:37,402)

**Spoken voiceover:** “The preferred path reserves stock, authorizes payment, then captures. Confirm the order only when inventory and payment outcomes are verified.”

**On-screen caption:** Confirm only after both business outcomes are verified.

**Animation:** Three stages light up sequentially: inventory reservation, payment authorization, capture and confirmation. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 05 — INVENTORY FAILED (00:00:37,582 --> 00:00:46,294)

**Spoken voiceover:** “But if authorization happened first and inventory fails, issue a void. Wait for provider confirmation before marking the order cancelled.”

**On-screen caption:** Void the uncaptured authorization. Await confirmation.

**Animation:** Authorization success turns into inventory rejection; reverse flow sends a void command and waits for provider confirmation. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 06 — ALREADY CAPTURED? (00:00:46,474 --> 00:00:55,595)

**Spoken voiceover:** “If the money was already captured, voiding is wrong. Request a refund, track refund pending, and reconcile until the provider confirms it.”

**On-screen caption:** Track REFUND_PENDING until the provider verifies the result.

**Animation:** Show CAPTURED and REJECTED cards; animated refund command flows into REFUND_PENDING. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 07 — TIMEOUT ≠ FAILURE (00:00:55,775 --> 00:01:05,022)

**Spoken voiceover:** “A payment timeout means unknown, not failed. Reuse the same operation key, check provider status, and never blindly create another charge.”

**On-screen caption:** Reconcile with a stable payment operation key.

**Animation:** Payment timeout flashes; question mark scales; reconciliation command returns to provider using the same operation key. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 08 — RETRY WITHOUT DUPLICATES (00:01:05,202 --> 00:01:15,348)

**Spoken voiceover:** “Kafka may redeliver messages. Deduplicate with a database constraint, use stable payment idempotency keys, and persist every compensation through an outbox.”

**On-screen caption:** Duplicate delivery must not mean duplicate money movement.

**Animation:** Two Kafka event packets converge into a unique-key inbox; only one business effect emerges. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

### Scene 09 — ARCHITECT FOR FAILURE (00:01:15,528 --> 00:01:25,194)

**Spoken voiceover:** “The rule is simple: a successful payment call is not a successful order. Design checkout for partial failures, recovery, and truthful customer status.”

**On-screen caption:** A successful payment call is not a successful order.

**Animation:** Three pillars pulse in sequence: persist, compensate, reconcile; final rule is emphasized. Continuous technical grid, progress bar, waveform and moving flow packets.

**Audio cue:** Low ambient pad, subtle transition chime at scene start, voice centered and foregrounded.

## Production and engineering notes

- Do not show an order as refunded until the provider confirms a refund; `REFUND_PENDING` is an intermediate state.
- Authorization void and captured-payment refund are distinct operations.
- The scene animations illustrate control flow, not live payment provider integrations or measured latency.
- Keep a 60-pixel vertical safe margin for social platforms; inspect subtitles in mobile preview.
- Source: `video/render_video.py`; edit scene voice and motion instructions there, then rerun.
