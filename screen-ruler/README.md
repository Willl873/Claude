# 📏 Actual Size Ruler

A free, accurate **on-screen ruler** for measuring real objects against your
display — in centimetres, millimetres, or inches. Inspired by
[piliapp's cm-ruler](https://www.piliapp.com/actual-size/cm-ruler/), rebuilt to
be faster, friendlier, and genuinely precise.

It's a single static page — no build step, no dependencies, no tracking.

## Why it's better

| | This ruler | Typical online rulers |
|---|---|---|
| **Calibration** | Match a credit card, dollar bill, CD, A4 or Letter — or type a PPI directly. Saved per-device. | Often a single fixed reference, re-done every visit |
| **Measuring** | Two draggable A/B markers with a live distance readout | Read tick marks by eye |
| **Precision** | Click-to-place nearest marker, arrow-key nudging, optional 1 mm snap | — |
| **Orientation** | Horizontal **and** vertical | Usually horizontal only |
| **Units** | cm/mm and inches (down to 1/16″) | Varies |
| **Comfort** | Light/dark theme, fullscreen, fully responsive & touch-friendly | Varies |
| **Crispness** | Canvas rendered at device pixel ratio for razor-sharp ticks | Often blurry on HiDPI |

## How to use

1. **Calibrate once.** Click **🎯 Calibrate**, pick a reference object (a credit
   card works great), hold it against the screen, and resize the outline until
   it matches. Your screen's PPI is saved on this device.
2. **Measure.** Line your object up with the ruler, then drag markers **A** and
   **B** to its ends. The distance appears in the readout.
3. **Be precise.** Click anywhere on the ruler to send the nearest marker there,
   or focus a marker and use the **arrow keys** (hold **Shift** for ×10 steps,
   **Home**/**End** to jump to the ends). Toggle **Snap** for whole-millimetre
   steps.
4. **Switch it up.** Flip between **cm/inch** and **horizontal/vertical**, go
   **fullscreen** (⛶), or toggle **dark mode** (🌙).

## Accuracy notes

- Calibration is stored in CSS-pixel terms. If you change your **browser zoom**
  after calibrating, recalibrate (CSS pixels then map to a different physical
  size). This caveat applies to every screen ruler.
- Measurements are limited to your screen's physical width/height. For longer
  objects, measure in sections.

## Running it

No server needed — just open the file:

```bash
# from this folder
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it statically (handy for phones on the same network):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

- `index.html` — markup and dialogs
- `styles.css` — theming, layout, markers
- `app.js` — calibration, canvas rendering, measurement logic

Everything runs client-side; your calibration lives in `localStorage` and never
leaves your device.
