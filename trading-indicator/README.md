# Dow + Wyckoff + VSA + MTF — TradingView Indicator

One Pine Script v6 overlay indicator ([`dow-wyckoff-vsa-mtf.pine`](dow-wyckoff-vsa-mtf.pine)) that combines four classic price/volume methodologies into a single analytical tool:

| Module | What it gives you |
|---|---|
| **Dow Theory** | Objective trend state from swing structure (HH/HL vs LH/LL), swing labels, break-of-structure marks, trend background tint |
| **Wyckoff Method** | Climax detection, auto-tracked accumulation/distribution trading ranges, Spring / Upthrust / SOS / SOW events |
| **Volume Spread Analysis** | Bar-by-bar supply/demand reads: No Demand, No Supply, Stopping Volume, Climaxes, Upthrust bars, Shakeouts, Tests, Effort-vs-No-Result |
| **Multi-Timeframe** | Dashboard showing trend, Wyckoff context, last VSA signal, and volume state on the chart TF plus two higher timeframes |
| **Weighted scoring** | Each module emits a normalized score in [-1, +1]; a user-weighted composite drives the LONG/SHORT bias, signals, and alerts |

## Installation

1. Open any chart on [TradingView](https://www.tradingview.com/) and open the **Pine Editor** (bottom panel).
2. Delete the editor's default content and paste the full contents of `dow-wyckoff-vsa-mtf.pine`.
3. Click **Save**, then **Add to chart**.

No paid TradingView plan is required. If you ever get a compile error (e.g. after a TradingView Pine update), copy the exact error text and file an issue — it's usually a one-line fix.

## How each module works

### 1. Dow Theory — market structure

- Swings are confirmed with symmetric pivots (`Pivot length` bars on each side, default 5). Each confirmed swing is compared to the previous one of the same type and labeled **HH**, **HL**, **LH**, or **LL**.
- Trend state (Dow definition): latest swing pair is HH + HL → **uptrend**; LH + LL → **downtrend**; mixed → **range**.
- **BOS** (break of structure): a *confirmed close* beyond the most recent swing high/low flips the trend immediately instead of waiting for the next pivot — marked with a small diamond.
- The background is tinted green/red by trend (toggleable).

> Pivot confirmation is inherently lagged: a swing label appears `Pivot length` bars after the actual extreme. This is not repainting — once drawn, nothing moves.

### 2. Wyckoff Method

The module looks for the classic Wyckoff sequence: climax → automatic rally/reaction → trading range → spring/upthrust → breakout.

- **Selling Climax (SC)** — a wide-spread down bar into a 20-bar low on ultra-high volume while structure is not bullish. Mirrored by the **Buying Climax (BC)** at highs.
- After a climax, the next `AR window` bars (default 10) define the trading range extremes, which are then drawn as a shaded box: teal for potential **accumulation** (after a decline), orange for potential **distribution** (after a rally).
- Inside the range:
  - **Spring** — price dips below the range low but closes back inside on non-climactic volume (bullish shakeout).
  - **UT** (Upthrust) — price pokes above the range high but closes back inside on high volume (bearish).
  - **SOS** (Sign of Strength) — a wide/high-volume close *above* the range → phase becomes **Markup**.
  - **SOW** (Sign of Weakness) — a wide/high-volume close *below* the range → phase becomes **Markdown**.
  - Quiet closes outside the range just widen it; ranges older than `Max range lifetime` bars are abandoned.
- The current phase (Accumulation / Distribution / Markup / Markdown / Neutral) is shown in the dashboard.

### 3. Volume Spread Analysis

Every bar is measured on three axes: **spread** (high−low vs its 20-bar average), **relative volume** (vs its 20-bar average: ultra ≥ 2×, high ≥ 1.5×, low ≤ 0.7×, thresholds configurable), and **close position** within the bar's range. Signals (one per bar, strongest wins; hover a label for the full explanation):

| Label | Signal | Rule sketch | Read |
|---|---|---|---|
| `SC` | Selling Climax | 20-bar low, wide spread, ultra volume, down close | Potential end of decline |
| `BC` | Buying Climax | 20-bar high, wide spread, ultra volume, up close | Potential end of rally |
| `UT` | Upthrust bar | New 10-bar high, closes in bottom 30%, high volume | Supply hit the highs |
| `SO` | Shakeout | New 10-bar low, wide spread, closes in top 30%, high volume | Weak hands flushed |
| `SV` | Stopping Volume | Down bar into 10-bar low, ultra volume, close off the lows | Selling absorbed |
| `ENR` | Effort vs No Result | Ultra volume but narrow spread | Absorption |
| `ND` | No Demand | Narrow up bar, volume below previous two bars | No interest higher (bearish in weakness) |
| `NS` | No Supply | Narrow down bar, volume below previous two bars | Sellers done (bullish in strength) |
| `T` | Test | Low-volume dip below prior low with firm close, in an uptrend | Successful test of supply |

Bullish reads are drawn below the bar in green, bearish above in red, neutral in gray. On symbols with no volume data the VSA and Wyckoff modules disable themselves gracefully (dashboard shows `n/a`).

### 4. Multi-Timeframe dashboard

- Two higher timeframes, each either **auto** (≈4× and ≈16× the chart timeframe) or fixed (defaults 4H and 1D).
- For each HTF the *same* Dow/Wyckoff/VSA engine is evaluated and the dashboard shows: trend, Wyckoff context, last VSA signal (with how many HTF bars ago), and current volume state.
- The **Score** row shows each module's current score, and the **Bias** row shows the weighted composite and its state (see below).
- HTF values use the last **completed** higher-timeframe bar (`[1]` offset + `lookahead_on`) — the standard non-repainting idiom. HTF rows therefore update only when an HTF bar closes.
- If you fix an "HTF" at or below the chart timeframe, its TF cell turns orange as a warning.

### 5. Weighted scoring engine

Every module continuously emits a score in **[-1, +1]**:

| Module | Score | Default weight |
|---|---|---|
| Dow | Trend state: +1 up, 0 range, −1 down | 30 |
| Wyckoff | Phase baseline (Markup +0.4, Accumulation +0.2, Distribution −0.2, Markdown −0.4) **plus** a decaying event impulse: SOS +1.0, Spring +0.8, Upthrust −0.8, SOW −1.0, fading linearly to zero over `Wyckoff event decay` bars (default 20) | 20 |
| VSA | The latest signal's signed strength (e.g. Shakeout +0.6, Stopping Volume +0.5, No Supply +0.4, No Demand −0.4, Upthrust bar −0.6, climaxes ±0.5), fading over `VSA signal decay` bars (default 10) | 20 |
| MTF | Average of the two higher-timeframe trend states | 30 |

The **composite score** is the weighted average — set any weight to 0 to remove a module from the decision entirely, or crank one up to make it dominant. The decay model matters: a Spring doesn't just count on the bar it printed, its influence bleeds forward and fades, which is how a discretionary trader actually holds context.

**Bias state** uses hysteresis: it flips LONG when the composite ≥ `Signal threshold` (default 0.4), SHORT at ≤ −threshold, and only resets to NEUTRAL once the score falls back inside half the threshold — so it doesn't flip-flop when hovering near the trigger level.

**Long/Short triangles** print once per bias episode, on the first closed bar where the bias is active — and, if `Require a recent trigger event` is on (default), a same-direction event (Spring, SOS, No Supply, Test, Stopping Volume, Shakeout for longs; the mirrors for shorts) occurred within the last `Trigger lookback` bars. That keeps signals anchored to an actual Wyckoff/VSA event rather than slow score drift.

Set the background tint to **Score** to see the composite as a gradient behind price (deeper color = stronger conviction).

These are analytical prompts, not trade advice — they mark moments worth your attention, with the full context one glance away on the dashboard.

## Alerts

Right-click the chart → **Add alert** → set *Condition* to **DWVM** and pick one of:

Dow trend turned UP / DOWN · Wyckoff Spring · Wyckoff Upthrust · Sign of Strength · Sign of Weakness · VSA No Supply · VSA No Demand · VSA Climactic volume · Score bias turned LONG / SHORT · Long / Short signal (weighted)

Use **"Once per bar close"** — every signal in this indicator is defined on the closed bar.

## Settings reference

| Group | Setting | Default | Notes |
|---|---|---|---|
| Dow Theory | Pivot length | 5 | Bigger = fewer, more significant swings |
| | Show structure visuals / swings / BOS | on | Visual toggles only — trend logic always runs |
| | Background tint | Trend | `Trend` (green/red by structure), `Score` (gradient by composite), or `Off` |
| Wyckoff | Enable module | on | Requires volume data |
| | AR window | 10 | Bars after a climax that define the range |
| | Max range lifetime | 300 | Stale ranges are abandoned |
| | Draw trading-range box | on | |
| VSA | Enable module | on | Requires volume data |
| | Volume / spread average length | 20 | |
| | Ultra / high / low volume multiples | 2.0 / 1.5 / 0.7 | Of the volume average |
| MTF | HTF 1, HTF 2 | auto (≈4×, ≈16×) | Or fix e.g. 4H and 1D |
| | Dashboard position / text size | Top right / Small | |
| Weighted scoring | Module weights (Dow/Wyckoff/VSA/MTF) | 30/20/20/30 | 0 removes a module from the decision |
| | Signal threshold | 0.4 | Bias flips at ±threshold, resets at ±half |
| | Wyckoff / VSA event decay | 20 / 10 bars | How long an event influences the score |
| | Require recent trigger event | on | Signals need a same-direction event within lookback |
| | Trigger lookback | 5 bars | |
| | Plot long/short signals | on | |

## Non-repainting behavior & limitations

- **Nothing repaints**: all signals, labels, and state changes are computed on bar close (`barstate.isconfirmed`), and HTF data comes from completed HTF bars only.
- **Everything lags by design**: pivot labels confirm `Pivot length` bars late; HTF rows update on HTF bar close. That is the price of signals that don't move.
- **Volume quality matters**: on spot forex and CFDs, "volume" is tick volume; VSA still works but treat it with extra skepticism. Symbols with no volume at all run in price-only mode (Dow + MTF trend).
- Heuristics, not oracles: Wyckoff phase detection is a simplified mechanical model of a discretionary method. Use it as a map, not a trade signal generator.
- Auto-HTF needs a time-based chart (not tick/range bars).

## Disclaimer

For educational and analytical use only. Nothing here is financial advice; trading involves substantial risk of loss. Test on historical data before relying on any signal.
