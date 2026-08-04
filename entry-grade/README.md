# Entry Grade

A Pine Script v6 TradingView indicator that scores 0–100 how good it is to enter a
position at the current price, on any timeframe from 1-second to monthly.

`EntryGrade.pine` — paste into the TradingView Pine Editor and "Add to chart".

Three orthogonal components, scored independently for long and short:

| | Component | Default weight | What it measures |
|---|---|---|---|
| A | Statistical mean reversion | 0.40 | Log-price z-score, gated by an OU half-life and a variance ratio |
| B | VWAP dislocation | 0.30 | Gaussian "sweet spot" bump around ±1.75σ from anchored VWAP, slope-adjusted |
| C | Opening range structure | 0.30 | Zone map: reclaim / chop / breakout-retest / chase, scaled by range quality |

The composite applies a disagreement penalty — when the three components point in
different directions, the score is pulled back toward 50.

Full parameter defaults, assumptions, known limitations, and the eight places where
the written spec was internally inconsistent (and how each was resolved) are in the
header comment block of `EntryGrade.pine`.

---

## Test plan

Load each of these and check the listed behaviours. The info table in the top right
is the fastest way to verify — it exposes every intermediate value.

### 1. SPY, 5m — intraday equity, the primary case

- **Anchor** should read `session` (5m ≤ 15m). VWAP resets at each new day on the
  price chart.
- **OR** forms over the first 30 minutes (six 5m bars) from 09:30 ET. Before it
  completes, the score is `na` (blank plot) and the table flags `OR-FORMING`.
  The OR high/low/mid lines appear on the price chart the moment it freezes.
- Set **Before the OR completes** to `Neutral 50` and confirm the score now plots
  from the open instead of leaving a gap.
- Check `pos (OR)` moves through the zones: near 0.5 mid-morning the C subscore
  should sit near 45 × wOR; on a push through the OR high and a pullback to
  ~1.1, C should jump toward 90 × wOR.
- **Repaint check**: note the score on a closed bar, then reload the chart. The
  value must be identical. Do this on a bar in the last hour.

### 2. BTCUSD (or BTCUSDT), 1h — 24/7 crypto

- **Anchor** should read `week` (1h is in the 30m–4h band).
- The OR anchors to **00:00 UTC**, not to an exchange session — change the
  *24/7 anchor timezone* input to `America/New_York` and confirm the OR lines
  shift to 00:00 ET. This is the input that only matters for 24/7 symbols.
- Volume is real here, so no `TWAP` flag.
- Weekends included — confirm no gaps in the score and no spurious anchor resets.

### 3. AAPL, 1D — daily equity

- **Anchor** should read `month` (1D is in the 1D–3D band).
- **OR** is the **first daily bar of the week** (usually Monday), frozen from
  Tuesday's open. Verify the OR lines are flat at Monday's high/low and that
  Monday itself scores `na` — the OR is not usable while its own bar is forming.
- Check a big earnings gap: `q = orRange/ATR` should blow past 2, `wOR` should
  floor at 0.5, and the table should flag `OR-BLOATED`.

### 4. Any liquid symbol, 1W — weekly chart

- **Anchor** should read `year`; **OR** is the first weekly bar of the month.
- Confirm the score exists at all — this is mostly a warm-up test. With N = 100
  the script needs ~107 weekly bars, so use a symbol with 3+ years of history
  (SPY, AAPL, and BTCUSD all qualify).
- Also load **1M (monthly)** briefly: the OR should become the first month of
  each calendar quarter (Jan/Apr/Jul/Oct).

### 5. EURUSD (FX_IDC:EURUSD is best), any timeframe — no real volume

- The table **must** flag `TWAP`, and the VWAP line on the price chart turns
  **orange** instead of blue. This is the no-volume fallback path.
- Compare against OANDA:EURUSD, which reports tick volume: that one should *not*
  flag TWAP, and the B subscore will differ. That difference is expected and is
  exactly why the flag exists — the two are different statistics.

### 6. ES1! or NQ1!, 15m — futures with extended hours

- Turn **on** extended hours in the chart settings. This is the case where VWAP
  and the OR intentionally diverge: session VWAP anchors at the **ETH open**
  (18:00 ET) while the OR anchors at the **regular open** (09:30 ET). Confirm the
  VWAP line starts hours before the OR lines appear.
- Turn extended hours **off** and confirm both now start at 09:30.

### 7. Cross-cutting checks (do on SPY 5m)

- **Confirm on bar close**: with it on, the score must not move at all while a bar
  is forming. Turn it off and confirm the score wiggles intrabar and the table
  header shows `● LIVE`.
- **Direction mode**: switch Long → Short and confirm the two scores are *not*
  complements — `scoreLong + scoreShort` should almost never equal 100.
- **Calibration**: turn on *Show calibration* with H = 20 and read the second
  table. Check the `n` column before the verdict — with defaults the extreme
  buckets are thinly populated, so a `FAIL` on 12 samples means nothing.
- **Sub-minute**: load 1s or 10s. The score should still compute. Note the
  `VR` reading will sit well below 1 from bid-ask bounce, pinning `wRegime` at
  1.0 and over-weighting component A. Raise N to 600+ as the header advises.
- **Alerts**: open the alert dialog and confirm all three `alertcondition`
  entries are listed ("crossed above high threshold", "crossed below low
  threshold", "opening range complete").

---

## Tuning the weights for trending vs range-bound instruments

The three components are not regime-neutral, and the default 0.40 / 0.30 / 0.30
split is a compromise aimed at a mixed instrument. On a **trending** instrument
(index futures on a directional stretch, a crypto majors bull leg, a momentum
single-name) component A is the one actively working against you: it scores a
stretched-high z-score as a *bad* long, which in a trend is precisely when the long
is working. The variance-ratio gate already handles some of this automatically —
VR climbs above 1.15 and `wRegime` shrinks A to neutral on its own — but the gate is
a lagging estimate over N bars and it will not save you through a regime change, so
cut wA to 0.15–0.20 and push the freed weight into C (0.40–0.45), which is the only
component that rewards continuation: the breakout-retest zone at pos 1.0–1.25 is the
highest-scoring state in the whole system. On a **range-bound** instrument (a
mean-reverting pair, a quiet FX cross, an equity chopping in a two-week base) do the
opposite: A up to 0.50–0.55, C down to 0.15, because in a range the OR breakout zones
fire constantly and mostly fail, while the z-score and the VWAP bump are both
measuring the thing that actually pays. Component B is the most regime-robust of the
three and rarely needs to move off 0.30 in either direction. Whichever way you go,
raise `gamma` toward 1.5–2.0 as you concentrate weight, because a lopsided weighting
makes the disagreement penalty the main thing standing between you and a confidently
wrong score — and re-check the calibration table after every change, since that is
the only part of the script that will tell you the retune made things worse.
