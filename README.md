# LinkDrop — media downloader interface

A responsive React + Vite frontend prototype for an all-in-one media downloader.

## Included
- Responsive desktop and mobile interface
- URL input with basic URL validation
- Paste-from-clipboard control
- Demo feedback state explaining that the backend is not connected
- Platform tiles for YouTube, TikTok, Facebook, Instagram, Vimeo, X and direct media links
- How-it-works, format preview, FAQ and footer sections
- Cloudflare-friendly static build

## Run locally
Requires a recent Node.js release.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build for deployment
```bash
npm run build
```

Vite outputs the static site to `dist/`.

## Deploy on Cloudflare Pages
1. Push this folder to a Git repository.
2. In Cloudflare, create a Pages project and connect the repository.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy.

Alternatively, adapt it to Cloudflare Workers static assets if you want the frontend and lightweight API gateway managed together.

## Important: interface prototype only
The form currently validates the entered URL and displays a setup message. It does not download media yet. Connect a secure backend/API before representing it as a functioning downloader.

Recommended next backend stages:
- `POST /api/info` for metadata on supported, authorized URLs
- A separate media-processing worker/service for permitted downloads and optional FFmpeg conversion
- Server-side URL validation, SSRF protection, rate limits, size/time limits and temporary-file cleanup
- Short-lived download references rather than exposing internal server paths

Respect source-platform terms, copyright and access controls. Support may vary by URL and platform.
