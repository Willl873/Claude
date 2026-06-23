# 🦶 Sole — AI feet ratings, 0 to 10

A small, elegant web app that rates a photo of feet from **0 to 10** across five
criteria: **proportions, foot shape, skin quality, skin tone, and health** — then
serves an instant, animated verdict and keeps a little gallery of your scores so
you keep coming back.

Single-page, no build step, no backend. Just `index.html`, `styles.css`, `app.js`.

## Two rating engines

| Engine | What it does | Privacy |
|---|---|---|
| **On-device** (default) | Real pixel analysis in your browser — detects skin regions, then measures smoothness (skin quality), chroma spread (tone evenness), bounding-box elongation & fill (proportions), mirror-overlap (shape/symmetry) and a vitality blend (health). Deterministic: the same photo always gets the same score. | The photo **never leaves your device**. |
| **Claude AI** (optional) | Sends the photo to **Claude Opus 4.8** vision with *your own* Anthropic API key and returns a real AI rating with structured JSON output. | The image + key go straight from your browser to Anthropic, only when you pick this mode. |

To use AI mode, switch the toggle to **Claude AI** and paste an `sk-ant-...` key.
The key is stored only in your browser's `localStorage` and is sent solely to
`api.anthropic.com` (via the official browser-access header). Use the **Forget**
button to remove it.

## Features

- Drag & drop, file picker, or **paste from clipboard**
- Animated radial gauge with count-up, plus per-criterion bars
- Daily **streak** and **personal best** tracking
- Local **gallery** of recent ratings (tap any to revisit)
- One-tap **share card** (PNG) via the Web Share API or download
- Warm, glassy, motion-aware design (respects `prefers-reduced-motion`)
- First-run consent: 18+, entertainment-only, your photos to use

## Run it

It's fully static — open `index.html`, or serve the folder:

```sh
cd feet-rater
python3 -m http.server 8000
# then visit http://localhost:8000
```

> Clipboard paste and some features need a real `http(s)://` origin (not `file://`),
> so the local server is recommended.

### Deploy to GitHub Pages

Point the Pages workflow's `upload-pages-artifact` `path:` at `feet-rater` (the
repo already has a Pages workflow for a sibling project — copy its shape and swap
the folder), or drop these three files on any static host.

## Responsible use

Sole is for **fun and entertainment only** — it is not medical, cosmetic, or any
other kind of advice. Only upload photos of **consenting adults (18+)** that are
yours to use. On-device mode keeps images local; AI mode shares them with
Anthropic under your own key.
