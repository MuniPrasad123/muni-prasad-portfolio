# Narrated MP4 production instructions

No narrated MP4 is included. A natural-sounding TTS service was not available in this run. The local `espeak` voice is unsuitable for the requested pleasant professional narration, so it was intentionally not used.

1. Record or synthesize `VOICEOVER.txt` with a natural English narrator, preserving the exact technical distinctions.
2. Render 7 vertical 1080x1920 motion-graphic scenes using `STORYBOARD.md` and `assets/poster.svg` as the visual palette. Animate request packets, customer email counters, and inbox/state/outbox database commits; never use static slides.
3. Align actual audio waveforms to scenes; revise `captions_draft.srt` to match the final spoken timing.
4. Mix subtle music at least 18–24 dB below dialogue and duck during speech. Use light event cues only.
5. Render H.264 video and AAC audio, burn in captions, and also ship an accessible SRT.
6. Validate `ffprobe -show_streams final.mp4`: must contain a video stream and an AAC audio stream. Listen for intelligibility and check caption sync before publishing.
7. Embed `final.mp4` in the blog after it exists. Do not display a broken video placeholder.
