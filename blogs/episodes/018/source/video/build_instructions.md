# Production video build
No narrated MP4 is included in this package because a pleasant, non-robotic narration engine was not available and voice quality cannot be verified. Do not label a robotic voice as final.

1. Record `voiceover.txt` with a natural human narrator, or use licensed high-quality neural TTS; listen and correct technical pronunciation.
2. Animate six fixed panels from `diagrams/poster.svg` following `storyboard.md` at 1080×1920, 30 fps, 70 seconds. Show every panel throughout; highlight only the active operation.
3. Mix speech at consistent loudness, optional quiet music and subtle effects. Avoid clipping.
4. Burn `captions.srt` into video using FFmpeg `subtitles=` filter, with readable safe-area positioning. Also include the sidecar VTT.
5. Verify audio with `ffprobe -show_streams`, listen to full video, watch all captions, check synchronization and export H.264/AAC MP4.
