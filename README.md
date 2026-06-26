# Muni Prasad - Professional Web Portfolio

Welcome to my professional web portfolio! This project showcases my experience, projects, skills, and certifications as a Senior Software Engineer & Technical Consultant.

It is built as a highly performant **Single Page Application (SPA)** using **Next.js 16 (App Router)** and **Tailwind CSS**, and is fully content-managed via an integrated **Payload CMS v3** backed by a **Neon PostgreSQL** database.

---

## 🚀 Features

- **Modern UI**: Smooth scrolling and responsive design powered by Tailwind CSS 4.
- **Dynamic Content Management**: No hard-coded content. Projects, Experience, and Certifications are dynamically fetched from the database and can be edited securely via the `/admin` dashboard.
- **Server-Side Rendering (SSR)**: Optimal performance and SEO through Next.js server components and Payload's Local API.
- **Robust Database**: Serverless Neon PostgreSQL integration via Drizzle ORM.
- **Custom Deployment**: Deployed on Vercel Edge Network with a custom domain (`www.muniprasad.in`).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend / CMS**: Payload CMS v3 (Headless CMS integrated within Next.js)
- **Database**: Neon PostgreSQL
- **Deployment**: Vercel
- **Language**: TypeScript

---

## 📖 Complete Documentation

For an in-depth, professional breakdown of the project architecture, detailed folder structure, deployment steps, and interview talking points, please refer to the detailed documentation:

👉 **[Read the Full Project Documentation (PROJECT_DOCUMENTATION.md)](./PROJECT_DOCUMENTATION.md)**

For deployment specific instructions (Vercel + GoDaddy), see the **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**.

---

## 💻 Running Locally

### Prerequisites
- Node.js v18+
- npm
- A Neon PostgreSQL Database connection string.

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/MuniPrasad123/muni-prasad-portfolio.git
   cd muni-prasad-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@hostname/dbname?sslmode=require
   PAYLOAD_SECRET=your_32_character_secret_string
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **CMS Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
