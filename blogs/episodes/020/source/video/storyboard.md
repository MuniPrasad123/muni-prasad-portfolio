# 72-second vertical 9:16 production storyboard

**Delivery disclosure:** No narrated MP4 is included. The local voice synthesizer available in this run is robotic and does not satisfy the required pleasant, natural narration standard. Use a licensed natural English narrator, synchronize to `voiceover.txt`, and burn in captions. Do not claim audio verification until rendered and listened to.

**Persistent six-panel composition:** Maintain a clean 2-column × 3-row grid within a 1080×1920 canvas, with all six sections visible throughout. Highlight the active panel; never replace the whole diagram with static slides. Reserve a 250 px subtitle-safe area at bottom. Keep labels 38+ px and subtitles 44+ px with high contrast.

| Time | Active panel | Motion | Audio cue |
|---|---|---|---|
| 0–11 s | Customer | animated checkout packet stalls, retry pulse | soft click, warm urgent opening |
| 11–22 s | API | future timer reaches zero; payment packet continues | low tick, pause after 'rollback' |
| 22–34 s | Parallel reads | stock and shipping packets split and rejoin | gentle whoosh |
| 34–47 s | Payment | idempotency key travels with packet, duplicate rejected | muted chime |
| 47–60 s | Reconcile | UNKNOWN pulses then resolves via webhook | subtle heartbeat to resolve |
| 60–72 s | Fulfill | outbox emits one event; one parcel icon lights | positive completion |

Camera: gentle 2–4% zoom within active panel; keep all six panels legible. No flashy transitions. Narration: 135–155 WPM, conversational senior architect, short pauses, emphasize 'timeout does not mean rollback'. Use subtle licensed ambient music at least 20 dB below speech, with sidechain ducking. Verify subtitle sync, audio presence, clarity and pronunciation in final render.
