# Confluence Pre-Trade Checklist — TradingView Indicator

A Pine Script v6 indicator that combines **RSI, Fibonacci, VIX, greeks (proxies), VWAP,
MACD, and candlestick patterns** into a single on-chart **pre-trade checklist**. Each
module produces a Long-side and Short-side pass/fail; the checklist scores both sides
and prints a verdict — **GO LONG / GO SHORT / STAND ASIDE** — along with an ATR-based
entry, stop, and target.

> ⚠️ Educational tool only. Nothing here is financial advice, and no indicator
> combination guarantees profitable trades.

## Installation

1. Open [TradingView](https://www.tradingview.com/) and open any chart.
2. Open the **Pine Editor** (bottom panel).
3. Delete the boilerplate, paste the entire contents of
   [`confluence-pretrade-checklist.pine`](confluence-pretrade-checklist.pine).
4. Click **Add to chart**. The checklist table appears in the top-right corner
   (position configurable in settings).

## The 12 checks

| # | Check | Long passes when | Short passes when |
|---|-------|------------------|-------------------|
| 1 | **Trend** (EMA 50/200) | Price above slow EMA and fast EMA > slow EMA | Mirrored |
| 2 | **RSI** (14) | RSI in the 50–70 zone, or just crossed up out of oversold | RSI in 30–50, or just crossed down out of overbought |
| 3 | **MACD** (12/26/9) | MACD above signal and histogram rising | MACD below signal and histogram falling |
| 4 | **VWAP** (anchored) | Price above VWAP | Price below VWAP |
| 5 | **Fibonacci** (auto) | Up-swing pulling back into the 38.2/50/61.8% zone | Down-swing rallying into the 38.2/50/61.8% zone |
| 6 | **VIX regime** | VIX below the "fear" threshold (default 30) — direction-neutral | Same |
| 7 | **Δ Delta proxy** | Directional exposure > +0.2 | < −0.2 |
| 8 | **Γ Gamma proxy** | Momentum accelerating up | Accelerating down |
| 9 | **Θ Theta proxy** | ADX ≥ 20 (trending tape — chop bleeds option premium) — neutral | Same |
| 10 | **ν Vega proxy** | VIX percentile ≤ 80 (premium not extreme) — neutral | Same |
| 11 | **Candlestick** | Bull Engulfing / Hammer / Morning Star within last 3 bars | Bear Engulfing / Shooting Star / Evening Star |
| 12 | **Volume** | Current volume above its 20-bar average — neutral | Same |

The verdict fires **GO LONG** when the long side scores at least the configurable
minimum (default **7 of 12**) *and* beats the short side (and vice versa). Anything
else is **STAND ASIDE**. Three alert conditions are included (long setup, short
setup, any setup) — attach them via TradingView's *Create Alert* dialog.

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
- **Vega ≈ IV richness** — the VIX's 1-year percentile plus a VIX-minus-realised-vol
  spread shown in the table. High percentile = expensive premium and vol-crush risk
  for option buyers.

If you trade options and need real greeks, get them from your broker's chain — then
use rows 7–10 here as a regime sanity-check, not as a pricing model.

## What's drawn on the chart

- **EMAs** (50 orange, 200 blue) — trend context
- **VWAP with ±2σ bands** (teal) — anchored to the session intraday, month on daily
  charts, year on weekly+
- **Auto Fibonacci retracement** — dashed levels (0 → 100%) from the highest/lowest
  point of the lookback window (default 100 bars), direction-aware
- **Candlestick pattern markers** — ▲ bull patterns, ▼ bear patterns, ◆ doji
- **Background flash** — green/red on the bar a GO verdict first fires

## Key settings

| Group | Setting | Default |
|-------|---------|---------|
| General | Min checks for a GO verdict | 7 |
| Trend | Fast / slow EMA | 50 / 200 |
| RSI | Length, OB, OS | 14 / 70 / 30 |
| MACD | Fast / slow / signal | 12 / 26 / 9 |
| VWAP | Band multiplier | 2.0 σ |
| Fibonacci | Swing lookback, proximity tolerance | 100 bars, 0.5 × ATR |
| VIX | Symbol, calm / fear thresholds | CBOE:VIX, 20 / 30 |
| Greeks | Delta lookback, min ADX, max VIX %ile | 14 / 20 / 80 |
| Candlesticks | Pattern validity window | 3 bars |
| Risk | Stop distance, target | 1.5 × ATR, 2 R |

## Notes & caveats

- The VIX regime row uses the **daily** VIX close regardless of chart timeframe; the
  current day's value updates in real time until the daily close.
- On symbols with no volume data (many indices, some FX feeds), the VWAP and volume
  rows show "n/a" and simply fail — lower the min-score threshold accordingly, or
  chart the corresponding futures/ETF instead.
- Auto-fib picks the highest high / lowest low of the lookback window. On strongly
  trending charts with no meaningful swing, the retracement zone may be far from
  price — that check failing is by design ("no pullback edge here").
- The checklist evaluates on the live bar; like all real-time indicators, values can
  change until the bar closes. For conservative use, act only on closed bars.
