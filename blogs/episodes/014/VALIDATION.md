# Episode 014 validation — 19 November 2026

- Five new Node simulator tests pass: nine-step sequence, all eight protected scenarios, version permutations/duplicates/conflicts, truthful unknown/unavailable messaging, durable publisher intent and deterministic Previous/Reset.
- Existing payment/locking checks pass (three tests). Existing outbox tests pass (three tests).
- The full `npm run test:blog` run has one unrelated failure: `production content and RSS exclude every draft` assumes `getArticles(true)` includes at least one draft, but this repository currently contains none. Eight of its nine tests pass. No article was made a draft to satisfy that assumption.
- Automated headless browser: nine steps; eight scenarios × two designs; timed Play, Pause, Previous, Next, Reset and speed; separate motion control; clickable component help; quiz; advanced disclosure anchors; CQRS comparison; keyboard focus; reduced-motion CSS; desktop 1440px and mobile 390px overflow checks. Screenshots stored under ignored `.cache/cqrs-review/` for visual inspection.
- Java 21 standalone comparison example executes successfully. It is explicitly an in-memory algorithm exercise, not the durable consumer implementation.
- Maven Testcontainers package compiles and **all four PostgreSQL/Kafka contract tests pass**, zero failures/errors/skips. Command used on this Docker Desktop 29 engine:

```powershell
$env:DOCKER_HOST=(docker context inspect --format '{{.Endpoints.docker.Host}}')
mvn -B -f blogs/episodes/014/integration/pom.xml '-Dapi.version=1.44' test
```

- The Remotion Episode014 composition bundled and rendered frame 225 successfully. `media/storyboard.png` was visually inspected; the first scene's status cards and visible subtitle fit. Six scenes, 108-second planned duration, 18 draft subtitle cues. No narration or final playable video was generated; see `media/README.md`.
- The in-app browser could not reach localhost; native Chrome connection timed out. An isolated headless browser using the repository's existing Remotion runtime completed the browser checks instead.

- Final `npm run lint`: zero errors; two existing `next/no-img-element` warnings in unrelated portfolio components.
- Final `npm run typecheck`: passes. `git diff --check`: passes.

- Production build **passes** with `npm run build -- --webpack`: compilation, TypeScript, 50 generated pages and trace collection complete. The default Turbopack build stalled in this environment and was stopped; no Next configuration was changed. The generated Episode 014 HTML includes the customer story, active mini-architecture and advanced disclosures.

No production deploy or Git push performed. The pre-existing untracked `public/project-thumbnails/himaja-communication-erp.webp` was left untouched.

## Review adjustment: retain previous simulation window

The original HTML lab is restored from HEAD without content changes and embedded through the shared auto-sizing PracticeFrame. The screenshot's compact side-by-side comparison is again the default. Updated article/customer content stays; the extended React simulator is collapsed by default beneath the original. Article instructions and browser checks were updated to match. Typecheck passes for this adjustment; the full production build above predates this display-only adjustment.

Focused lint and whitespace checks pass. Browser verification confirms the default iframe, collapsed extended panel and original lab Next/Previous/autoplay/Reset controls. The restored window was screenshot-reviewed at `.cache/cqrs-review/restored-lab.png`; extended controls and desktop/mobile checks also pass.
