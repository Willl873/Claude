# 🦶 RateMySoles

A community site where people **upload photos of their feet** and other visitors
**rate them from 1 to 10**. Inspired by sites like ratemyfeet.net.

Unlike a static gallery, this is a real full-stack app: uploads and votes are
shared across all visitors through a backend and database.

## Features

- **Upload** a feet photo with an optional caption (JPEG/PNG/WebP/GIF, up to 8 MB).
- **Rate** any photo 1–10. One vote per visitor per photo; you can change your vote.
- **Feeds:** *Newest* and *Top rated* (top uses Bayesian smoothing so a single
  10 doesn't outrank a photo with hundreds of votes).
- **Running average** and vote count on every photo.
- **Report** button for anything that breaks the rules.
- **18+ age gate** and an upload consent check (your own feet / have permission,
  no nudity, no minors).
- **Privacy:** every upload is re-encoded with `sharp`, which strips embedded
  metadata — including **EXIF GPS location** — and generates a square thumbnail.
- **Moderation:** optional admin endpoints to review reports and remove photos.
- Security hardening: `helmet` CSP, signed `httpOnly` cookies, per-route rate
  limiting, real image validation (a file can't just *claim* to be an image).

## Tech

Node + Express · SQLite (`better-sqlite3`) · `multer` + `sharp` · vanilla JS
frontend. No build step.

## Run locally

```sh
cd ratemysoles
npm install
npm start
# open http://localhost:3000
```

Data lives in `./data/ratemysoles.db`; images in `./uploads/`. Both are
git-ignored and created on first run.

### Configuration

Copy `.env.example` → `.env`. The values are read from the environment (the app
does not auto-load `.env`; either export them or use a process manager — see
deployment below). Key ones:

| Variable | Purpose |
|---|---|
| `PORT` | Listen port (default `3000`). |
| `SESSION_SECRET` | Signs the visitor cookie. **Required** when `NODE_ENV=production`. |
| `NODE_ENV` | `production` enables Secure cookies and requires the secret. |
| `ADMIN_KEY` | When set, enables the moderation endpoints (below). Blank = disabled. |
| `DATA_DIR` / `UPLOAD_DIR` | Override where the DB and images are stored. |

### Moderation

With `ADMIN_KEY` set, send it as the `x-admin-key` header:

```sh
# list recent reports
curl -H "x-admin-key: $ADMIN_KEY" http://localhost:3000/api/admin/reports

# remove a photo (soft-deletes the row and deletes the files)
curl -X DELETE -H "x-admin-key: $ADMIN_KEY" http://localhost:3000/api/admin/photo/123
```

## API

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/feed?sort=new\|top&page=N` | – | Paged gallery (24/page). |
| GET | `/api/photo/:id` | – | One photo with your current vote. |
| POST | `/api/upload` | multipart: `image`, `title`, `consent=true` | Rate-limited. |
| POST | `/api/photo/:id/vote` | `{ "score": 1-10 }` | Upserts your vote. |
| POST | `/api/photo/:id/report` | `{ "reason": "..." }` | Flags for review. |

## Deploying to a real `.com`

This needs a host that runs Node and keeps a writable disk (the SQLite file and
the `uploads/` folder must persist) — e.g. a small VPS, Render, Railway, or Fly.

1. **Host:** deploy this folder, run `npm ci && npm start`. Set `NODE_ENV=production`,
   a strong `SESSION_SECRET`, and an `ADMIN_KEY`. Put it behind a reverse proxy
   (nginx/Caddy) terminating HTTPS; the app already trusts `X-Forwarded-*`.
2. **Persistent storage:** mount a volume and point `DATA_DIR` and `UPLOAD_DIR`
   at it so data survives restarts/redeploys. (On a single box the defaults are
   fine as long as the disk persists.)
3. **Domain:** register `ratemysoles.com` with any registrar, point an `A`/`AAAA`
   record (or `CNAME` on a PaaS) at your host, and issue a TLS cert (Caddy or
   Let's Encrypt/Certbot do this automatically).

> Buying the domain and standing up the host are account/billing steps only you
> can do — the application itself is complete and ready to run.

## Responsible use

For entertainment only. **18+**. Don't upload photos containing nudity, sexual
content, minors, or anyone who hasn't consented. Reported photos are reviewed and
removed. You are responsible for the content you post and for complying with the
laws and host/payment-provider rules that apply to you.
