# Episode 015 — customer-first redesign review

Preview: http://localhost:3002/blog/payment-webhook-idempotency-inbox-outbox

Status: preview prepared locally. In a follow-up on 20 November 2026, the owner requested committing and pushing once checks finish. No direct production deployment is performed by these instructions.

## What changed

Before: a technical introduction, the existing two-scenario comparison and a 69-second supplied video. After: Maya's $120 purchase and repeated confirmation screens; explicit separation of payment charges, notification deliveries, actual success transitions and downstream intents; seven working customer-first failure scenarios; a compiled transaction example and new narrated motion graphics. The original title, slug, canonical route, article identity, likes/comments, navigation and original lab URL remain. The original compact comparison is available under a disclosure beneath the new lab. The existing MP4 and captions are retained; the new player uses separately named assets after media validation.

All supplied files were read and are preserved under `redesign/`. The attachment's README and VALIDATION describe the package author's earlier checks, not checks performed for this integration. `redesign/ARTICLE.md`, `index.html`, draft captions and original poster remain the unmodified reference package. The integrated lab corrects its unsafe "state transitions = 3" counter: there are repeated processing/side-effect attempts but only one real success transition. The article avoids promising exactly-once external emails or shipments.

## Implementation

- `src/components/blog/WebhookLessonWindow.tsx` and its module CSS: customer screens, three protections, responsive architecture and sandboxed `PracticeFrame` embeds.
- `public/blog/episodes/015/customer-lab.*`: new lab UI, seven scenario buttons, Previous/Next/Play/Pause/Reset/speed, separate visual motion control, clickable components, live metrics, trace and quiz.
- `public/blog/episodes/015/webhook-model.js`: deterministic shared browser/Node state transitions. No live provider, database or delivery integration exists in the browser.
- `public/blog/episodes/015/examples/`: compiled Spring/JDBC acceptance sample, PostgreSQL schema and the package's explicitly in-memory single-payment Java exercise.
- `blogs/episodes/015/integration/`: isolated Java 21 JUnit/Testcontainers checks compiling the downloaded service itself. Explicit transaction-manager tests exercise actual SQL; provider HTTP/proxy configuration remains an application responsibility.
- `video/WebhookExplainer.tsx`: seven animated scenes driven by speech-aligned `timeline.json`. New MP4, PNG poster, MP3 scene narration, VTT/SRT and speech-boundary JSON live under `public/blog/episodes/015/`.
- `eslint.config.mjs`: ignores `.cache/` so generated renderer bundles and optional QA tools are not linted as application source.

## Exact local commands

```powershell
npm run dev -- --port 3002
node --test tests/webhook-lesson.test.ts
java public/blog/episodes/015/examples/WebhookStateMachine.java
npm run lint
npm run typecheck
npm run test:blog
npm run build

# PostgreSQL tests (Docker must be running):
$env:DOCKER_HOST=(docker context inspect --format '{{.Endpoints.docker.Host}}')
mvn -B -f blogs/episodes/015/integration/pom.xml '-Dapi.version=1.44' test

# Browser and accessibility checks, using the existing Remotion browser runtime:
npm install --prefix .cache/episode015/tools axe-core --ignore-scripts
node tests/webhook-browser.cjs
```

## Video reproduction

The new narration is synthetic English, `en-US-GuyNeural`. The first requested voice returned no audio; Guy succeeded. Its actual speech requires approximately 105 seconds, so the draft 82-second schedule was expanded rather than accelerating or clipping narration. Word-boundary timings come from the synthesized speech. Punctuation is restored from the exact script, groups are kept short, and overlaps are clamped. The same cues drive burned-in captions and the VTT/SRT tracks. No speech-service credentials are stored or required by these scripts.

```powershell
py -m pip install --target .cache/episode015/python edge-tts imageio-ffmpeg
py blogs/episodes/015/redesign/video/synthesize.py
New-Item -ItemType Directory -Force .cache/episode015/tmp | Out-Null
$env:TEMP=(Resolve-Path .cache/episode015/tmp).Path
$env:TMP=$env:TEMP
npx remotion render video/index.tsx Episode015 public/blog/episodes/015/lesson-redesign.mp4 --codec=h264 --crf=20 --image-format=png --gl=angle --concurrency=1 --disallow-parallel-encoding --overwrite
py blogs/episodes/015/redesign/video/validate_media.py
```

Generated media must be reviewed before publishing. The shared player retains native pause/seek/fullscreen, mute/volume and optional captions, with a burned-in readable caption layer. Narration is clean speech without an additional music bed. Caption synchronization is checked against synthesis metadata; final human listening review remains part of this local preview approval.

## Evidence and limits

Before/after desktop/mobile screenshots and the lab accessibility report are in `.cache/episode015/review/`. The final test report records exact outcomes. Browser state tests cannot establish database durability. The eight real PostgreSQL tests cover duplicate IDs, lost ACK after commit, distinct IDs, concurrent replicas, wrong merchant/checkout terms, outbox rollback, conflicting same-ID bodies and preservation of REFUNDED with a durable repair candidate. The generic HMAC test fixture is not any real provider's signature protocol. No live payment-provider test or production benchmark is claimed.

The example scopes payment and event identities by trusted provider/account. Production adapters must follow the actual provider's signature, timestamp, account, key-rotation and event-identity contracts. External destinations need stable idempotency keys or explicit reconciliation for ambiguous sends. Inbox retention, queue leases, retry budgets and operational alert thresholds must be designed for that integration.
