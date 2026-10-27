# Blog implementation review

Prepared for the review branch feature/interactive-technical-blog. Production main is unchanged; no production deployment or external social publication is authorized by this change. A branch push may create a Vercel preview.

## Main changed paths

- `content/lessons/`: one sample educational article, four migrated drafts, first media storyboard.
- `src/lib/blog.ts`, `src/lib/rate-limit.ts`: validated Markdown pipeline and deterministic limiter models.
- `src/components/blog/`, `src/components/site/BlogIndex.tsx`: reading, video, copy-code, simulation, filtering and search UI.
- `src/app/(frontend)/blog/`, `blog.css`, `learn/rate-limiting/`: article routes, PNG OG images, lesson alias and responsive styling.
- Shared frontend layout, home and sidebar now use article summaries instead of hard-coded draft links.
- `src/app/rss.xml/`, `src/app/sitemap.ts`, `next.config.ts`: feed, published sitemap and content tracing.
- `public/blog/`: original cover graphics, supplied MP4 and extracted poster.
- `video/`, `scripts/prepare-article.ts`, `tests/blog.test.ts`: publishing templates, local exports, model/content tests.
- `package.json`, `package-lock.json`, `tsconfig.json`: Markdown/render dependencies and validation/export commands.

## Security follow-up before a production release

The npm audit on 2026-10-26 reports pre-existing critical advisories in the installed Next.js 16.2.9 / Payload dependency tree. It recommends a newer Next 16 release and compatible Payload updates. Remotion's development toolchain also has transitive advisories; its suggested automated fix is a version downgrade, so do not blindly apply `npm audit fix --force`.

Markdown is sanitized and cannot execute scripts or MDX. These controls do not fix framework or CMS vulnerabilities. Keep this change in review until dependency upgrades are assessed and verified. The complete local audit is in ignored `out/dependency-audit.json`. No secrets or CMS configuration were replaced.

## Content boundaries

The sample uses illustrative requests, not personal or employer metrics. The Java class is explicitly a single-process teaching model; the Spring Boot boundary is labeled pseudocode. The supplied MP4 is 14 seconds and silent, rather than the narrated 1:28 example in the screenshot. The new Remotion composition is an independent captioned 45-second export with no narration.

## Verification — 2026-10-27

- All six blog/model/security tests passed.
- ESLint completed with zero errors and two existing image warnings in GitHubHighlights.tsx and Projects.tsx.
- Optimized Next.js production build and TypeScript checks passed; 31 static pages generated.
- Local production HTTP checks: blog/article/video/OG image/feed/sitemap return 200; unknown and draft articles return 404; lesson alias returns 308.
- Draft article slugs are absent from the production RSS and sitemap.
- Browser checks: tag/title filtering, video playback, fixed-window and token-bucket behavior, quiz, copy-code feedback, and mobile layout. At 390px, document width matches the viewport with no horizontal overflow.
- Local Remotion export verified as 1080×1920, 45 seconds, silent; 1080×1350 carousel rendered and visually inspected. Generated publishing outputs remain in ignored out/publishing/; source templates and the supplied article video are tracked.

Publishing remains a separate release step after reviewing dependency advisories and approving the sample article. See BLOG_AUTHORING.md.
