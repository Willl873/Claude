"""Robustness checks on the regime overlay.

A single good backtest means very little. This script asks the four questions
that usually kill a strategy:

  1. Is the parameter a plateau or a spike?  (MA length x vol-target grid)
  2. Does it survive transaction costs?
  3. Is it an artifact of the pre-1926 Shiller data, which is monthly averages
     of daily closes rather than true month-end prices?
  4. Does it beat a random overlay with the same average exposure?
"""

from __future__ import annotations

import os
import numpy as np
import pandas as pd

from longrun_regime import load_sp500_monthly, stats, MONTHS

RESULTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "results")
rng = np.random.default_rng(20240804)


def overlay_returns(d: pd.DataFrame, ma_len: int, target_vol: float | None,
                    cost_bps: float = 0.0, max_lev: float = 1.0) -> pd.Series:
    p, r, rf = d["SP500"], d["tr"], d["rf"]
    w = (p > p.rolling(ma_len).mean()).astype(float)
    if target_vol is not None:
        rv = r.rolling(12).std(ddof=0) * np.sqrt(MONTHS)
        w = w * (target_vol / rv).clip(upper=max_lev)
    w = w.shift(1)
    gross = w * r + (1 - w).clip(lower=0) * rf
    turnover = w.diff().abs().fillna(0.0)
    return gross - turnover * cost_bps / 1e4


def main() -> None:
    d = load_sp500_monthly()
    rf = d["rf"]

    # ---------------------------------------------------------------- 1. grid
    print("1. PARAMETER SENSITIVITY -- Sharpe (156y). Buy & hold = "
          f"{stats(d['tr'], rf)['sharpe']:.2f}\n")
    ma_grid = [6, 8, 9, 10, 11, 12, 14, 16, 20]
    tv_grid = [None, 0.08, 0.10, 0.12, 0.15, 0.20]
    print(f"{'MA(months)':>11s} " + " ".join(f"{'none' if t is None else f'{t:.0%}':>7s}" for t in tv_grid))
    print("-" * 60)
    grid = {}
    for ma in ma_grid:
        cells = []
        for tv in tv_grid:
            s = stats(overlay_returns(d, ma, tv), rf)["sharpe"]
            grid[(ma, tv)] = s
            cells.append(f"{s:7.2f}")
        print(f"{ma:11d} " + " ".join(cells))
    vals = np.array(list(grid.values()))
    print(f"\n   grid mean {vals.mean():.2f}, min {vals.min():.2f}, max {vals.max():.2f} "
          f"-- {100*(vals > stats(d['tr'], rf)['sharpe']).mean():.0f}% of the "
          f"{len(vals)} parameter pairs beat buy & hold")

    # ------------------------------------------------------------- 2. costs
    print("\n2. TRANSACTION COSTS (MA=10, vol target 12%)")
    print(f"{'cost bps/side':>14s} {'CAGR':>8s} {'Sharpe':>8s}")
    print("-" * 32)
    for cb in [0, 5, 10, 25, 50, 100]:
        s = stats(overlay_returns(d, 10, 0.12, cost_bps=cb), rf)
        print(f"{cb:14d} {s['cagr']:7.2%} {s['sharpe']:8.2f}")
    w = (d["SP500"] > d["SP500"].rolling(10).mean()).astype(float).shift(1)
    print(f"   round trips per year: {w.diff().abs().sum() / (len(d)/12) / 2:.2f}")

    # ------------------------------------------------- 3. modern data only
    print("\n3. SUB-SAMPLE STABILITY (MA=10, vol target 12%)")
    print(f"{'sample':>18s} {'BH Sharpe':>10s} {'overlay':>9s} {'BH maxDD':>10s} {'overlay DD':>11s}")
    print("-" * 62)
    for label, lo, hi in [("full 1871-2026", 1871, 2027), ("post-1926 only", 1926, 2027),
                          ("post-1950 only", 1950, 2027), ("post-1990 only", 1990, 2027)]:
        m = (d.index.year >= lo) & (d.index.year < hi)
        ov = overlay_returns(d, 10, 0.12)[m]
        bh = d["tr"][m]
        sb, so = stats(bh, rf[m]), stats(ov, rf[m])
        print(f"{label:>18s} {sb['sharpe']:10.2f} {so['sharpe']:9.2f} "
              f"{sb['max_dd']:9.1%} {so['max_dd']:10.1%}")

    # ------------------------------------------------- 4. random-exposure null
    print("\n4. RANDOM-OVERLAY NULL")
    print("   Shuffle the overlay's weights in time, keeping the exact same set of")
    print("   weights (so identical average exposure and leverage distribution).")
    real = overlay_returns(d, 10, 0.12)
    real_sharpe = stats(real, rf)["sharpe"]
    rvol = d["tr"].rolling(12).std(ddof=0) * np.sqrt(MONTHS)
    w_real = ((d["SP500"] > d["SP500"].rolling(10).mean()).astype(float)
              * (0.12 / rvol).clip(upper=1.0)).shift(1)
    valid = w_real.dropna()
    null = []
    for _ in range(2000):
        shuf = pd.Series(rng.permutation(valid.values), index=valid.index)
        r = shuf * d["tr"] + (1 - shuf).clip(lower=0) * rf
        null.append(stats(r.dropna(), rf)["sharpe"])
    null = np.array(null)
    p = (null >= real_sharpe).mean()
    print(f"   real Sharpe {real_sharpe:.3f} | null mean {null.mean():.3f} "
          f"sd {null.std():.3f} | p = {p:.4f}  ({(p<0.05) and 'significant' or 'NOT significant'})")

    dd_real = stats(real, rf)["max_dd"]
    null_dd = []
    for _ in range(2000):
        shuf = pd.Series(rng.permutation(valid.values), index=valid.index)
        r = (shuf * d["tr"] + (1 - shuf).clip(lower=0) * rf).dropna()
        null_dd.append(stats(r, rf)["max_dd"])
    null_dd = np.array(null_dd)
    # drawdowns are negative: "at least as shallow as the real one" is >=
    print(f"   real maxDD {dd_real:.1%} | null mean {null_dd.mean():.1%} "
          f"| p = {(null_dd >= dd_real).mean():.4f} "
          f"(real overlay was shallower than {100*(null_dd < dd_real).mean():.1f}% of nulls)")

    pd.DataFrame(
        [{"ma": k[0], "target_vol": k[1], "sharpe": v} for k, v in grid.items()]
    ).to_csv(os.path.join(RESULTS, "param_grid.csv"), index=False)
    print(f"\nwrote {RESULTS}/param_grid.csv")


if __name__ == "__main__":
    main()
