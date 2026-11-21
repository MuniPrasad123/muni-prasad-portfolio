# Beginner explanation alignment

The owner requested that the article, narrated video and simulator explain the same beginner-friendly problem and the positive benefit of virtual threads. The previous explainer emphasized dependency limits before adequately explaining the thread bottleneck.

## Shared story

| Stage | Article | Simulator | Narrated video |
| --- | --- | --- | --- |
| Customer problem | Asha sees a spinner and timeout | Representative checkout plus thread walkthrough | Scene 1: checkout timeout and occupied platform threads |
| Thread bottleneck | Platform request pool fills while waiting on network responses | Start here, step 2: platform threads remain occupied | Scene 1: new shoppers queue |
| Virtual-thread benefit | Supported I/O pauses a virtual thread, frees its carrier, and later resumes the request | Start here, steps 3–4: reuse carrier; more I/O-heavy work can progress | Scene 2: pause waiting request and reuse the OS thread |
| Conditions and remaining limits | Benefit needs thread contention and spare dependency capacity; CPU work and individual payment duration are unchanged | Start here, steps 4–5, then database/overload branches | Scene 3: dependency capacity remains finite |
| Complete solution | Bounded work, short DB transactions, durable payment identity, deadlines and reconciliation | Eight existing capacity/recovery branches remain | Scenes 4–7: same identity, bounded calls, honest status and recovery |

The article's architecture section shows these three stages explicitly. The simulator defaults to the new five-step beginner walkthrough and retains all eight existing scenarios. Its capacity counters are teaching values, not a throughput benchmark or proof of a virtual-thread speedup.

## Media preservation

The existing lesson-redesign.mp4 and its timeline/captions remain unchanged. The aligned production uses separate lesson-aligned.mp4, timeline-aligned.json, captions-aligned.vtt/SRT and speech-aligned-v2 assets. The article switches to the new media only after stream/audio/caption and visual checks. Narration uses the same en-IN-PrabhatNeural Indian English male voice.

The first longer narration draft exceeded 90 seconds and was rejected. The final encoded MP4 is 88.043 seconds, H.264/AAC, with 26 word-timed caption cues. Decoded audio RMS is −17.81 dB and peak is −2.16 dB (non-silent, unclipped). Actual decoded scenes were visually reviewed. Measurements and player results are recorded in review/media-aligned-qa.json and review/player-aligned-qa.json.

## Validation

- Six model tests pass, including the new beginner walkthrough and no fabricated provider effects.
- Nine-scenario browser validation passes, including existing recovery behaviors, controls, keyboard, quiz, reduced motion, canonical URL, mobile overflow and iframe height.
- Automated lab WCAG A/AA checks detect zero violations.
- Production build and typecheck pass. Lint has zero errors and two pre-existing image warnings.
- Final MP4 loads in the article; play, pause, chapter seeking and all 26 VTT cues pass browser validation. The article's player, poster, captions, summary and seven chapter timestamps now point to the aligned version.

The original redesign review remains the record of the earlier committed version. This follow-up is a local review revision; no publishing action is implied by rendering a preview.
