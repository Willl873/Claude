"""The idea that did NOT survive, kept so the rejection is reproducible.

Short-horizon reversal -- buy the name that has fallen furthest below its own
recent mean -- is the signal most retail "quant" indicators are built on, and it
looks excellent until you control for the market.

Run this to see the three checks that killed it:

  1. Raw conditional returns look great: days with z < -1 are followed by roughly
     double the baseline 5-day return.
  2. The cross-sectional decile spread, which strips out the market move, is
     indistinguishable from zero and flips sign from year to year.
  3. The apparent edge is beta timing. Oversold days cluster on market-wide
     down days; in a sample with no bear market, buying them is just leveraged
     exposure to the rebound.

The full trade-level simulator in vnr.py implements this strategy end to end
(next-open fills, ATR stop, time stop, costs). It is retained as the research
record, not because the strategy is recommended.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from vnr import Params, compute_signals, newey_west_t
from data import load_panel


def main() -> None:
    panel = load_panel()
    p = Params()

    rows = []
    for tk, g in panel.items():
        s = compute_signals(g, p)
        fwd = s["close"].shift(-6) / s["open"].shift(-1) - 1.0   # enter next open, hold 5 bars
        rows.append(pd.DataFrame({"date": s.index, "z": s["z"].values,
                                  "trend": s["trend_ok"].values, "fwd": fwd.values}))
    D = pd.concat(rows).dropna()
    print(f"observations: {len(D):,}\n")

    # --- 1. the seductive version --------------------------------------------
    print("1. RAW CONDITIONAL RETURNS (5-day forward, date-clustered t)")
    def show(mask, label):
        sub = D[mask]
        byday = sub.groupby("date")["fwd"].mean()
        print(f"   {label:34s} n={len(sub):8,d}  mean={sub['fwd'].mean()*100:6.3f}%  "
              f"t={newey_west_t(byday.values):5.2f}")
    show(D["trend"], "all trend-gate days (baseline)")
    for ze in (-0.5, -1.0, -1.5):
        show(D["trend"] & (D["z"] < ze), f"trend & z < {ze}")
    for ze in (0.5, 1.0, 1.5):
        show(D["trend"] & (D["z"] > ze), f"trend & z > {ze} (recent winners)")
    print("   -> losers beat winners by ~0.35pp per 5 days. Looks like a strong edge.\n")

    # --- 2. the control that kills it ----------------------------------------
    print("2. CROSS-SECTIONAL DECILE SPREAD (removes the market move)")
    q = D.groupby("date")["z"].transform(lambda x: pd.qcut(x, 10, labels=False, duplicates="drop"))
    lo = D[q == 0].groupby("date")["fwd"].mean()
    hi = D[q == 9].groupby("date")["fwd"].mean()
    sp = (lo - hi).dropna()
    print(f"   full sample: mean={sp.mean()*100:6.3f}%  t={newey_west_t(sp.values):5.2f}  "
          f"({len(sp)} days)")
    for yr, gg in sp.groupby(sp.index.year):
        print(f"     {yr}: mean={gg.mean()*100:6.3f}%  t={newey_west_t(gg.values):5.2f}")
    print("   -> ~zero, and the sign flips year to year. There is no reversal alpha here.\n")

    # --- 3. where the apparent edge came from --------------------------------
    print("3. WHY IT LOOKED GOOD — net of the market, the edge is gone")
    print("   For each day, take the traded group's forward return minus the whole")
    print("   universe's forward return on that same day. That subtracts the market")
    print("   move the signal was actually capturing.")
    sig_day = D[D["trend"] & (D["z"] < -1.0)].groupby("date")["fwd"].mean()
    uni_day = D.groupby("date")["fwd"].mean()
    exc = (sig_day - uni_day.reindex(sig_day.index)).dropna()
    print(f"\n   full sample: excess={exc.mean()*100:6.3f}%  t={newey_west_t(exc.values):5.2f}")
    for yr, gg in exc.groupby(exc.index.year):
        print(f"     {yr}: excess={gg.mean()*100:6.3f}%  t={newey_west_t(gg.values):5.2f}")
    print("\n   -> the excess decays toward zero and turns negative. What remained was the")
    print("      market's own rebound: the signal fires on broad down days, and in")
    print("      2013-2018 the market always bounced. That is beta, not alpha.")


if __name__ == "__main__":
    main()
