# Clarely — skincare telehealth landing site

**Clarely** is a clean, elegant landing page for a (fictional) dermatologist-guided
skincare telehealth service — in the spirit of Honeydew-style online acne/derm care:
take a quick online visit, get matched with a licensed provider, and receive a
personalized prescription plan delivered to your door with ongoing follow-up.

> ⚠️ This is a front-end design demo. It does not provide real medical services
> and collects no real data — the email form is a client-side mock.

## Design

- **Accent:** emerald (`#10b981` → `#047857`) with soft mint tints
- **Font:** [Poppins](https://fonts.google.com/specimen/Poppins) (300–700)
- **Feel:** clean, elegant, lots of whitespace, gentle motion
- Fully responsive (desktop → mobile) with a `prefers-reduced-motion` fallback

## Sections

1. Announcement bar + sticky navbar
2. Hero with an animated phone mock of a treatment plan
3. Trust/stats strip
4. How it works (3 steps)
5. What we treat (6 concerns)
6. Why Clarely / what's included
7. Results & testimonials
8. Pricing (3 plans)
9. CTA banner with email capture (mock)
10. FAQ accordion
11. Footer with legal + medical disclaimer

## Run it

No build step — it's plain HTML/CSS/JS. Just open the file:

```bash
open clarely/index.html        # macOS
# or serve it
python3 -m http.server --directory clarely 8000   # → http://localhost:8000
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup & content |
| `styles.css` | Emerald theme, Poppins, layout, responsive rules |
| `app.js` | Sticky nav, mobile menu, FAQ accordion, scroll reveals, CTA form |

## Customize

- Colors live in the `:root` emerald scale in `styles.css`.
- Swap copy, pricing, and treatments directly in `index.html`.
- The brand name and checkmark logo are inline SVG — search for `Clarely`.
