# Episode 017 product-search alignment — local review, 25 November 2026

The canonical slug remains `java21-gc-checkout-latency-diagnosis`. The current article, opening context, cover, primary interactive lab, narration, visible video captions and chapters use product search and Java 21 Generational ZGC. Previous media and the original checkout-based lab remain archived, accessible separately.

The shared illustrative evidence is a 2,000 ms search, a 300 ms same-JVM pause at 500–800 ms and an inventory wait at 900–1,800 ms. The young-generation picture reclaims six unreachable young objects while preserving three reachable young objects and three reachable old objects. No measured performance improvement is claimed.

## Verification

- TypeScript typecheck and focused ESLint: passed.
- Six diagnosis-model tests: passed.
- Five lab scenarios, interval union, wrong-JVM filtering, navigation, autoplay/pause, keyboard, allocation controls, heap collection, quiz, reduced motion, responsive sizing and original archived lab: passed.
- Lab accessibility: zero tested WCAG A/AA violations.
- Browser video playback, chapter seeking, caption loading and article title/context: passed.
- Java 21 example compilation and executable correctness checks: passed.
- MP4: 1080 × 1920, 30 fps, H.264 + AAC, 89.466667 seconds. Decoded narration RMS −17.49 dB, peak −2.03 dB. Indian English Prabhat neural voice. 29 non-overlapping cues timed from spoken-word metadata. Decoded scene previews inspected.
- Standard blog suite: 8 passed, 1 existing failure. `production content and RSS exclude every draft` assumes at least one draft exists (`assert.ok(drafts.length)`), but this repository currently has none. No draft was added merely to satisfy that assertion.

Local preview: http://localhost:3002/blog/java21-gc-checkout-latency-diagnosis

The owner approved committing this local revision on 25 November 2026. Push and deployment remain pending. Review artifacts are under `.cache/episode017/review`; media validation details are in `search-media-qa.json` there.
