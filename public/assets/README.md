# Assets Directory Guidelines

This directory holds the static media resources (such as PDF files, photos, screenshots, and diagrams) for Muni Prasad K's senior developer portfolio.

The portfolio is configured as a Single Page Application (SPA) that references these assets as external files via standard HTML `<img>` elements. Out of the box, this directory contains **15 pre-designed vector SVG files** that match the theme and serve as high-performance visual placeholders.

---

## 1. Resume PDF (Required for Download Buttons)

- **File Name**: `Muni-Prasad-Resume.pdf`
- **Path**: `assets/Muni-Prasad-Resume.pdf`
- **Action**: Place your compiled resume PDF here. The "Download Resume" buttons on the landing page and the resume section are already pre-configured to link to this path.

---

## 2. Professional Profile Photo

- **Current Placeholder**: `profile-photo.svg` (around line 104 in `index.html`)
- **To Customize**: 
  - Place your portrait inside this folder (e.g., `profile-photo.png` or `profile-photo.jpg`).
  - Recommended dimensions: Square aspect ratio (e.g., `400px x 400px`).
  - Open `index.html` and update the `src` attribute of the avatar `<img>` tag from `assets/profile-photo.svg` to your new filename:
    ```html
    <img class="avatar-placeholder-svg" src="assets/profile-photo.png" alt="Muni Prasad K Photo" ... />
    ```

---

## 3. Enterprise Architecture Diagram

- **Current Placeholder**: `enterprise-architecture.svg` (around line 153 in `index.html`)
- **To Customize**:
  - Save your custom system architecture diagram in this folder (e.g., `enterprise-architecture.png`).
  - Open `index.html` and update the `src` attribute of the diagram `<img>` tag from `assets/enterprise-architecture.svg` to `assets/enterprise-architecture.png`.

---

## 4. Featured Project Screenshots

To customize the 6 project cards with screenshots of your custom codebases or dashboards:
- **Recommended Format**: PNG or WebP, `16:9` aspect ratio (e.g., `800px x 450px`).
- **File Names and Locations in `index.html` (Lines 319 - 539)**:
  1. *Project 1 (Checkout Flow)*: Replace `assets/project-checkout.svg` with your own image, or update the `src` in `index.html` to `assets/project-checkout.png`.
  2. *Project 2 (ATG Promotions)*: Replace `assets/project-promotions.svg` with your own image, or update the `src` in `index.html` to `assets/project-promotions.png`.
  3. *Project 3 (Salesforce CRM Sync)*: Replace `assets/project-salesforce.svg` with your own image, or update the `src` in `index.html` to `assets/project-salesforce.png`.
  4. *Project 4 (sGTM CAPI)*: Replace `assets/project-gtm.svg` with your own image, or update the `src` in `index.html` to `assets/project-gtm.png`.
  5. *Project 5 (Spring Boot CI/CD)*: Replace `assets/project-cicd.svg` with your own image, or update the `src` in `index.html` to `assets/project-cicd.png`.
  6. *Project 6 (React Admin UI)*: Replace `assets/project-admin.svg` with your own image, or update the `src` in `index.html` to `assets/project-admin.png`.

---

## 5. Certification Badges

To customize the 6 certification badge icons with official accrediting logos (e.g., from AWS or Oracle):
- **Recommended Format**: Transparent PNG or SVG, square aspect ratio (e.g., `120px x 120px`).
- **File Names and Locations in `index.html` (Lines 757 - 827)**:
  - AWS Certified Developer: `assets/cert-aws.svg` $\rightarrow$ replace with `cert-aws.png`
  - Oracle Java SE 17: `assets/cert-java.svg` $\rightarrow$ replace with `cert-java.png`
  - Spring Certified Professional: `assets/cert-spring.svg` $\rightarrow$ replace with `cert-spring.png`
  - GitHub Actions: `assets/cert-github.svg` $\rightarrow$ replace with `cert-github.png`
  - HackerRank: `assets/cert-hackerrank.svg` $\rightarrow$ replace with `cert-hackerrank.png`
  - freeCodeCamp: `assets/cert-freecodecamp.svg` $\rightarrow$ replace with `cert-freecodecamp.png`

---

## 6. Resume PDF Preview

- **Current Placeholder**: `resume-preview.svg` (around line 837 in `index.html`)
- **To Customize**:
  - Save a visual snapshot of your resume in this folder (e.g., `resume-preview.png`).
  - Open `index.html` and update the `src` attribute of the preview `<img>` tag from `assets/resume-preview.svg` to `assets/resume-preview.png`.
