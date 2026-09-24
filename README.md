# ExesTools — Spinner Wheel

Production-ready Next.js App Router site for [exestools.com](https://exestools.com): a free custom spinner wheel for names, prizes, Yes/No decisions, and group activities.

The Spinner Wheel is the homepage at `/`. `/spinner-wheel` permanently redirects to `/` (query strings preserved).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- HTML Canvas wheel + `requestAnimationFrame` spin physics
- Lucide React icons, Framer Motion (modal / reduced-motion aware)
- LocalStorage session + optional URL share (`?c=`)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the wheel loads immediately.

## Production build

```bash
npm run build
npm start
```

## Deploy

Deploy as a standard Next.js app (Vercel, Netlify, Node host, etc.):

1. Connect the repo or upload the project.
2. Build command: `npm run build`
3. Output: Next.js default (no static export required).
4. Set the production domain to `https://exestools.com` so canonical / Open Graph URLs match `lib/seo.ts`.

### Environment variables

None required for the core Spinner Wheel. Optional later:

- AdSense publisher ID when replacing `AdPlaceholder` components
- Contact/email backend if you add a contact form later

## Pages

| Path | Purpose |
|------|---------|
| `/` | Spinner Wheel (primary tool) |
| `/spinner-wheel` | 308 redirect → `/` |
| `/about` | About |
| `/privacy-policy` | Privacy draft |
| `/terms` | Terms draft |

`/contact` redirects to `/about` for now (no contact form).

`app/robots.ts` and `app/sitemap.ts` generate `/robots.txt` and `/sitemap.xml`. Sitemap lists `/` only for the wheel (not `/spinner-wheel`).

## Notes

- Contact form is not enabled; `/contact` redirects to `/about`.
- Ad slots are labeled placeholders only — no AdSense scripts.
- Review Privacy Policy and Terms before launch.
