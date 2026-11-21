# Episode 016 — 82-second 9:16 animated explainer

Voice: professional Indian male English, warm, calm, precise; natural pronunciation, no robotic TTS. Captions burned in and checked against recorded audio. Original motion graphics, not static slides.

## Scene 1 (00:00–00:11)
**Voiceover:** A customer taps Place Order during a sale. The screen spins. Payment may have succeeded, but checkout says timeout.
**On-screen caption:** Customer: Payment uncertain
**Animation:** Zoom to customer phone; pulse spinner; provider badge glows amber
**Audio cue:** soft click, subtle pulse

## Scene 2 (00:11–00:22)
**Voiceover:** The checkout service starts many Java virtual threads. They wait efficiently, but the payment provider still has limited capacity.
**On-screen caption:** Cheap threads ≠ extra provider capacity
**Animation:** Animate hundreds of thin request packets toward narrow provider gate
**Audio cue:** soft traffic rise

## Scene 3 (00:22–00:33)
**Voiceover:** Without limits, requests pile up downstream. A database pool with twenty connections cannot serve five hundred queries simultaneously.
**On-screen caption:** Queue moves downstream
**Animation:** Show 500 virtual thread dots funnel into 20 DB slots; counter clearly marked illustrative
**Audio cue:** gentle warning tone

## Scene 4 (00:33–00:45)
**Voiceover:** First, persist one stable payment attempt. Repeated checkout clicks must reuse that identity, not create another charge.
**On-screen caption:** One logical attempt · durable idempotency
**Animation:** Show two clicks converging on one attempt ID in database
**Audio cue:** confirmation chime

## Scene 5 (00:45–00:57)
**Voiceover:** Next, a bulkhead admits only the calls the provider can safely handle. Excess requests get a quick, honest busy response.
**On-screen caption:** Bulkhead protects provider
**Animation:** Animate green accepted packets and amber rejected packets; bounded counter
**Audio cue:** soft gate click

## Scene 6 (00:57–01:09)
**Voiceover:** If the provider times out, mark the outcome unknown. Reconcile using the original reference before any retry.
**On-screen caption:** UNKNOWN → Reconcile → Confirm
**Animation:** Follow provider reference into reconciliation branch; no second charge packet
**Audio cue:** subtle suspense to resolution

## Scene 7 (01:09–01:22)
**Voiceover:** Now the customer sees a reliable order status. Virtual threads improve waiting efficiency; limits, idempotency, and recovery protect checkout correctness.
**On-screen caption:** Efficient threads + bounded capacity + safe recovery
**Animation:** Customer sees order confirmed; three safeguards light up; end card
**Audio cue:** warm resolve

**Export:** 1080×1920, 30fps H.264 MP4 + AAC 48kHz; verify audio stream with ffprobe and manually listen for Indian male accent and intelligibility. Sync burned-in captions to final voice recording. Do not claim rendered until verified.
