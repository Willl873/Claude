# Confluence Pre-Trade Checklist — TradingView Indicator + Strategy

A Pine Script v6 indicator that combines **RSI, RSI divergence, Fibonacci, VIX, greeks
(proxies), VWAP, MACD, candlestick patterns, and higher-timeframe confirmation** into a
single on-chart **pre-trade checklist**. Each of the 14 checks produces a Long-side and
Short-side pass/fail and carries a user-configurable **weight**; three checks can be
marked as **vetoes** that block a trade outright. The checklist scores both sides and
prints a verdict — **GO LONG / GO SHORT / STAND ASIDE** — along with an ATR-based
entry, stop, target, and a risk-based position size.

A backtestable **strategy twin** (`confluence-pretrade-strategy.pine`) runs the same
logic through TradingView's Strategy Tester.

> ⚠️ Educational tool only. Nothing here is financial advice, and no indicator
> combination guarantees profitable trades.

## Files

| File | What it is |
|------|------------|
| `confluence-pretrade-checklist.pine` | The on-chart indicator: checklist table, legend, fibs, VWAP, markers, alerts |
| `confluence-pretrade-strategy.pine`  | Strategy twin for backtesting the GO verdicts (win rate, expectancy, drawdown) |

## Installation

1. Open [TradingView](https://www.tradingview.com/) and open any chart.
2. Open the **Pine Editor** (bottom panel).
3. Delete the boilerplate, paste the entire contents of
   [`confluence-pretrade-checklist.pine`](confluence-pretrade-checklist.pine).
4. Click **Add to chart**. The checklist appears top-right, the legend bottom-left
   (both positions configurable).

For backtesting, repeat with
[`confluence-pretrade-strategy.pine`](confluence-pretrade-strategy.pine) and open the
**Strategy Tester** tab.

## The 14 checks

| # | Check | Long passes when | Short passes when |
|---|-------|------------------|-------------------|
| 1 | **Trend** (EMA 50/200) | Price above slow EMA and fast EMA > slow EMA | Mirrored |
| 2 | **HTF trend** (default: daily) | Same trend test passes on the higher timeframe | Mirrored |
| 3 | **RSI** (14) | RSI in the 50–70 zone, or just crossed up out of oversold | RSI in 30–50, or just crossed down out of overbought |
| 4 | **RSI divergence** | Price made a lower low while RSI made a higher low (recent, pivot-confirmed) | Price higher high, RSI lower high |
| 5 | **MACD** (12/26/9) | MACD above signal and histogram rising | MACD below signal and histogram falling |
| 6 | **VWAP** (anchored) | Price above VWAP | Price below VWAP |
| 7 | **Fibonacci** (pivot-anchored) | Up-swing pulling back into the 38.2/50/61.8% zone | Down-swing rallying into the 38.2/50/61.8% zone |
| 8 | **Vol-index regime** | Vol index below the "fear" threshold (default 30) — direction-neutral | Same |
| 9 | **Δ Delta proxy** | Directional exposure > +0.2 | < −0.2 |
| 10 | **Γ Gamma proxy** | Momentum accelerating up | Accelerating down |
| 11 | **Θ Theta proxy** | ADX ≥ 20 (trending tape — chop bleeds option premium) — neutral | Same |
| 12 | **ν Vega proxy** | Vol-index percentile ≤ 80 (premium not extreme) — neutral | Same |
| 13 | **Candlestick** | Bull Engulfing / Hammer / Morning Star within last 3 bars | Bear Engulfing / Shooting Star / Evening Star |
| 14 | **Volume** | Current volume above its 20-bar average — neutral | Same |

## Scoring, weights, and vetoes

- Every check has a **weight** (0–3, default 1; 0 disables it). The side's score is
  the weighted sum of its passing checks, shown as a **percentage of total weight**.
- A **GO** verdict requires: score % ≥ the threshold (default **60%**), the winning
  side beating the other, all enabled **vetoes** passing, and the session filter (if
  on) allowing trades.
- **Veto checks** (settings → "Veto checks"): trend, HTF trend, and vol-index regime
  can each be marked *required*. Defaults: **HTF trend and VIX regime are vetoes** —
  no signal fires against the higher timeframe or into a panic tape. Weight (`×N`)
  and veto (`•veto`) tags appear next to check names in the table.
- Three static alert conditions are included (long / short / any), plus a
  **webhook-ready `alert()`** that emits JSON (`ticker, timeframe, side, scorePct,
  entry, stop, target, qty`) — create an alert with condition *"Any alert() function
  call"* to use it for automation.

## About "the greeks" — read this

Pine Script **cannot access options-chain data**, so true delta/gamma/theta/vega are
impossible to compute in any TradingView indicator (anyone claiming otherwise is
approximating, whether they say so or not). This script uses transparent,
clearly-labelled proxies instead:

- **Delta ≈ directional exposure** — ATR-normalised linear-regression slope,
  clamped to [−1, +1]. Answers: "how directional is this tape?"
- **Gamma ≈ convexity** — the change in the delta proxy over the last 3 bars.
  Answers: "is directionality accelerating?"
- **Theta ≈ time-decay risk** — ADX chop filter. Ranging markets (ADX < 20) are
  where long-premium positions bleed theta with no payoff.
- **Vega ≈ IV richness** — the vol index's 1-year percentile plus an IV-minus-
  realised-vol spread shown in the table. High percentile = expensive premium and
  vol-crush risk for option buyers.

If you trade options and need real greeks, get them from your broker's chain — then
use rows 9–12 here as a regime sanity-check, not as a pricing model.

## What's drawn on the chart

- **EMAs** (50 orange, 200 blue) — trend context
- **VWAP with ±2σ bands** (teal) — anchor selectable: auto (session intraday, month
  on daily, year on weekly+), session, week, month, year, or a custom date
- **Auto Fibonacci retracement** — dashed levels (0 → 100%) anchored to the last
  confirmed swing pivots (falls back to the window high/low), direction-aware
- **Candlestick pattern markers** — ▲ bull patterns, ▼ bear patterns, ◆ doji
- **Divergence markers** — "D" labels at the RSI pivot where a divergence confirmed
- **Background flash** — green/red on the bar a GO verdict first fires
- **Legend** — a second on-chart table (bottom-left by default, toggleable) explaining
  every line, marker, and checklist symbol, including the greeks-are-proxies caveat

## Key settings

| Group | Setting | Default |
|-------|---------|---------|
| General | Min weighted score % for GO | 60% |
| General | Confirmed-bars-only mode (no repaint) | Off |
| General | Show legend / positions / text size | On |
| Trend | Fast / slow EMA | 50 / 200 |
| HTF | Confirmation timeframe | D |
| RSI | Length, OB, OS | 14 / 70 / 30 |
| Divergence | Pivot left/right, validity window | 5 / 2 / 14 bars |
| MACD | Fast / slow / signal | 12 / 26 / 9 |
| VWAP | Band multiplier, anchor | 2.0 σ, Auto |
| Fibonacci | Pivot anchoring, pivot strength, tolerance | On, 10, 0.5 × ATR |
| Vol index | Auto-select (VXN/RVX/VIX), calm / fear | On, 20 / 30 |
| Greeks | Delta lookback, min ADX, max percentile | 14 / 20 / 80 |
| Candlesticks | Pattern validity window | 3 bars |
| Session filter | Window, skip-open minutes | Off, 0930–1600, 15 min |
| Weights | Per-check weight (0 disables) | 1.0 each |
| Vetoes | Trend / HTF / VIX required | Off / **On** / **On** |
| Risk | Stop, target, account size, risk % | 1.5 × ATR, 2 R, 25 000, 1% |

## Backtesting with the strategy twin

The strategy file mirrors the indicator's checks and enters on GO verdicts at bar
close (`process_orders_on_close`), exits at the ATR stop or the R-multiple target,
and sizes each trade as `equity × risk% ÷ stop distance`. Use it to answer:

- Does a higher score threshold actually improve expectancy on your symbol/timeframe?
- Which checks earn their weight? Set a check's weight to 0, re-run, compare.
- Long-only vs both sides, veto on vs off, session filter on vs off.

Keep the two files' check logic in sync if you customise one.

## Improvement roadmap

Implemented in v2: ✅ divergence detection · ✅ HTF confirmation · ✅ weighted scoring
+ vetoes · ✅ pivot-anchored fibs · ✅ strategy/backtest port · ✅ position sizing ·
✅ symbol-aware vol index · ✅ session/time filter · ✅ confirmed-bar mode ·
✅ webhook JSON alerts · ✅ custom VWAP anchoring

Remaining ideas:

1. **Multi-symbol screener** — a companion script scanning a watchlist for symbols
   whose checklist currently scores ≥ threshold (needs its own script; Pine limits
   `request.security` fan-out per script).
2. **Per-check hit-rate stats** — a table tracking each check's historical win rate
   when it passed at entry, to prune dead-weight checks quantitatively.
3. **Economic-calendar blackout** — manual date-list input to suppress signals around
   FOMC/CPI releases.

## Notes & caveats

- The vol-index row uses the **daily** close regardless of chart timeframe; the
  current day's value updates in real time until the daily close. Auto-selection
  covers NDX/QQQ → VXN and RUT/IWM → RVX; everything else uses VIX (override in
  settings).
- On symbols with no volume data (many indices, some FX feeds), the VWAP and volume
  rows show "n/a" and simply fail — set their weights to 0, or chart the
  corresponding futures/ETF instead.
- Divergences confirm **after** the pivot completes (default 2 bars) — that lag is
  the price of a non-repainting signal.
- Pivot-anchored fibs update only when a new swing pivot confirms; on strongly
  trending charts with no meaningful swing the retracement zone may sit far from
  price — that check failing is by design ("no pullback edge here").
- The checklist evaluates on the live bar by default; enable **confirmed-bars-only
  mode** for repaint-free signals at bar close.
- Backtest results are estimates: fills, slippage, and commissions in the Strategy
  Tester are idealised. Add commission/slippage in the strategy's Properties tab
  before trusting any numbers.
