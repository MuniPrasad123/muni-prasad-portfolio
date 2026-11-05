# Episode 010 — Video storyboard and exact narration

**Title:** A Valid JWT. Someone Else's Order.
**Format:** Original 9:16 vertical animated explainer, 720×1280, 15 fps. **Target:** 70–90 seconds.
**Voice:** English synthetic narration generated locally with eSpeak. This is audible, but more synthetic/robotic than a professional human voice. Original ambient sound effects only; no copyrighted music.
**Audience:** Java/Spring Boot backend engineers and architects. All tokens and order IDs are fictional.

| Scene | Narration | Motion, graphics and caption |
|---|---|---|
| 1 · The leak | Your shopper logs in. Their JWT is valid. But what if they change the order ID in the URL? One missing authorization check can expose another customer's order. | Mobile shopping card; Alice JWT flows through gateway; order ID flips from A-101 to B-102; red exposure alert. Caption: VALID JWT ≠ OWNERSHIP. |
| 2 · Authentication | Spring Security verifies the signature, issuer, expiration, and audience. Authentication succeeds. But authentication only tells us who is calling. It doesn't prove they own this order. | Animated token fields with green validation checks; zoom to user identity; owner badge remains unresolved. Caption: AUTHENTICATED ≠ AUTHORIZED. |
| 3 · Scope | The token includes orders read scope. That allows a category of operation, not access to every order in the database. A scope check alone cannot prevent BOLA. | Scope key moves into API gate; all orders appear behind separate owner locks; one lock stays closed. Caption: SCOPE IS NOT OWNERSHIP. |
| 4 · Vulnerable query | Here's the vulnerable query: select an order by its ID alone. Alice supplies Bob's ID, and the database returns Bob's private data. The API returns two hundred. That's the bug. | SQL `WHERE id = :id` highlights red; data packet from Bob order travels to Alice; 200 turns red. Caption: ID-ONLY LOOKUP = BOLA. |
| 5 · Secure query | Fix the query by combining the requested order ID with the authenticated token subject and trusted tenant. If the order doesn't belong to the caller, no row matches. | Three condition chips join; query flows to database; mismatch returns zero rows. Caption: ID + SUB + TENANT. |
| 6 · HTTP outcomes | Invalid or expired token? Return four oh one. Valid token without the required scope? Four oh three. Missing or unowned order? This API consistently returns four oh four. | Three stacked response cards 401/403/404 animate with corresponding gates. Caption: FAIL CLOSED AT EVERY LAYER. |
| 7 · Takeaway | For staff access, use explicit audited delegation. Never trust customer IDs from the browser. Test cross tenant requests, leaked UUIDs, and cache boundaries. Valid JWT does not mean authorized order. | Shield forms around order API; audited support access; final four-gate architecture. Caption: AUTHORIZE EVERY OBJECT. |

**Audio cues:** Soft original low-frequency ambient synth, short non-melodic packet pings and denied-access thuds under narration, mixed well below speech. Fade in/out; no musical composition copied.

**Captions:** The package includes scene-level `.srt` subtitles synchronized to the generated narration clips. On-screen scene headline text remains legible without audio. A later professional voice replacement should regenerate subtitle timing.

**Rendering note:** The video is generated from original programmatic diagrams and animations, not static slides. No stock or copyrighted footage is used. If source footage or voice is replaced, preserve timing and verify the new MP4 audio.
