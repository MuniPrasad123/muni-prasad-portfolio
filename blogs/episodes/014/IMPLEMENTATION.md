# Episode 014 implementation and local review

Existing route: `/blog/cqrs-eventual-consistency-order-status`. Canonical metadata, feedback, navigation and article parsing are preserved. Following review, the original `/blog/episodes/014/lab.html` and its compact embedded simulation window are restored as the default. The new nine-step/eight-scenario simulator is retained in a collapsed optional panel underneath; the updated customer story and article remain.

Before: a short generic incident introduction, four-event HTML comparison, in-memory Java algorithm and generic recovery notes.

After: ₹4,999 sneaker purchase with ORD-101, side-by-side customer screens, CQRS comparison, ten clickable architecture components, nine numbered steps, eight scenarios, unsafe/protected comparison, typed deterministic transitions, live state/trace, keyboard controls, reduced motion, quiz, progressively disclosed Java/PostgreSQL/Kafka implementation, reconciliation runbook, exercises and primary references. Six-scene Remotion rendering package includes a full script and draft synchronized subtitles; narration is pending.

## Source map

- `content/lessons/episode-014/cqrs-eventual-consistency-order-status.md`: published Markdown and unchanged slug.
- `src/components/blog/CqrsLesson.tsx` / `.module.css`: integrated customer story, comparison, architecture, live lab and quiz.
- `src/lib/cqrs-lesson.ts`: typed scenario definitions, transitions, version guard and customer messaging.
- `examples/OrderFlow.java`: annotated Java 21/Spring excerpts; public download mirrors it.
- `public/blog/episodes/014/examples/schema_postgresql.sql`: labeled write/read database tables.
- `integration/`: independently compiled Java 21 JUnit/Testcontainers infrastructure contracts.
- `media/`: revised narration, captions, scene data and render instructions. Historical `source/` materials are retained as archives, not the current implementation.

## Run and validate

```powershell
npm run dev
# Open http://localhost:3000/blog/cqrs-eventual-consistency-order-status
node --test tests/cqrs-lesson.test.ts
npm run test:blog
npm run lint
npm run typecheck
npm run build
# If the default Turbopack runner stalls in this environment:
npm run build -- --webpack
# Existing dev server here uses port 3002; override for a different local port:
$env:CQRS_PREVIEW_URL='http://localhost:3000'
node tests/cqrs-browser.cjs
mvn -B -f blogs/episodes/014/integration/pom.xml test
```

Browser tests use the already installed Remotion headless browser; no frontend dependency added. They exercise nine steps, 8×2 scenario/design combinations, state navigation, play/pause, motion pause, reduced motion, keyboard focus and viewport overflow at 1440px and 390px. Review images are written under ignored `.cache/cqrs-review/`.

The Java infrastructure test uses disposable containers and synthetic order data. It checks Kafka delivery into a PostgreSQL projection, duplicate/stale outcomes, concurrent versions, same-version conflicts and rollback of order/outbox together. It does not compile or test the intentionally incomplete Spring/provider excerpts. Docker and Maven downloads are required. Newer Docker engines may require `-Dapi.version=1.44` when using this Testcontainers release.

## Limits

The browser is a deterministic teaching model, not a broker or database. Read-side status snapshots contain status/version only. Additional fields must join the equal-version conflict comparison; side effects require their own durable protection. Delta events require gap recovery. Java excerpts omit imports, bean wiring, provider SDK, serializers, auth and operational adapters. Preserve the stored confirmation event or an independent payment receipt if pruning the outbox; the illustrated idempotent callback retrieves its existing event there. No benchmark or employer incident is claimed.

Validation results and any environment limitations are recorded in `VALIDATION.md`. No production deployment is part of this change.
