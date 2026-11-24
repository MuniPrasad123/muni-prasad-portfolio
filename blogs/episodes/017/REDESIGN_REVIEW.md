# Episode 017 customer-first redesign

The owner requested the supplied redesign package and the existing portfolio instructions, then explicitly authorized commit and push after completion. The original route, Episode 017 identity, publication date, emerald/gold listing cover, feedback identity and original lab/video assets are preserved.

## Preview

- Article: http://localhost:3002/blog/java21-gc-checkout-latency-diagnosis
- New experiment: http://localhost:3002/blog/episodes/017/diagnosis-lab.html
- New narrated video: http://localhost:3002/blog/episodes/017/lesson-redesign.mp4
- Original experiment: http://localhost:3002/blog/episodes/017/lab.html
- Original video: http://localhost:3002/blog/episodes/017/lesson.mp4

## Shared explanation

Asha experiences a stalled checkout and uncertain payment. Explain the normal workflow and useful purpose of GC, then distinguish a Java pause from the payment service's independent work. The common example is a 2,000 ms request, 500–800 ms GC pause and 900–1,800 ms payment wait. A 300 ms overlapping pause does not explain the whole request. Profile a proven hotspot, change one variable and validate the same workload while preserving payment identity and reconciliation.

The five-case lab compares matching pause/provider evidence, a slow provider without a matching pause, overlapping intervals, a healthy control and a pause from another JVM. It opens at the concrete timeline. Six-step navigation, replay/reset, autoplay/pause, motion control, reduced motion, component explanations, chronological trace, a reachable/unreachable heap picture, percentile explanation, allocation arithmetic and a quiz are included. Hypothetical object counts never alter pause evidence or predict a real collector. Combined interval coverage uses a union, not a sum of overlapping durations; it is explicitly not causal attribution.

The article retains accurate original material and expands Java/Spring examples, version-specific GC flags, same-server evidence, JFR sampling limitations, resource trade-offs, error handling, metric cardinality and payment-safe recovery. No benchmark, employer incident or numerical improvement is invented. SQL is not applicable to this JVM example.

## Video verification

The package preview.mp4 has no audio and is retained only in the source archive. The old public narrated lesson is unchanged. The new independent MP4 is 1080×1920, 30 fps, H.264/AAC, 84.066667 seconds. It uses en-IN-PrabhatNeural Indian English male neural narration, disclosed in the video and player. Twenty-six caption cues use actual speech word boundaries and exact script text; visible captions and the separate VTT share that timing.

Actual decoded audio RMS is −17.50 dB and peak is −1.38 dB: non-silent and unclipped. Stream, duration, exact script, timing and scene-frame checks pass. The actual MP4 loads, plays, pauses and seeks through its chapters in the article; the track exposes all 26 cues. Decoded scene frames were visually reviewed. Voice generation was synthetic; no human recording or subjective listening assessment is claimed.

The first full Remotion export failed in its encoder wrapper after rendering. Recovery preserves caption/scene keyframes, renders heap-state changes, and uses a separate FFmpeg encode with a continuous 30 fps request packet plus actual narration. Frame-indexed image sequences keep caption timing within one output frame; this is not a silent slideshow or a file-existence-only check. The verified replacement was attached only after recovery passed media validation.

Sources: redesign/video/scenes.json, synthesize.py, export-frames.cjs, export_video.py, validate_media.py and video/GcDiagnosisExplainer.tsx. Python authoring requires edge-tts and imageio-ffmpeg in the existing .cache/episode015/python directory; these are not website runtime dependencies. Use `node blogs/episodes/017/redesign/video/export-frames.cjs`, then `py blogs/episodes/017/redesign/video/export_video.py` and `py blogs/episodes/017/redesign/video/validate_media.py` after generating speech.

## Validation

- Production build passes after regenerating stale/malformed Next.js generated type files with the dev server stopped.
- Full lint: zero errors, two pre-existing image warnings. Focused final lint covers the new composition, lab, wrapper and authoring/browser scripts.
- Java 21.0.11: original SKU/quantity and new priced summaries compile and pass tests for totals, decimals, empty input and invalid input.
- Java 21 logging, G1 and generational ZGC flag startup checks pass. No live GC workload or JFR performance recording is claimed.
- Six diagnostic-model tests pass. Full Node suite: 34/35 pass. Existing failure: `production content and RSS exclude every draft` expects at least one draft; there are none. No unrelated draft/test was changed.
- Browser: five cases, instance matching, interval union, six-step navigation, autoplay/pause, keyboard, heap reachability, allocation/evidence independence, quiz, reduced motion, original lab controls, canonical URL, desktop/mobile overflow and iframe auto-height pass.
- Axe lab checks: zero detected WCAG A/AA violations; automated coverage is not a full manual accessibility audit.
- Video-player checks pass against the final replacement.

See review/ for screenshots, media measurements, player results and browser output. The Micrometer service remains an integration fragment: no live registry, authenticated checkout endpoint, provider sandbox, production database or load benchmark was executed.
