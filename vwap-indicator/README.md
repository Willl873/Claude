# VWAP Indicators

Two complementary TradingView **Pine Script v6** VWAP indicators:

- **[Anchored VWAP + Bands](#anchored-vwap--bands)** (`anchored_vwap.pine`) — the
  classic, fundamental VWAP: one anchored VWAP with volume-weighted σ bands.
- **[Multi-Timeframe VWAP](#multi-timeframe-vwap)** (`multi_timeframe_vwap.pine`) —
  yesterday + London-session + current-day VWAP layered on one chart.

Run them together (foundation + intraday context) or on their own.

---

## Multi-Timeframe VWAP

A TradingView **Pine Script v6** indicator that overlays three volume-weighted
average price (VWAP) references on one intraday chart:

| Plot | Meaning |
| --- | --- |
| **Current Day VWAP** | Standard session VWAP, anchored to the start of the current trading day. |
| **Yesterday VWAP** | The *final* VWAP value from the previous trading day, frozen and carried forward as a horizontal reference line. |
| **London Session VWAP** | VWAP that accumulates only during the London session, reset at each London open. |

## Install

1. Open TradingView → **Pine Editor**.
2. Paste the contents of [`multi_timeframe_vwap.pine`](./multi_timeframe_vwap.pine).
3. Click **Add to chart**.

## Settings

- **VWAP Source** — price series used for the weighting (default `hlc3`).
- **Hide on daily+ timeframes** — the intraday anchors are meaningless on daily
  and higher charts, so the plots are suppressed there by default.
- **Current Day / Yesterday / London** — each has an independent show toggle and
  color.
- **London Session** — session window (default `0800-1630`) and IANA timezone
  (default `Europe/London`). Adjust the window if you prefer the FX London
  window (e.g. `0300-1200` in `America/New_York`).
- **Show price labels** — end-of-line labels showing each VWAP's current value.

## Notes

- Designed for intraday timeframes (1m–1h). Use it on a symbol with real volume;
  on volume-less feeds VWAP is undefined.
- Yesterday's line reflects yesterday's *completed* VWAP and does not change
  during the current day.
- London and Yesterday lines use `plot.style_linebr` so they break cleanly at
  each new session/day rather than drawing a diagonal across the gap.

---

## Anchored VWAP + Bands

The classic, fundamental VWAP indicator: a single volume-weighted average price
anchored to a chosen period, wrapped in volume-weighted standard-deviation bands.

- **VWAP** = Σ(price × volume) ÷ Σ(volume), accumulated since the anchor. Price above
  it means buyers have controlled the period; below means sellers have.
- **σ bands** measure how stretched price is from that fair value, using the
  *volume-weighted* standard deviation (variance = Σ(price²·vol)/Σvol − VWAP²). Price
  reaching the 2σ/3σ band is statistically extended relative to the anchor.

### Settings

- **Source** — price series (default `hlc3`).
- **Anchor Period** — where accumulation resets: `Session / Day` (default), `Week`,
  `Month`, `Quarter`, or `Year`.
- **Band Basis** — `Standard Deviation` (default; `VWAP ± mult × σ`) or `Percentage`
  (`VWAP × (1 ± pct%)`).
- **Band 1 / 2 / 3** — each has a show toggle and a multiplier (defaults 1.0 / 2.0 /
  3.0; band 3 off by default).
- **Style** — VWAP color, band color, and a toggle to shade the fills between bands.

### Alerts

Built-in `alertcondition`s fire when price closes above or below the VWAP.

### Install

Same as above — paste [`anchored_vwap.pine`](./anchored_vwap.pine) into the Pine
Editor and **Add to chart**. Works on any timeframe with real volume; the default
`Session / Day` anchor suits intraday charts, while `Week`/`Month` anchors suit swing
trading on higher timeframes.
