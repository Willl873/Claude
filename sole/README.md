# Sole 👣

**Sole** is a playful, elegant iOS app that rates photos of **feet** from **0 to 10**.
It scores each photo across four qualities — **Proportions, Skin Quality, Skin
Tone, and Health** — using on-device image analysis, then wraps the result in a
delightful, share-worthy experience designed to make you want to come back.

> ✨ **For fun only.** Sole is an entertainment app. It is **not** medical,
> cosmetic, or diagnostic advice. The "Skin Tone" dimension rewards an even,
> healthy-looking radiance — never one complexion over another.

Built to be extensible: feet are the first body part, and the architecture
(`BodyPart` + `RatingDimension`) makes it easy to add more later.

---

## ✨ Features

- **Instant scoring** — snap a photo or pick one from your library and get a
  rating in seconds.
- **AI-style analysis** — a dramatic, animated "scanning" moment while the photo
  is measured entirely **on your device** (nothing is uploaded).
- **Four-dimension breakdown** — animated bars for Proportions, Skin Quality,
  Skin Tone and Health, each with a witty note.
- **Gorgeous results** — a hero score ring that counts up, encouraging verdicts,
  and **confetti** for great scores.
- **Built-in retention** — daily **streaks**, **personal best**, and a running
  **average** keep you coming back.
- **History** — every rating is saved with its photo so you can track your
  glow-up over time. Swipe to delete, or clear everything.
- **One-tap sharing** — generates a branded result card you can post anywhere.
- **Light & dark mode**, haptics, and smooth transitions throughout.
- **Private by design** — photos and scores never leave the device.

---

## 🚀 Running it

Requirements: **Xcode 16+** and **iOS 17+**.

```bash
open sole/Sole.xcodeproj
```

1. Select the **Sole** scheme.
2. Choose a simulator or your device and hit **Run** (⌘R).
3. The camera only works on a real device; the simulator falls back to the photo
   library automatically.

The project uses Xcode 16 **file-system-synchronized groups**, so every file in
`Sole/` is picked up automatically — no need to manually add files to the target.

---

## 🧠 How the scoring works

All analysis is local and deterministic — the **same photo always gets the same
score**, which keeps results trustworthy and shareable.

1. **`ImageAnalyzer`** downsamples the photo to a small grid and computes
   perceptual statistics:
   - brightness & contrast (exposure / detail)
   - colour saturation
   - skin-tone evenness (luminance variance)
   - left/right symmetry
   - warmth (red vs. blue balance)
   - a stable per-image seed
2. **`RatingEngine`** maps those measurements onto the four dimensions through a
   friendly, generous grading curve, adds a touch of seeded variation for
   character, and blends them (weighted) into the overall score.
3. The result is turned into a `Rating`, persisted by **`HistoryStore`**, and
   revealed in **`ResultView`**.

It's intentionally good-natured: most photos land somewhere encouraging, with
real room at the top for standout shots.

---

## 🏗 Architecture

```
sole/
├── Sole.xcodeproj/              # Xcode 16 project (synchronized groups)
└── Sole/
    ├── SoleApp.swift            # @main entry; owns the shared HistoryStore
    ├── Theme/
    │   └── Theme.swift          # colors, gradients, fonts, score-color mapping
    ├── Models/
    │   ├── BodyPart.swift       # pluggable body parts (feet today)
    │   ├── RatingDimension.swift# the four scored qualities + weights
    │   └── Rating.swift         # a saved result (Codable)
    ├── Services/
    │   ├── ImageAnalyzer.swift  # on-device perceptual measurements
    │   ├── RatingEngine.swift   # features → friendly scores + copy
    │   ├── HistoryStore.swift   # @Observable persistence (JSON + JPEGs)
    │   └── Haptics.swift        # tactile feedback helpers
    ├── Views/
    │   ├── RootView.swift       # onboarding gate + 2-tab shell
    │   ├── OnboardingView.swift
    │   ├── HomeView.swift       # greeting, CTA, stats, recents
    │   ├── RateFlowView.swift   # capture → analyzing → result
    │   ├── CaptureView.swift
    │   ├── AnalyzingView.swift
    │   ├── ResultView.swift     # score reveal, breakdown, share card
    │   ├── HistoryView.swift
    │   ├── RatingDetailView.swift
    │   └── Components/          # ScoreGauge, DimensionBar, PrimaryButton,
    │                            # GlassCard, ConfettiView, CameraPicker, ShareSheet
    └── Assets.xcassets/         # app icon + accent color
```

**Stack:** SwiftUI · the Observation framework (`@Observable`) · Core Graphics ·
PhotosUI · `ImageRenderer` for share cards. No third-party dependencies.

---

## 🔮 Extending to other body parts

The flow is body-part agnostic. To add a new one:

1. Add a case to `BodyPart` with its copy, SF Symbol, and the `RatingDimension`s
   it should be scored on.
2. (Optional) Add new cases to `RatingDimension` and tune the mapping in
   `RatingEngine.feature(for:from:)`.

The home screen, capture flow, results and history all adapt automatically.

---

## 🗺 Roadmap ideas

- More body parts (the app is already wired for it).
- A genuine Core ML model to complement the heuristics.
- Leaderboards / weekly challenges.
- Widgets & App Clips for instant rating.

---

Made for fun. Be kind to your feet. 💅
