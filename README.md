# Muni Prasad K — Senior Developer Portfolio

This repository contains the source files for the premium, enterprise-level dark technology portfolio of **Muni Prasad K**, Senior Software Engineer &amp; Technical Consultant.

The design utilizes custom CSS grids, modern glassmorphic cards, custom inline SVGs (for system topology maps and checkout workflows), scroll reveals, and responsive mobile-first views without relying on heavy frontend frameworks or build steps.

---

## Technical Features

- **Responsive Header & Navigation**: Fluid scrolling with active window-shrink glassmorphism trigger.
- **Incremental Stats Counter**: Interactive counters (for years of experience, enterprise integrations, and skill competencies) that trigger automatically when scrolled into view.
- **Custom Interactive Architecture Diagram**: An inline responsive SVG illustrating a typical enterprise e-commerce backend workflow (Storefront $\rightarrow$ Edge CDN $\rightarrow$ Java core $\rightarrow$ database and downstream APIs).
- **Career Timeline Tracker**: Vertical timeline line that scales dynamically using scroll progression math.
- **Structured Case Study Grid**: 6 dedicated cards framing problem statements, developer roles, tech stacks, and project outcomes.
- **Certifications Roadmap**: Tracking completed and targeted credentials with custom mock SVG badge holders.
- **Resume Preview**: Styled simulated layout illustrating resume sections with download triggers pointing to `assets/Muni-Prasad-Resume.pdf`.
- **Copy-to-Clipboard Action**: One-click clipboard copy with animated feedback notifications.
- **Accessibility Enhancements**: Full semantic tags hierarchy, descriptive `aria-*` markers, keyboard navigability, high WCAG contrast ratios, and `@media (prefers-reduced-motion)` constraints.

---

## Directory Structure

```text
├── index.html          # Main HTML document structure & static SPA layout
├── styles.css          # Custom CSS design system, typography, glassmorphism, & keyframes
├── script.js          # Intersection Observers, stats counting, and timeline tracking logic
├── assets/
│   ├── README.md       # Media assets configuration, replacement code blocks & dimensions
│   ├── profile-photo.svg             # Professional photo visual placeholder
│   ├── enterprise-architecture.svg   # E-commerce core topology system map
│   ├── project-checkout.svg          # Secure transaction flow visualization
│   ├── project-promotions.svg        # Rule exclusivity matrix decision tree
│   ├── project-salesforce.svg        # Salesforce API profile sync flow
│   ├── project-gtm.svg               # Server-side tracking conversion mapping
│   ├── project-cicd.svg              # Blue-green build and ECS deploy steps
│   ├── project-admin.svg             # Mock React admin statistics dashboard
│   ├── cert-aws.svg                  # AWS Developer Associate abstract badge
│   ├── cert-java.svg                 # Java SE coffee icon badge
│   ├── cert-spring.svg               # Spring leaf icon badge
│   ├── cert-github.svg               # Git branches deployment badge
│   ├── cert-hackerrank.svg           # HackerRank bracket node badge
│   ├── cert-freecodecamp.svg         # FCC fire flame node badge
│   └── resume-preview.svg            # Simulated resume document outline
└── README.md           # Project documentation
```

---

## Visual Assets Replacement Map

To customize the visual blocks across the portfolio, place your custom asset files inside the `assets/` folder using the exact filenames listed below. The SPA is pre-linked to load these paths:

1. **Profile Photo Area**: Place portrait inside `assets/` as `profile-photo.png` or `profile-photo.jpg`, and change the `<img>` src in `index.html` (around line 104) from `assets/profile-photo.svg` to your new filename.
2. **Enterprise Architecture Diagram**: Replace `assets/enterprise-architecture.svg` or drop `enterprise-architecture.png` and update its reference in `index.html` (around line 153).
3. **Featured Projects**: Drop screenshots into `assets/` and update references in `index.html` (around lines 319-539):
   - Project 1 (Checkout Flow): `project-checkout.png`
   - Project 2 (ATG Promotions): `project-promotions.png`
   - Project 3 (Salesforce Sync): `project-salesforce.png`
   - Project 4 (sGTM CAPI): `project-gtm.png`
   - Project 5 (Spring Boot CI/CD): `project-cicd.png`
   - Project 6 (React Admin UI): `project-admin.png`
4. **Certification Badges**: Drop badges into `assets/` and update references in `index.html` (around lines 757-827):
   - AWS Certified Developer: `cert-aws.png`
   - Oracle Java SE 17: `cert-java.png`
   - Spring Certified Professional: `cert-spring.png`
   - GitHub Actions: `cert-github.png`
   - HackerRank: `cert-hackerrank.png`
   - freeCodeCamp: `cert-freecodecamp.png`
5. **Resume PDF Preview**: Drop screenshot or vector of your resume as `resume-preview.png` and update the reference in `index.html` (around line 837).

---

## Action Items Before Deploying

To personalize your site:
1. **Place your Resume PDF**: Add your compiled PDF resume inside the `assets/` directory and name it `Muni-Prasad-Resume.pdf`.
2. **Review Asset Replacements**: Read [assets/README.md](file:///d:/Workspace/muni-prasad-portfolio/assets/README.md) to see how to replace the vector SVG placeholders with custom screenshots, profile photos, or cert badges.
3. **Set GitHub Username**: Open `index.html` and replace instances of `YOUR-GITHUB-USERNAME` (lines 357, 404, 448, 493, 537, 585, etc.) with your actual GitHub account identifier.
4. **Deploying**:
   - **GitHub Pages**: Upload to a repository named `muni-prasad-portfolio`, go to `Settings` $\rightarrow$ `Pages`, choose source as `Deploy from branch`, and target `main` / `root`.
   - **Vercel or Netlify**: Select this repository, leave build commands empty, set the publish directory to `/`, and trigger deployment.
