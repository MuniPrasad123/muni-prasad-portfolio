# Muni Prasad portfolio and technical blog preferences

These preferences were requested by the owner. Apply them to future work in this project, and carry this file into any new portfolio project created from it. A newer explicit user instruction takes priority.

## Professional identity

- Use the name **Muni Prasad K**, without a trailing period, and the role **Senior Java Backend Engineer**.
- Lead with Java, Spring Boot, Microservices, and Oracle ATG Commerce. Include React.js, AWS, PostgreSQL, and practical AI work where supported by the actual project evidence.
- Preserve the emerald-and-gold portfolio identity. Do not reposition the owner as a cloud or DevOps specialist or invent projects, results, metrics, or infrastructure.
- Avoid resume-style repetition. Explain capabilities through concrete work and individual contributions. Keep the resume download and international-availability statements removed unless the owner requests them again.

## Explain every lesson from a real-world problem

1. Begin with what a shopper or other real user experiences and why it matters.
2. Describe the normal successful workflow before the failure. Separate completed business actions from delayed notifications, read models, and UI updates.
3. Explain the specific failure sequence and root cause in plain language. Define unfamiliar terms before relying on them.
4. Show how each part of the solution prevents or recovers the failure, including trade-offs and what happens if recovery cannot complete.
5. Connect code and diagrams to that explanation. Keep technical claims accurate and label simulations and illustrative designs clearly. Do not imply an example is a real employer incident.
- Use concept-first article titles that tell readers what they will learn.
- Proofread spelling, grammar, terminology, and consistency between the article, UI labels, and simulation.
- Example: a delayed PAID event does not mean the payment is delayed. In the Kafka ordering lesson, checkout has already confirmed payment; a separate tracking read model can later regress because it processes an old notification after a newer one.

## Architecture in Motion narration and delivery standard

- For Episode 016 and upcoming episodes, lead with what the customer sees, then the normal workflow, failure sequence, root cause, protection and recovery. Preserve accurate existing content, canonical URLs, comments and working interactions.
- Produce original animated vertical 9:16 explainers, normally 60–90 seconds, with a natural, professional **Indian male English** voice. Clearly disclose synthetic narration when used; do not substitute a different accent or a robotic voice and claim the standard is met.
- Include moving architecture components/request packets and readable visible English subtitles synchronized to the actual speech. Verify the rendered MP4's audio/video streams, audible non-silent narration, caption timing, content and visual legibility. Do not call a silent storyboard a narrated video or claim completion when generation fails.
- Preserve existing playable media until its replacement is verified. Show article and video previews and test results before deployment. Deploy, commit or push only within the owner's current authorization; a prior episode's publishing approval is not standing approval for a later episode.

## Simulation design

- Use the navy simulation palette demonstrated in the Saga reference: a gradient from #102137 to #0b1729, #0a192a inner panels, soft blue borders, teal actions, warm gold highlights, and readable off-white text. Keep the surrounding portfolio emerald and gold.
- Prefer compact controls above a two-column desktop layout: architecture and current-step explanation on one side; customer-visible state and event trace on the other. Stack naturally on mobile without tiny text or horizontal overflow.
- Use meaningful component icons, clickable explanations, and a clear highlight for the components involved in each step.
- Include purposeful GIF-like event movement and receiver feedback. Clearly distinguish a visual replay from actual simulation processing; animation loops must not increment business counters.
- Provide working Next, Previous, Reset, autoplay/pause, and motion pause controls where applicable. Honor reduced-motion preferences.
- Keep the progress indicator, counters, event labels, outcomes, and chronological trace synchronized with the current step. Explain why each event is applied, held, ignored, or rejected.
- Let readers compare unsafe and protected behavior with the same events. Include failure, recovery, replay, and healthy scenarios when relevant.
- Give the event trace enough height to read several steps: Episode 011 currently uses 360px desktop and 280px mobile, with scrolling. Adjust to content rather than enforcing these dimensions everywhere.

## Space, accessibility, and content structure

- Keep every blog listing cover emerald and gold, including the soft emerald circular background motif. Do not use navy or blue cover backgrounds on `/blog`; navy remains appropriate inside interactive labs.

- Use screen space wisely. Avoid oversized sparse covers, repeated headings, and unnecessary full-screen sections. Prefer short problem/solution panels with useful content.
- Embed HTML labs with the shared `PracticeFrame` component and `/blog/episodes/practice-frame.js` height reporter. Size to actual content and remeasure after interactions or viewport changes; do not reserve a fixed 1,200px frame that leaves a large blank gap or clips taller labs.
- Keep essential explanations readable even if motion is paused. Use visible focus, labeled controls, adequate contrast, comfortable touch targets, and accessible state feedback.
- Keep numbered episodes in their original sequence. The public blog opens with topic folders; repository content remains organized by episode for future authoring.
- Preserve the supplied lesson video when relevant, but do not add video transcript sections or transcript links to blog posts.
- Preserve working likes/comments and visitor analytics. Never expose secrets or change an unrelated project's database connection; portfolio feedback uses its dedicated Neon configuration.

## Delivery workflow

- Work economically: make focused checks for the changed content and interactions. Avoid broad regression suites for routine editorial or visual changes unless a concrete issue requires them.
- Verify the local rendered result and relevant controls, then report what changed and provide a preview.
- When the owner requests local changes for review, do not commit or push until approved. The current Kafka editorial, layout, animation, and theme refinements are local-review work.
- Honor the owner's publishing instructions for each task; a previous general publishing preference does not override a newer local-only request.

