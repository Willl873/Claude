# Confluence Pre-Trade Checklist — TradingView Indicator + Strategy

A Pine Script v6 indicator with **two switchable modes**, each a 12-check weighted
scorecard with its own exit model:

- **Mean Reversion** (default, tuned for daily SPY/QQQ-style ETFs) — buy short-term
  panic dips inside a long-term uptrend, exit on the quick snap-back. This is the
  high-win-rate style: checks include **RSI(2), IBS, Bollinger %B, Williams %R,
  consecutive down closes, 5-SMA stretch, VIX stretch**, a 200-SMA regime filter,
  and weekly-trend confirmation.
- **Trend** — the classic pullback-in-trend stack: **EMA trend, RSI(14), RSI
  divergence, MACD, SuperTrend, VWAP, Fibonacci, VIX calm, ADX**, with an ATR stop
  and R-multiple target.

Each check produces a Long-side and Short-side pass/fail and carries a weight
(0 disables); regime, higher-timeframe trend, and the VIX panic gate can be marked
as **vetoes**. The verdict — **GO LONG / GO SHORT / STAND ASIDE** — shows with an
entry/stop/exit plan and a risk-based position size. A **strategy twin**
(`confluence-pretrade-strategy.pine`) backtests the same logic.

> ⚠️ Educational tool only. Nothing here is financial advice, and no indicator
> combination guarantees profitable trades.

## About the 80% win-rate goal — read this first

The previous (v2) version backtested below 50% win rate from 2016–2026. That wasn't
mainly an indicator problem — it was an **exit-model problem**: with a target 2×
the stop distance, even a genuinely good system wins well under half the time.
**Win rate is mostly determined by exits, not entries.**

- **Mean Reversion mode** is built from the family of setups (RSI(2)-style dip
  buying above the 200-SMA with snap-back exits) that has historically backtested
  in the **70–85% win-rate zone on daily index ETFs**. That's the credible path
  toward your target — but it is a *design target, not a guarantee*, and it comes
  with a trade-off: many small wins, occasional larger losses.
- **High win rate ≠ profitability.** A system can win 85% of trades and still lose
  money if the losers outweigh the winners. Always read **profit factor and
  expectancy (avg trade)** in the Strategy Tester alongside win rate.
- **Shorts drag win rate in bull regimes.** 2016–2026 was mostly a bull market;
  the regime and HTF vetoes (on by default) suppress counter-trend shorts, but for
  the highest win rate, disable "Allow shorts" in the strategy.
- **Beware overfitting.** If you tune thresholds until 2016–2026 shows 80%+, test
  a different symbol or period before believing it.

## Files

| File | What it is |
|------|------------|
| `confluence-pretrade-checklist.pine` | The on-chart indicator: checklist table, legend, plots, alerts |
| `confluence-pretrade-strategy.pine`  | Strategy twin for backtesting (win rate, profit factor, drawdown) |

## Installation

1. Open [TradingView](https://www.tradingview.com/), open a chart (daily SPY or QQQ
   to match the tuned defaults).
2. Open the **Pine Editor**, paste the contents of
   [`confluence-pretrade-checklist.pine`](confluence-pretrade-checklist.pine),
   click **Add to chart**.
3. For backtesting, repeat with
   [`confluence-pretrade-strategy.pine`](confluence-pretrade-strategy.pine) and
   open the **Strategy Tester** tab.

## The 12 checks

Rows 1–2 and 10–12 are shared; rows 3–9 switch with the mode.

