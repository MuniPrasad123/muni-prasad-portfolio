# Episode 014 video package

Status: **pending narration and final media review**. No narrated MP4 exists and the article intentionally exposes no player or Watch Video button. The old `../source/` storyboard is historical; use this package for the revised lesson.

The scene definitions in `scenes.json` drive `video/CqrsExplainer.tsx`: six animated 18-second scenes, total 108 seconds at 30 fps, 1600 × 1000. `voiceover.md` is the complete natural-English script. `captions.vtt` has 18 draft six-second cues; visible captions are also rendered from the same scene text. These timings match the storyboard, **not yet recorded speech**.

From the repository root (PowerShell):

```powershell
node blogs/episodes/014/media/prepare.cjs
# A simple temporary path avoids Webpack's rejection of sandbox paths containing !.
New-Item -ItemType Directory -Force .cache/tmp | Out-Null
$env:TEMP=(Resolve-Path .cache/tmp).Path
$env:TMP=$env:TEMP
npx remotion studio video/index.tsx
npx remotion still video/index.tsx Episode014 blogs/episodes/014/media/storyboard.png --frame=225
# SILENT PREVIEW ONLY, clearly watermarked as narration pending:
npx remotion render video/index.tsx Episode014 .cache/episode014-silent.mp4
```

Record a friendly senior-architect narration following `voiceover.md`, roughly 140 words/minute. Leave natural pauses within each scene. Review pronunciation of CQRS, PostgreSQL, ORD-101, INR amounts and version numbers. Add the approved local narration as `public/blog/episodes/014/narration.wav` and render:

```powershell
npx remotion render video/index.tsx Episode014 .cache/episode014-review.mp4 --props='{"voiceover":"blog/episodes/014/narration.wav"}'
```

If speech does not fit the draft cues, adjust both scene timing and caption cues before release. Inspect all six scenes on desktop and mobile for clipping and caption readability, check audio/caption synchronization and verify the exact final duration. The narration prop removes the pending watermark; supplying an audio file is not evidence of quality approval.

After review, place the final MP4 and aligned VTT under `public/blog/episodes/014/` and set article `video`, `videoCaptions`, `videoPoster` and `videoCaption` metadata. The existing shared `LessonVideo` supplies native play/pause, independent mute/volume and captions. Keep these metadata absent until real playable media has been inspected. Never present the silent preview as narrated media.
