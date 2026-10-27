# Portfolio visitor analytics

The public frontend uses the official @vercel/analytics Next.js integration, enabled only for Vercel production deployments. Admin pages and local/preview sessions are excluded.

## Enable and view
1. Open the muni-prasad-portfolio project in Vercel.
2. Open Analytics / Web Analytics and select Enable if not already enabled. Do not upgrade to a paid plan just for this setup.
3. Deploy the latest main commit after enabling.
4. View Visitors, Page Views, Pages and Referrers in the private Vercel dashboard.

Referrers indicate the website that sent traffic, where supplied by the browser. Direct, private, blocked or app traffic may have no source. These are aggregate estimates, not names or individual identities. Data starts after activation; it cannot reconstruct earlier visits.

The public privacy page discloses this integration. No custom events or user-identifying fields are sent.

The public resume PDFs and all download/print calls to action have been removed. Previously downloaded copies, old deployments and Git history are not erased by this change.

Owner confirmed Web Analytics was enabled in Vercel on 2026-10-27. The next production deployment installs the tracking component.