| # | Mean Reversion mode | Long passes when | Trend mode | Long passes when |
|---|---------------------|------------------|------------|------------------|
| 1 | **Regime** (200-SMA) | Close above the 200-SMA | **Trend** (EMA 50/200) | Price above slow EMA, fast > slow |
| 2 | **HTF trend** (weekly) | Same trend test passes on the higher TF | same | same |
| 3 | **RSI(2) extreme** | RSI(2) < 10 (short: > 90) | **RSI(14) zone** | 50–70 zone or oversold cross-up |
| 4 | **IBS** | (close−low)/(high−low) < 0.2 (short: > 0.8) | **RSI divergence** | Recent pivot-confirmed bull divergence |
| 5 | **Bollinger %B** | Close below the lower 20/2 band (short: above upper) | **MACD** | Above signal, histogram rising |
| 6 | **Williams %R(14)** | ≤ −80 (short: ≥ −20) | **SuperTrend** (10/3) | Direction up |
| 7 | **Consecutive closes** | ≥ 2 down closes in a row (short: up closes) | **VWAP** (anchored) | Price above VWAP |
| 8 | **5-SMA stretch** | Close below the 5-SMA (snap-back fuel) | **Fibonacci** (pivot-anchored) | Pullback into the 38.2–61.8% zone |
| 9 | **VIX stretch** | Vol index above its 10-SMA — fear elevated is *good* for dip buys | **VIX calm** | Vol index below 30 |
| 10 | **ADX < 30** | Not a runaway trend (mean reversion fails in freight trains) | **ADX ≥ 20** | Trending tape |
| 11 | **Candlestick reversal** | Bull Engulfing / Hammer / Morning Star within 3 bars | same | same |
| 12 | **Volume** | Above its 20-bar average (capitulation) | same | same |

Short side mirrors every direction-dependent check.

## Scoring, weights, vetoes, and exits

- Each check has a **weight** (0–3, default 1; 0 disables). Score = weighted sum of
  passing checks as a **% of total weight**; a GO verdict needs ≥ the threshold
  (default **65%**), the winning side to beat the other, and all enabled vetoes.
- **Vetoes** (defaults all ON): regime, HTF trend, and the VIX panic gate. In MR
  mode the panic gate only blocks above VIX 45 — elevated fear is the *edge* for
  dip buying; in Trend mode it blocks above 30.
- **Exits differ by mode — this is what drives win rate:**
  - *Mean Reversion*: exit when close crosses the 5-SMA, RSI(2) recovers past 65,
    or a 5-bar time stop hits; disaster stop at 3×ATR. The winners are small and
    frequent; the disaster stop takes the rare big loss.
  - *Trend*: classic 1.5×ATR stop and 2R target (win rate will be far lower by
    construction — judge this mode on expectancy).
- Three static alert conditions plus a **webhook-ready `alert()`** emitting JSON
  (`ticker, timeframe, mode, side, scorePct, entry, stop, target, qty`).

## Why the greeks were removed

The v2 delta/gamma/theta/vega rows were **proxies computed from price and VIX**,
because Pine Script cannot read options-chain data — real greeks are impossible in
any TradingView indicator. In backtesting they added correlated noise rather than
edge, so v3 drops them. The useful parts survived under honest names: the ADX check
(was the theta proxy) and the VIX checks (was the vega proxy). If you trade options,
get real greeks from your broker's chain.

## What's drawn on the chart

- **200-SMA regime line** (purple) — both modes
- **5-SMA snap-back line** (yellow) + **Bollinger bands** (aqua) — MR mode
- **EMAs** (orange/blue) + **SuperTrend** (green/red) — Trend mode
- **VWAP with ±2σ bands** (teal), **auto Fibonacci** (dashed), pattern markers
  (▲ ▼ ◆), divergence "D" labels, and a green/red background flash when a GO
  verdict fires
- **Legend** — toggleable on-chart table explaining every symbol

## Backtesting with the strategy twin

Suggested first run: **SPY, 1D, 2016–2026, Mean Reversion mode, shorts disabled**.
Read: Percent Profitable (win rate), Profit Factor, Avg Trade, Max Drawdown. Then:

- Raise/lower the score threshold and watch win rate vs trade count.
- Set a check's weight to 0 and re-run — keep only checks that earn their weight.
- Re-enable shorts to see exactly what they cost in a bull decade.
- Add commission + slippage in Properties before trusting any numbers.

Keep the two files' check logic in sync if you customise one.

## Notes & caveats

- Defaults are tuned for **daily index ETFs**; on intraday or single stocks expect
  lower win rates and consider the session filter.
- The vol-index checks use the **daily** close regardless of chart timeframe;
  auto-selection maps NDX/QQQ → VXN and RUT/IWM → RVX, else VIX.
- Divergences confirm after the pivot completes (default 2 bars) — the lag is the
  price of a non-repainting signal.
- The checklist evaluates on the live bar by default; enable **confirmed-bars-only
  mode** for repaint-free signals at bar close (the strategy always fills at close).
- Remaining roadmap ideas: multi-symbol screener, per-check historical hit-rate
  table, economic-calendar blackout dates.
