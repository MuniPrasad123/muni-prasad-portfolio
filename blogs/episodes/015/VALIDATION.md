# Episode 015 redesign validation — 20 November 2026

Route preserved: `/blog/payment-webhook-idempotency-inbox-outbox`. Title, canonical metadata, original comparison URL, feedback/likes and navigation remain in place. Original video/caption assets are retained alongside the new media.

## Completed checks

- Six new Node state-model tests pass: lost ACK/repeated delivery, new IDs for one payment, invalid signatures and wrong merchants before mutation, refunded-state protection, worker send-then-crash replay, deterministic Previous/Reset.
- The attached Java state machine executes successfully. Its in-memory/single-payment limits are explicitly labeled.
- **Eight PostgreSQL integration tests pass, zero failures/errors/skips.** They compile and exercise the actual Spring/JDBC sample under a real transaction manager: duplicate/lost-ACK handling, distinct event IDs, terminal state preservation and durable repair candidate, merchant/amount binding, atomic outbox rollback, conflicting same-ID bodies, concurrent replicas and a generic raw-body HMAC mutation fixture. The fixture is not a real provider adapter.
- Browser tests pass for seven scenarios and every control: Previous/Next/Reset, timed autoplay/pause/speed, separate visual motion pause, component explanations, quiz scoring, keyboard Enter and reduced-motion CSS.
- Axe WCAG 2 A/AA and 2.1 AA lab checks report **zero violations**. This is an automated scoped check, not a claim of complete site-wide accessibility certification.
- Desktop/mobile tests pass at 1440/390px for the article and 1100/390px for the lab: no horizontal page overflow and iframe auto-height is bounded and updates. Mobile architecture has a readable text flow instead of shrinking SVG labels.
- The original compact lab's Next/Previous/Reset controls still work at its original URL.
- Video player tests pass: 105–106s duration, native controls, muted playback, pause, chapter seek and loading 35 English caption cues. Narration is synthetic, labeled as such, with burned-in captions and an optional VTT track.
- `npm run typecheck` passes. Final lint has zero errors and the two pre-existing `next/no-img-element` warnings in unrelated portfolio components.
- `npm run test:blog`: 8 of 9 tests pass. Its existing draft/RSS test fails because it assumes this repository contains draft articles; none currently exist. The redesign does not alter those assumptions or publish/unpublish an article to satisfy the test.

## Screenshots

- Desktop: [before](review/before-1440.png), [after](review/after-1440.png), [customer story](review/story-1440.png).
- Mobile: [before](review/before-390.png), [after](review/after-390.png), [customer story](review/story-390.png).
- Customer-first lab: [desktop](review/lab-1100.png), [mobile](review/lab-390.png).
- [Axe report](review/lab-accessibility.json).

## Media and build

The seven scenes use actual speech duration (105.33s), rather than the package's draft 82s. Captions derive from spoken-word timing metadata and match the narration script exactly; punctuation is restored and overlaps removed. First-render stream checks confirm H.264 1080×1920 video and AAC audio. Decoded narration RMS is approximately −20.9 dB with peak 0.788, demonstrating non-silent, unclipped audio. Final render/media checks and the production build are recorded below after completion.

No live payment, external email/warehouse side effect, provider sandbox transaction or benchmark was executed. The attachment's original validation file is retained as source provenance and is not substituted for these checks.

## Final result

- `npm run build` passes, including compilation, TypeScript, all 50 generated pages and trace collection.
- Final MP4: H.264/AAC, 1080×1920, **105.33 seconds**, 5,763,886 bytes. It contains real synthetic English narration and 35 speech-aligned caption cues. Decoded audio RMS −20.91 dB and peak −2.10 dB confirm non-silent, unclipped narration.
- Final-scene text flicker found during visual review was corrected using fixed text columns, PNG frames and higher-quality rendering. The corrected scene was joined at the existing frame boundary without changing the narration/caption schedule. See [final-scene review](review/video-final-scene.png) and [final media report](review/media-qa.json).
- Original lab, original MP4 and original captions have no changes. The local page and test report were shown before pushing. The owner subsequently explicitly authorized commit/push.
