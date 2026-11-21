# Episode 016 customer-first redesign

Status: preview prepared locally. The owner subsequently authorized commit and push after completion. No separate hosting deployment is performed by this task.

## Review links

- Article: http://localhost:3002/blog/java21-virtual-threads-checkout-bulkheads
- New lab: http://localhost:3002/blog/episodes/016/capacity-lab.html
- Original lab: http://localhost:3002/blog/episodes/016/lab.html
- New video: http://localhost:3002/blog/episodes/016/lesson-redesign.mp4
- Original video: http://localhost:3002/blog/episodes/016/lesson.mp4

## Content and interactions

The original URL, title, cover, comments/likes identity and original simulation assets are preserved. The explanation begins with Asha's slow checkout and uncertain payment, separates cheap virtual-thread waiting from finite database/provider capacity, and follows bounded admission, real HTTP deadlines, durable operation identity and authoritative reconciliation. UNKNOWN does not trigger fulfillment; only verified confirmation creates a confirmation outbox intent.

The new lab has eight scenarios, independent demand/provider/waiting/DB controls, Previous/Next, autoplay/speed, motion pause, keyboard controls, component inspection and a quiz. Its counters describe a constructed burst, while its payment state follows one representative attempt. No live provider calls or benchmark results are implied. The original lab remains in a disclosure.

The Java bulkhead limits both admitted and active operations without an internal unbounded executor. Its permit remains held until local work actually exits. A separate HTTP adapter has transport deadlines and original-reference lookup. Database transactions must be short and outside provider I/O. Per-JVM semaphores do not implement distributed quotas or durable idempotency.

## Video production

Seven original Remotion scenes use moving request packets, a checkout spinner, before/after dependency flows and payment recovery. The separate 1080×1920 H.264/AAC MP4 is approximately 83.65 seconds at 30 fps. Microsoft `en-IN-PrabhatNeural` is an Indian English male neural narrator, not a human voice recording. Twenty-four visible caption cues use the synthesizer's word timing and exact script punctuation; a matching VTT is supplied for the player.

Source: `redesign/video/scenes.json`, `synthesize.py`, `validate_media.py`; composition: `video/VirtualThreadsExplainer.tsx`. `timeline.json` retains speech timing. The quiet generated music bed is ducked beneath speech. Actual decoded PCM is checked for non-silence and clipping, and decoded scene frames are reviewed for text and caption layout. See `review/media-qa.json` for the measured final stream results.

## Validation

- Java concurrency tests: active/waiting bounds, rejection before execution, failure cleanup, waiter timeout, interruption and caller-timeout permit retention pass.
- Java local HTTP deadline then authoritative original-reference lookup passes, with one constructed provider effect.
- Five capacity-model tests pass, including capacity invariants and deterministic scenario reconstruction.
- Browser validation passes eight scenarios, slider accounting, timeout/permit/retry behavior, navigation/playback/reset, quiz, keyboard operation, reduced motion, original lab controls, canonical URL, desktop/mobile overflow and iframe auto-height.
- Axe WCAG A/AA lab checks: zero detected violations. This is automated coverage, not a full accessibility audit.
- Typecheck passes. Lint has zero errors and two pre-existing image warnings.
- Full Node suite: 27 of 28 pass. The existing `production content and RSS exclude every draft` test expects at least one draft, but this repository currently has none. No draft was fabricated to satisfy it.

Production build passes. The final encoded media is 83.648 seconds, H.264/AAC, with decoded RMS −17.86 dB and peak −2.12 dB. Twenty-four captions match the spoken script and word-timing metadata. The single-worker render recovered from one browser crash; its completed MP4 was decoded and reviewed after encoding. The original video is not overwritten. Player results are in review/player-qa.json.

## Practical limits

SQL and Spring wiring are illustrative; no production database, payment-provider sandbox, distributed admission service, end-to-end authenticated payment coordinator or load benchmark was executed. The HTTP test uses a local constructed provider. Voice quality and storytelling can be reviewed in the playable preview before approval. Future episodes inherit the customer-first and verified Indian male English narration standard in PORTFOLIO_GUIDELINES.md.

## Reproduce

Run `npm run typecheck`, `npm run lint`, `npm run build`, `node --test tests/*.test.ts` and `node tests/capacity-browser.cjs`. Compile the four Java example/test classes with Java 21 and `--add-modules jdk.httpserver`; run PaymentBulkheadTest and DeadlinePaymentClientTest.

Render with `npx remotion render video/index.tsx Episode016 OUTPUT.mp4 --codec=h264 --image-format=png --crf=18 --concurrency=1 --gl=angle --disallow-parallel-encoding --overwrite`. Run `redesign/video/validate_media.py` using the documented cached Python dependencies. Rendering and speech synthesis are local authoring steps; deployment requires separate user approval.
