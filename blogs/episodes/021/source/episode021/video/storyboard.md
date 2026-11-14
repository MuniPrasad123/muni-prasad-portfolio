# Episode 021 — 72-second 9:16 motion explainer

**Production status: NO MP4 GENERATED; NO AUDIO GENERATED.**

Keep all SIX panels on screen in a clean 2×3 grid. Animate inside panels and highlight the active one, never replace the six panels with a spritesheet. Burn readable captions directly into the finished MP4; additionally mux SRT/VTT as optional captions. Use a warm expressive English voice, natural pauses, and quiet original ambient music. Do not use robotic fallback.

00–12s: A shopper cancels after paying. Why did the warehouse still ship the order?
VISUAL: Animate a red parcel packet crossing a refund request; show customer cancellation.

12–24s: The old consumer reads loosely typed status strings. A new event slips through a permissive default.
VISUAL: Zoom into unsafe default branch; show ignored red event.

24–36s: Java twenty-one records validate event data. Sealed interfaces define exactly which event types exist.
VISUAL: Morph status strings into distinct record cards, lock permitted set.

36–48s: An exhaustive switch forces each event variant to be handled when the application is rebuilt.
VISUAL: Highlight four event cards sequentially while all six panels stay visible.

48–60s: But compile-time safety is not distributed safety. Guard state changes with PostgreSQL versions and a transactional outbox.
VISUAL: Animate CAS compare and version increment; move event packet into outbox.

60–72s: Kafka consumers deduplicate and reject stale transitions. The customer sees cancellation pending until refund and fulfillment are resolved.
VISUAL: Move event packets to consumers; show accurate status and reconciliation.

Audio: soft original click on event, quiet alert on invalid transition, subtle whoosh for packets, music -24 LUFS below narration. Narration target around -16 LUFS; inspect and listen to the output before claiming completion.
