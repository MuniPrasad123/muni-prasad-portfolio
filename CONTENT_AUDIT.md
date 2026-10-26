# Portfolio content audit — 25 October 2026

## Sources and precedence
- Latest owner-authored brief: attachment `07d2a141-a89f-4963-b49e-92ef7e8101cc/Pasted text.txt`, plus the owner's section 18 instructions.
- Latest resume: `public/resume/muni-prasad-senior-software-engineer.pdf`; extracted and reviewed during this update. Career chronology, education, the 10+ years / 4+ workflows / 5–6 engineers figures, general technology inventory, and independent project purposes come from this PDF.
- Owner's explicit Kafka and PostgreSQL descriptions support the new Bed Bath & Beyond case studies.
- Owner's MuniAI and HelpCorner descriptions support their specific stacks and HelpCorner AWS component responsibilities.
- Current local implementation, original repository content, and supplied screenshots establish the portfolio's breadth and emerald/gold design.
- The published site at https://www.muniprasad.in/ could not be retrieved with the web tool during this pass. Current live-site content was not independently reverified; supplied screenshots and repository content were used with the latest resume.
- The supplied LinkedIn URL is retained as a destination. It is not treated as independent verification of endorsements or credentials.
- Earlier owner-supplied links define the selected 12 credentials. The original downloaded issuer badge assets are retained. Kibo entries use a plain document icon because an original badge image is unavailable.

## Editorial changes
- Primary identity is now Senior Software Engineer with Java, Spring Boot, Microservices, and Oracle ATG Commerce prominent throughout.
- Home presents positioning, two visitor paths, About, a profile-at-a-glance panel, contribution summaries, recent experience, selected work, and clearly marked draft notes.
- Capabilities are distinct from the organized technology inventory and practical contribution list.
- Professional work, independent applications, and technical blueprints are explicitly labeled. Twelve case studies include individual responsibilities, approach, source-supported validation and outcomes, and optional evidence notes.
- Workflow diagrams are simplified illustrations, not assertions about client production topology. HelpCorner shows documented components without inventing infrastructure connections.
- CV is a factual, readable, printable profile linked to the actual resume PDF. Contact provides direct email/social links and accessible copy-email feedback.
- Recruiter navigation prioritizes experience, selected work, resume, and contact; technical reviewers can move from capabilities to individual case studies.
- Removed invented draft reading times; articles remain unpublished drafts and are excluded from article structured-data claims.

## Claims corrected or constrained
- Removed the conflicting 98% payment-failure reduction, uptime/volume figures, client totals, project totals, and technology-count marketing claims from the active site.
- Retained the three metrics with clear scope: 10+ years of software engineering, 4+ payment/checkout workflows at Bed Bath & Beyond, and 5–6 engineers led and mentored.
- Corrected employer/client treatment, including “Engagement through TCS” for Ilabz. No combined 2013–2023 role is used.
- ATG/JBoss upgrades remain with the Six-Sigma engagement supported by the latest resume.
- Java 21 is specific to MuniAI. OpenAI retrieval/voice features are implemented descriptions for DharmaAI; custom RAG and agents remain roadmap work.
- No throughput, exactly-once guarantees, benchmark percentages, production deployment claims, or test suites were invented.
- No unsupported AWS Developer, Java SE 17 Developer, or Spring Professional certifications appear.
- No credential is labeled Verified solely because its completion status is recorded.
- Removed the CMS default that silently marked new credentials completed; an unset status remains unset. Existing stored records were not changed.
- Relocation wording requires employer-supported visa sponsorship. No foreign work authorization, immediate availability, or notice period is asserted.

## Technology evidence
The inventory uses resume-supported tools plus the owner's explicit Kafka, PostgreSQL, MuniAI, and HelpCorner details. OCI is presented through credentials, not as proven production infrastructure work. React/Angular complement the primary backend positioning.

Candidate items not established by the reviewed sources were omitted: Spring Batch, Spring Security, JPA/Hibernate, Quarkus, Redis, Azure Repos/DevOps infrastructure, GitHub Actions, Cloudflare, SoapUI, SonarQube, JMeter, Flex Microform, SCSS, Bootstrap, Confluence, and specific hexagonal architecture implementations. They can be added when project or career evidence is supplied. No formal PCI/GDPR certification is claimed.

## Credential conflict and missing evidence
The latest brief says the resume lists OCI Architect, OCI AI Foundations, Kafka Fundamentals, Kibo Business Administration, and IBM learning credentials. The actual downloaded latest PDF instead lists IBM Docker, two OpenAI courses, Kibo Business Administration, and Udemy training. The explicit earlier list of 12 credential links is therefore retained as the selected gallery, with categories based on the credential title.

Kibo Business Administration (PDF: issued December 2024, expires December 2026) is not silently equated with Kibo Ecomm or Kibo Developers. Its own issuer/document URL is still needed before adding it to the selected gallery. No new dates or expiry claims were inferred for the 12 linked entries. Kibo original badge images are also missing.

Public source repositories and demos for MuniAI, DharmaAI, HelpCorner, Himaja ERP, and cloud demonstrations were not established. The site does not invent them. Testing claims are limited to documented professional practices; no independent-project test-suite claims are made. The known public portfolio repository is linked, with a note that this local refresh has not yet been pushed.

## Content and CMS architecture
- Active front-end routes import `src/data/profile.ts`, `src/data/site.ts`, and `src/data/engineering.ts`.
- Payload collections and admin/API routes are preserved. Active front-end pages do not fetch Payload records, so production CMS content cannot override these pages.
- The older `PortfolioClient` accepts initial CMS arrays with reviewed local fallback arrays, but current routes do not render that component.
- The former CONTENT_SOURCES.md claim about a `PORTFOLIO_CONTENT_SOURCE=cms` switch was inaccurate and has been removed.
- No production CMS reads/writes, automatic seeds, data migrations, deployment, push, or domain changes were performed. No seed is necessary for the active local content architecture.
- Future CMS wiring should explicitly map project categories, case-study details, credential type and verification URLs; do not revive unreviewed fallback claims.

## Validation
See the final handoff for completed checks. Browser review artifacts are saved under `D:/Workspace/portfolio/preview-review/`. Review covers the requested 320, 390, 768, and desktop widths; final results are recorded after checks complete.

