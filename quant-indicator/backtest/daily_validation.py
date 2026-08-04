"""Daily-frequency validation of the exact rule the Pine script implements.

The long-run evidence is monthly and index-level. The Pine indicator runs on
daily bars, so this script checks that the daily translation (200-day MA, the
rough equivalent of a 10-month MA) behaves the way the monthly study predicts,
on the only daily sample available: 486 S&P 500 names, 2013-02 .. 2018-02.

That window contains no bear market, so the expected finding is that the
overlay LOSES return while cutting drawdown -- the same thing the monthly study
found in 1975-2000. A result in that shape is confirmation, not failure.
"""

from __future__ import annotations

import os
import numpy as np
import pandas as pd

from data import load_panel, equal_weight_index

TD = 252
RESULTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "results")


def daily_weights(c: pd.Series, ma_len=200, slope_len=20, vol_len=20,
                  target_vol=0.12, max_lev=1.0, use_slope=True) -> pd.DataFrame:
    r = np.log(c).diff()
    ma = c.rolling(ma_len).mean()
    trend = (c > ma)
    if use_slope:
        trend = trend & (ma > ma.shift(slope_len))
    rv = r.rolling(vol_len).std(ddof=0) * np.sqrt(TD)
    volw = (target_vol / rv).clip(upper=max_lev)
    return pd.DataFrame({
        "buy_hold": pd.Series(1.0, index=c.index),
        "trend": trend.astype(float),
        "voltgt": volw,
        "trend_voltgt": trend.astype(float) * volw,
    }).shift(1)


def stats(r: pd.Series) -> dict:
    r = r.dropna()
    if len(r) < 100 or r.std() == 0:
        return dict(cagr=np.nan, vol=np.nan, sharpe=np.nan, max_dd=np.nan)
    eq = (1 + r).cumprod()
    dd = (eq / eq.cummax() - 1).min()
    return dict(cagr=eq.iloc[-1] ** (TD / len(r)) - 1, vol=r.std() * np.sqrt(TD),
                sharpe=r.mean() / r.std() * np.sqrt(TD), max_dd=dd)


def main() -> None:
    panel = load_panel()
    ewi = equal_weight_index(panel)
    print(f"universe {len(panel)} tickers, {ewi.index[0]:%Y-%m-%d} .. {ewi.index[-1]:%Y-%m-%d}\n")

    # ---- index level: the closest analogue to the monthly study -------------
    ewi_px = (1 + ewi.fillna(0)).cumprod()
    w = daily_weights(ewi_px)
    print("EQUAL-WEIGHT INDEX (daily, cost-free, cash earns 0)")
    print(f"{'variant':16s} {'CAGR':>8s} {'vol':>8s} {'Sharpe':>8s} {'maxDD':>8s} {'expo':>6s}")
    print("-" * 60)
    idx_rows = {}
    for name in w.columns:
        s = stats(w[name] * ewi)
        idx_rows[name] = s
        print(f"{name:16s} {s['cagr']:7.2%} {s['vol']:7.2%} {s['sharpe']:8.2f} "
              f"{s['max_dd']:7.1%} {w[name].mean():5.2f}")

    # ---- per-ticker distribution -------------------------------------------
    rows = []
    for tk, g in panel.items():
        c = g["close"]
        r = c.pct_change()
        wt = daily_weights(c)
        d = {"tk": tk}
        for name in wt.columns:
            s = stats(wt[name] * r)
            d[f"{name}_sharpe"] = s["sharpe"]
            d[f"{name}_dd"] = s["max_dd"]
            d[f"{name}_cagr"] = s["cagr"]
        rows.append(d)
    R = pd.DataFrame(rows).dropna()

    print(f"\nPER-TICKER DISTRIBUTION ({len(R)} names)")
    print(f"{'variant':16s} {'med Sharpe':>11s} {'med maxDD':>10s} {'med CAGR':>9s} {'% beat B&H Sharpe':>18s}")
    print("-" * 70)
    for name in w.columns:
        beat = (R[f"{name}_sharpe"] > R["buy_hold_sharpe"]).mean() * 100
        print(f"{name:16s} {R[f'{name}_sharpe'].median():11.2f} "
              f"{R[f'{name}_dd'].median():9.1%} {R[f'{name}_cagr'].median():8.2%} {beat:17.1f}%")

    # ---- behaviour in the only two stress windows in the sample -------------
    print("\nDRAWDOWN CONTROL IN THE TWO STRESS WINDOWS AVAILABLE")
    for label, a, b in [("2015 correction", "2015-08-01", "2015-10-01"),
                        ("Feb 2018 vol spike", "2018-01-25", "2018-02-07")]:
        cells = []
        for name in w.columns:
            seg = (w[name] * ewi)[a:b].dropna()
            cells.append(f"{name}={((1+seg).prod()-1):+.2%}")
        print(f"  {label:20s} " + "  ".join(cells))

    R.to_csv(os.path.join(RESULTS, "daily_per_ticker.csv"), index=False)
    pd.DataFrame(idx_rows).T.to_csv(os.path.join(RESULTS, "daily_index.csv"))
    print(f"\nwrote {RESULTS}/daily_per_ticker.csv")


if __name__ == "__main__":
    main()
