# Multi-Timeframe VWAP

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
