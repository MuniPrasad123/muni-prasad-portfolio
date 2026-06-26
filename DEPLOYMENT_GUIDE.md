# Vercel Deployment & GoDaddy DNS Mapping Guide

This guide explains how to deploy your Next.js + Payload CMS portfolio to **Vercel** and connect it to your GoDaddy domain: [www.muniprasad.in](http://www.muniprasad.in/).

---

## Architecture Context (Serverless Database)

Because **Vercel** runs on a serverless architecture, its file system is **ephemeral** (temporary) and **read-only** at runtime.
*   **The Problem**: A local database file like `payload.db` will be wiped clean every time the serverless functions spin down or redeploy.
*   **The Solution**: We use **Neon DB** — a serverless PostgreSQL provider — to persist your data. Neon has a generous **free tier** (0.5 GB, always-on) and has a native **Vercel integration**. The `@payloadcms/db-postgres` adapter handles everything via Drizzle ORM internally.

---

## Step 1: Set up a Free Neon PostgreSQL Database

1.  Go to [Neon Console](https://console.neon.tech) and sign up for a free account (GitHub login recommended).
2.  Click **"New Project"**:
    *   **Project Name**: `muni-portfolio`
    *   **Database Name**: `portfolio` (default `neondb` is fine too)
    *   **Region**: Choose the closest to your target audience (e.g., `Asia Pacific (Mumbai)` for India)
3.  After creation, Neon shows your **connection string** on the dashboard. It looks like:
    ```
    postgresql://neondb_owner:AbCdEf123@ep-cool-name-123456.ap-south-1.aws.neon.tech/neondb?sslmode=require
    ```
4.  **Copy this connection string** — you'll need it for both local development and Vercel.

> [!TIP]
> Neon's free tier includes **0.5 GB storage**, **190 compute hours/month**, and **auto-suspend** after 5 minutes of inactivity (cold starts are ~500ms). More than enough for a portfolio site.

---

## Step 2: Configure Local Development

1.  Open your `.env` file and paste your Neon connection string:
    ```env
    PAYLOAD_SECRET=a_very_secret_key_for_payload_cms_12345
    DATABASE_URL=postgresql://neondb_owner:AbCdEf123@ep-cool-name-123456.ap-south-1.aws.neon.tech/neondb?sslmode=require
    ```
2.  Run the dev server:
    ```bash
    npm run dev
    ```
3.  Payload CMS will automatically create all tables (`users`, `media`, `projects`, `experiences`, `certifications`) in your Neon database on first startup.
4.  Visit `http://localhost:3000/admin` to create your first admin user.

---

## Step 3: Import & Deploy on Vercel

1.  Log in to [Vercel](https://vercel.com) using your GitHub account.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository `MuniPrasad123/muni-prasad-portfolio`.
4.  Configure the **Environment Variables** in the Project Settings:

    | Variable Name | Value | Description |
    | :--- | :--- | :--- |
    | `PAYLOAD_SECRET` | `a_long_random_secure_string_here` | Secret key for admin session cookies |
    | `DATABASE_URL` | `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require` | Your Neon DB Connection String |
    | `NEXT_PUBLIC_SERVER_URL` | `https://www.muniprasad.in` | Base URL of your website |

5.  Click **Deploy**. Next.js will compile the app and Payload will auto-create all PostgreSQL tables in your Neon database!

> [!IMPORTANT]
> Use a **different, strong** `PAYLOAD_SECRET` in production. Generate one with: `openssl rand -base64 32`

---

## Step 4: Add Custom Domain on Vercel

1.  Go to your project dashboard on Vercel.
2.  Navigate to **Settings** -> **Domains**.
3.  Type `www.muniprasad.in` in the field and click **Add**.
4.  Vercel will recommend adding both `www.muniprasad.in` and the redirect `muniprasad.in` (apex domain). Select this recommended option.
5.  Vercel will show that the domain is **"Invalid Configuration"** until you update the DNS records in your GoDaddy account.

---

## Step 5: Configure DNS Records in GoDaddy

1.  Log in to your **GoDaddy Control Center**.
2.  Go to **My Products** -> Find `muniprasad.in` -> Click **DNS** or **Manage DNS**.
3.  Under the **DNS Records** table, add or edit the following two records:

### 1. The Apex/Root Domain (`muniprasad.in`)
*   **Type**: `A`
*   **Name**: `@`
*   **Value**: `76.76.21.21` (This is Vercel's global IP address)
*   **TTL**: `1 Hour` (or Default)

### 2. The Subdomain (`www.muniprasad.in`)
*   **Type**: `CNAME`
*   **Name**: `www`
*   **Value**: `cname.vercel-dns.com.`
*   **TTL**: `1 Hour` (or Default)

> [!WARNING]
> If GoDaddy already has an existing `A` record for `@` or a `CNAME` record for `www`, edit them to match the values above rather than creating duplicates. Delete any old values that redirect to other hosts.

4.  Save the changes. DNS propagation usually takes from **5 minutes to a few hours**. Vercel will automatically obtain a free SSL certificate once it detects the records.

---

## Step 6: Continuous Git Synchronization

Now, your repository is completely wired up. Whenever you run standard git commands to commit and push changes:

```bash
git add .
git commit -m "Updates portfolio content and layout"
git push origin main
```

1.  GitHub receives the commit.
2.  Vercel automatically triggers a build.
3.  Your updates reflect live at [www.muniprasad.in](http://www.muniprasad.in/) in under **2 minutes**!

---

## Quick Reference: Environment Variables

| Variable | Local (`.env`) | Vercel (Dashboard) |
| :--- | :--- | :--- |
| `PAYLOAD_SECRET` | Any string | Strong random string |
| `DATABASE_URL` | Neon connection string | Same Neon connection string |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` | `https://www.muniprasad.in` |
