# Dow + Wyckoff + VSA + MTF — TradingView Indicator

One Pine Script v6 overlay indicator ([`dow-wyckoff-vsa-mtf.pine`](dow-wyckoff-vsa-mtf.pine)) that combines four classic price/volume methodologies into a single analytical tool:

| Module | What it gives you |
|---|---|
| **Dow Theory** | Objective trend state from swing structure (HH/HL vs LH/LL), swing labels, break-of-structure marks, trend background tint |
| **Wyckoff Method** | Climax detection, auto-tracked accumulation/distribution trading ranges, Spring / Upthrust / SOS / SOW events |
| **Volume Spread Analysis** | Bar-by-bar supply/demand reads: No Demand, No Supply, Stopping Volume, Climaxes, Upthrust bars, Shakeouts, Tests, Effort-vs-No-Result |
| **Multi-Timeframe** | Dashboard showing trend, Wyckoff context, last VSA signal, and volume state on the chart TF plus two higher timeframes, with a confluence bias row |

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
- The **Bias** row sums the three trend states (chart + HTF1 + HTF2, each ±1): ≥ +2 → `BULLISH ALIGNMENT`, ≤ −2 → `BEARISH ALIGNMENT`, otherwise `MIXED / WAIT`.
- HTF values use the last **completed** higher-timeframe bar (`[1]` offset + `lookahead_on`) — the standard non-repainting idiom. HTF rows therefore update only when an HTF bar closes.
- If you fix an "HTF" at or below the chart timeframe, its TF cell turns orange as a warning.

### Confluence setups

Optional `Long` / `Short` triangles (on by default) print when three things line up on a closed bar:

- **Long**: both HTF trends net bullish + chart structure not bearish + a bullish trigger (Spring, SOS, No Supply, Test, Stopping Volume, or Shakeout).
- **Short**: mirror image (Upthrust, SOW, No Demand, upthrust bar, or Buying Climax).

These are analytical prompts, not trade advice — they mark moments worth your attention, with the full context one glance away on the dashboard.

## Alerts

Right-click the chart → **Add alert** → set *Condition* to **DWVM** and pick one of:

Dow trend turned UP / DOWN · Wyckoff Spring · Wyckoff Upthrust · Sign of Strength · Sign of Weakness · VSA No Supply · VSA No Demand · VSA Climactic volume · Long confluence setup · Short confluence setup

Use **"Once per bar close"** — every signal in this indicator is defined on the closed bar.

## Settings reference

| Group | Setting | Default | Notes |
|---|---|---|---|
| Dow Theory | Pivot length | 5 | Bigger = fewer, more significant swings |
| | Show structure visuals / swings / BOS / background | on | Visual toggles only — trend logic always runs |
| Wyckoff | Enable module | on | Requires volume data |
| | AR window | 10 | Bars after a climax that define the range |
| | Max range lifetime | 300 | Stale ranges are abandoned |
| | Draw trading-range box | on | |
| VSA | Enable module | on | Requires volume data |
| | Volume / spread average length | 20 | |
| | Ultra / high / low volume multiples | 2.0 / 1.5 / 0.7 | Of the volume average |
| MTF | HTF 1, HTF 2 | auto (≈4×, ≈16×) | Or fix e.g. 4H and 1D |
| | Dashboard position / text size | Top right / Small | |
| Signals | Plot confluence setups | on | |

## Non-repainting behavior & limitations

- **Nothing repaints**: all signals, labels, and state changes are computed on bar close (`barstate.isconfirmed`), and HTF data comes from completed HTF bars only.
- **Everything lags by design**: pivot labels confirm `Pivot length` bars late; HTF rows update on HTF bar close. That is the price of signals that don't move.
- **Volume quality matters**: on spot forex and CFDs, "volume" is tick volume; VSA still works but treat it with extra skepticism. Symbols with no volume at all run in price-only mode (Dow + MTF trend).
- Heuristics, not oracles: Wyckoff phase detection is a simplified mechanical model of a discretionary method. Use it as a map, not a trade signal generator.
- Auto-HTF needs a time-based chart (not tick/range bars).

## Disclaimer

For educational and analytical use only. Nothing here is financial advice; trading involves substantial risk of loss. Test on historical data before relying on any signal.
