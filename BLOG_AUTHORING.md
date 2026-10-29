# Writing and publishing the technical blog

## Current architecture

The portfolio remains a Next.js App Router + React + TypeScript app, using npm and Payload CMS. Blog content is repository-based Markdown, not database content. Marked parses Markdown on the server; sanitize-html removes unsafe markup; highlight.js renders code highlighting on the server. Small client components handle search, copying and simulations. No Markdown executes JavaScript.

- `content/lessons/*.md`: articles and validated frontmatter.
- `src/lib/blog.ts`: content inventory, draft policy, rendering, RSS.
- `src/components/blog/`: interactive lab, article and video components.
- `src/app/(frontend)/blog/`: index, article routes and social PNGs.
- `src/app/rss.xml/route.ts` and `src/app/sitemap.ts`: published articles only.
- `video/index.tsx`: reusable Remotion video, carousel and thumbnail.
- `content/lessons/*.media.json`: optional storyboard and social hooks.

The Blog link exists in the shared desktop/mobile navigation. `/learn/rate-limiting` redirects to the canonical `/blog/rate-limiting-shopping-apis` route. Four old notes were migrated as drafts rather than deleted.

## Your daily workflow

Share the ChatGPT Markdown/text, images, video, and any reference links in this chat. I can turn that material into a draft, check technical claims, integrate any relevant simulator, and show a local preview. Publishing is a separate explicit step: new articles are reviewed before publication.

1. Create `content/lessons/my-article.md`. The filename must match the slug.
2. Put images/video under `public/blog/my-article/`; use paths starting `/blog/` in frontmatter.
3. Use the template below. Keep dates quoted and use real publication/update dates.
4. Run `npm ci` (Node 22.18+ or Node 24), then `npm run dev -- --port 3002`.
5. Preview `/blog/my-article`. Drafts are visible only with `npm run dev`.
6. Run `npm run test:blog`, `npm run typecheck`, `npm run lint`, and `npm run build`.
7. When approved, change `draft: true` to `draft: false`; update the date. Commit on a review branch and push that branch to GitHub for a Vercel Preview Deployment.
8. Check the preview, direct article refresh, mobile navigation, code copy, video, canonical and sharing image. Merge into the Vercel production branch only after approval. The connected Vercel project then builds the site. This guide does not assume its production branch settings have been independently verified.

```yaml
---
title: "A clear technical title"
description: "What the reader will understand or be able to try."
slug: "my-article"
date: "2026-10-26"
updated: "2026-10-26"
tags: ["Java", "Spring Boot"]
cover: "/blog/my-article/cover.svg"
coverAlt: "A meaningful description of the illustration"
draft: true
sample: false
level: "Practical guide"
# Optional:
# simulation: "rate-limiting"
# video: "/blog/my-article/lesson.mp4"
# videoPoster: "/blog/my-article/poster.jpg"
# videoCaption: "45-second walkthrough · captions on screen"
---
```

Use `##` and `###` headings for the automatic table of contents. Fenced code blocks should name the language, for example `java`, `sql`, `json`, `bash` or `http`. Unknown languages remain readable plain text. Markdown tables are supported. Raw HTML is displayed as text rather than executed. Article metadata, canonical URLs, BlogPosting JSON-LD, related articles, PNG social previews, RSS, and sitemap entries are generated automatically.

Drafts return 404 in production, are excluded from production lists and related articles, and never enter RSS/sitemap. A non-main Vercel Preview build also runs in production mode, so drafts remain hidden there: set `draft: false` on your review branch to review its deployable form. Files in `public/` are always public assets, including draft assets; never place confidential material there. Dates are descriptive, not an automatic scheduler. The sample article is `sample: true`, `draft: false`, and explicitly educational.

## Article structure

Every article must explain the real-world problem before introducing a technology, code example, video, or simulator. Use this order:

1. **Situation:** a concrete scenario readers recognize.
2. **User impact:** who is affected and what they experience (slow checkout, missing notifications, confusing errors).
3. **Cause:** explain the technical mechanism in plain language.
4. **Solution:** show where the change fits and how it addresses that cause.
5. **Walkthrough:** use a small example, diagram, code, or interactive model, and explain what each result means.
6. **Limits and trade-offs:** explain what remains unsolved and when the approach is unsuitable.
7. **Validation:** explain what to measure or test to know whether the user problem improved.
8. **Takeaways and references:** connect the technical lesson back to the user outcome.

