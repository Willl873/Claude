# Ruler

A precise on‑screen ruler for iPhone, built with SwiftUI.

Measure real objects directly against the glass. The scale is calibrated to the
exact physical pixel density of the device it runs on, so a centimeter on screen
is a real centimeter.

## Features

- **Centimeters or inches** — toggle the unit at any time; ticks redraw at the
  correct physical spacing (1 mm ticks for cm, ⅛‑inch ticks for inches).
- **Light & dark themes** — a hand‑tuned palette for each scheme (warm paper /
  near‑black). Follows the system automatically, or force Light / Dark.
- **Single & double markers** — drag a marker to read a distance from the top of
  the ruler, or use two markers to read the distance *between* them (shown as a
  live Δ badge).
- **Freeze / lock** — tap the lock to freeze the markers so a reading can't be
  nudged while you line things up or read the screen.
- **Automatic calibration** — no manual setup. The app identifies the device
  model and uses its true physical PPI to lay out the scale accurately across the
  range of iPhone screen sizes.
- **Manual calibration fallback** — for unknown / future devices (or to verify
  any device), tap the ruler icon and resize the on‑screen outline to match a
  standard credit / debit / ID card. The exact physical size of an ISO ID‑1 card
  is used to derive points‑per‑inch.
- **Portrait & landscape** — the scale and controls adapt to either orientation.
- **Uses only the workable area** — the ruler's zero point sits at the top of the
  safe‑area rectangle, so the notch / Dynamic Island and home indicator never
  distort the measurement.

## How calibration works

iOS doesn't expose the display's physical density directly, so `DeviceCalibration`
maps each iPhone hardware identifier (e.g. `iPhone15,2`) to its marketed pixels
per inch and combines it with `UIScreen.nativeScale`:

```
pointsPerInch = physicalPPI / nativeScale
pointsPerCm   = pointsPerInch / 2.54
```

Every tick and marker is positioned in logical points using these values, which
makes the spacing physically accurate. Unknown / future models fall back to a
density estimate based on the screen scale, and the UI notes when the value is an
estimate. You can override it at any time with **manual calibration**: match the
outline to a real ID‑1 card (85.60 mm long edge) and the app derives an exact
`pointsPerInch`, stored as a logical‑point value so it stays correct in either
orientation.

## Running

1. Open `Ruler.xcodeproj` in Xcode 15 or later.
2. Select an iPhone simulator or a connected device.
3. Build & run (⌘R).

> Measurements are exact on real hardware. In the Simulator the on‑screen size
> depends on your Mac's display scaling, so verify against a physical device.

Deployment target: iOS 17.0.

## Project layout

| File | Purpose |
| --- | --- |
| `RulerApp.swift` | App entry point. |
| `ContentView.swift` | Layout, draggable markers, and the control bar. |
| `RulerView.swift` | Canvas that draws the calibrated tick scale. |
| `CalibrationView.swift` | "Match a card" manual calibration sheet. |
| `DeviceCalibration.swift` | Device‑model → physical PPI lookup, manual override, conversions. |
| `Theme.swift` | Light / dark color palettes. |
| `Models.swift` | Unit, marker‑mode, and appearance enums. |