Carry the same problem → impact → solution story into the article preview, video storyboard, and social post. If interactive media appears above the full text, show a short problem-and-solution introduction before it. Do not start with unexplained algorithms or tools. Apply this checklist to existing drafts before publishing them. Label illustrative figures, proposed architecture, pseudocode, and unverified claims accurately. Do not turn generated prose into supposed employer experience or performance results.

For interactive lessons, use a tested model in `src/lib/`, connect it to the lesson component, and add the allowed simulation key to the content loader. Ordinary articles need no simulation. The first lesson has a visible video section, animated request flow, adjustable bursts, two algorithms, virtual time controls, a timeline and a quiz.

## Vercel configuration

Use the existing Next.js framework preset, npm lockfile, `npm run build`, and default Next output. Do not add an SPA fallback rewrite or `output: export`; those would conflict with existing Payload routes. Keep the existing database and Payload secrets in Vercel environment settings. Set `NEXT_PUBLIC_SITE_URL=https://www.muniprasad.in` for canonical URLs (the code also defaults to it). Choose a supported Node version, such as Node 24. Content files are explicitly included in server file tracing; article pages are generated by `generateStaticParams` and also resolve server-side. Direct article navigation and refresh do not depend on client-side routing.

RSS: `/rss.xml`. Sitemap: `/sitemap.xml`. Article social image: `/blog/<slug>/opengraph-image`.

## Video, carousel and social export

The supplied ZIP contained a 720×1280, 14-second silent MP4, now at `public/blog/rate-limiting/reference-animation.mp4`. There was no HTML prototype or narration in the ZIP. The supplied video is used in the article; the new Remotion source is a separate 45-second educational presentation with on-screen captions and no audio.

```powershell
npm run blog:prepare -- rate-limiting-shopping-apis
npm run video:studio
npm run video:render -- out/publishing/rate-limiting-shopping-apis/lesson.mp4 --props=out/publishing/rate-limiting-shopping-apis/video-props.json
npm run video:carousel -- out/publishing/rate-limiting-shopping-apis/carousel-1.png --props=out/publishing/rate-limiting-shopping-apis/slide-1.json
npm run video:thumbnail -- out/publishing/rate-limiting-shopping-apis/thumbnail.png --props=out/publishing/rate-limiting-shopping-apis/video-props.json
```

Video: 1080×1920, 30 fps, 45 seconds. Carousel: 1080×1350; render each `slide-N.json`. Thumbnail: 1200×630. The first render downloads Remotion's rendering browser. Render exports locally, not during the Vercel build. `out/` is ignored by Git. To publish a chosen export, copy it into `public/blog/<slug>/` and update frontmatter.

`blog:prepare` also generates a content inventory, storyboard, a DEV Community Markdown adaptation (`published: false` with a canonical link), and LinkedIn teaser text. It does not post to external services. Add a `<slug>.media.json` with scenes and social hooks for the next lesson. Batch preparation can run the same command once per slug. Review Remotion's license for your usage before commercial/team video production; no paid services are configured.

## Release checks

A local production build and route checks are required before merging. Run `npm audit` too: the existing dependency tree currently reports advisories in Next.js/Payload and in development tooling. These are documented in `BLOG_REVIEW.md`; a successful build does not resolve those security advisories. Do not treat this content change as a dependency-security sign-off.

Unfinished topic notes belong in `content/ideas/`, not `content/lessons/`. Only complete articles or reviewable episode drafts should enter the blog inventory.

## Title convention for every new article

Lead with the technical concept readers will learn, then its practical context or problem. Use clear titles such as "Rate Limiting in Shopping APIs", "Transactional Outbox in Spring Boot and Kafka: Reliable Order Events", and "Payment Idempotency in Spring Boot: Handling Timeouts and Retries". Keep cover headings aligned with that concept. Use incident-style questions as opening hooks inside the article, not as the only title. Apply this convention to all future episodes and imported publishing packages.
