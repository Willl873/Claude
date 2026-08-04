"""Out-of-sample test of the regime overlay on 155 years of S&P 500 data.

The 2013-2018 daily panel contains no bear market, so it cannot say anything
about an overlay whose entire purpose is to reduce exposure in bad regimes.
This script tests the same two ideas -- a trend gate and volatility targeting --
on monthly S&P 500 total returns from 1871 to 2026 (Shiller data), which
contains every major drawdown in the modern record.

Total return is reconstructed as (P_t + D_t/12) / P_{t-1} - 1, where D is the
trailing annual dividend. Dividends are missing after 2023-06 in the source and
are forward-filled; this affects the last ~3 years of a 155-year sample.
"""

from __future__ import annotations

import os
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data", "sp500-monthly.csv")
RESULTS = os.path.join(os.path.dirname(HERE), "results")
URL = "https://raw.githubusercontent.com/datasets/s-and-p-500/master/data/data.csv"
MONTHS = 12


def load_sp500_monthly() -> pd.DataFrame:
    if not os.path.exists(DATA):
        import urllib.request
        os.makedirs(os.path.dirname(DATA), exist_ok=True)
        print(f"downloading {URL} ...")
        urllib.request.urlretrieve(URL, DATA)
    d = pd.read_csv(DATA, parse_dates=["Date"]).set_index("Date")
    d = d[d["SP500"] > 0].copy()
    div = d["Dividend"].replace(0.0, np.nan).ffill()
    d["tr"] = (d["SP500"] + div / 12.0) / d["SP500"].shift(1) - 1.0
    d["rf"] = (d["Long Interest Rate"].replace(0.0, np.nan).ffill() / 100.0) / 12.0
    return d.dropna(subset=["tr"])


def stats(r: pd.Series, rf: pd.Series | None = None) -> dict:
    r = r.dropna()
    eq = (1 + r).cumprod()
    yrs = len(r) / MONTHS
    excess = r - rf.reindex(r.index).fillna(0.0) if rf is not None else r
    vol = r.std() * np.sqrt(MONTHS)
    dd = (eq / eq.cummax() - 1).min()
    return dict(
        cagr=eq.iloc[-1] ** (1 / yrs) - 1,
        vol=vol,
        sharpe=excess.mean() / r.std() * np.sqrt(MONTHS) if r.std() > 0 else np.nan,
        max_dd=dd,
        n_months=len(r),
    )


def build_overlays(d: pd.DataFrame, ma_len: int = 10, vol_len: int = 12,
                   target_vol: float = 0.12, max_lev: float = 1.0) -> pd.DataFrame:
    p = d["SP500"]
    r = d["tr"]

    ma = p.rolling(ma_len).mean()
    trend = (p > ma).astype(float)

    rv = r.rolling(vol_len).std(ddof=0) * np.sqrt(MONTHS)
    volw = (target_vol / rv).clip(upper=max_lev)

    # every weight is lagged one month: decided on month-end t-1, earns month t
    w = pd.DataFrame(index=d.index)
    w["buy_hold"] = 1.0
    w["trend"] = trend.shift(1)
    w["voltgt"] = volw.shift(1)
    w["trend_voltgt"] = (trend * volw).shift(1)
    return w


def main() -> None:
    d = load_sp500_monthly()
    print(f"S&P 500 monthly total returns: {d.index[0]:%Y-%m} .. {d.index[-1]:%Y-%m} "
          f"({len(d)} months, {len(d)/12:.0f} years)\n")

    w = build_overlays(d)
    rf = d["rf"]
    # cash earns the risk-free rate when the overlay is out of the market
    rets = {name: w[name] * d["tr"] + (1 - w[name]).clip(lower=0) * rf
            for name in w.columns}

    print(f"{'variant':22s} {'CAGR':>7s} {'vol':>7s} {'Sharpe':>7s} {'maxDD':>8s} {'avg expo':>9s}")
    print("-" * 66)
    table = {}
    for name, r in rets.items():
        s = stats(r, rf)
        table[name] = s
        print(f"{name:22s} {s['cagr']:6.2%} {s['vol']:6.2%} {s['sharpe']:7.2f} "
              f"{s['max_dd']:7.1%} {w[name].mean():8.2f}")

    # stability: Sharpe by 25-year block
    print("\nSharpe by era")
    blocks = [(1871, 1900), (1900, 1925), (1925, 1950), (1950, 1975),
              (1975, 2000), (2000, 2026)]
    hdr = "  ".join(f"{a}-{b}" for a, b in blocks)
    print(f"{'variant':22s} {hdr}")
    print("-" * 100)
    for name, r in rets.items():
        cells = []
        for a, b in blocks:
            seg = r[(r.index.year >= a) & (r.index.year < b)]
            rfseg = rf.reindex(seg.index)
            cells.append(f"{stats(seg, rfseg)['sharpe']:9.2f}")
        print(f"{name:22s} " + " ".join(cells))

    # the specific question: what happens in the worst drawdowns
    print("\nReturn during the 6 worst equity bear markets (buy-and-hold peak-to-trough)")
    bears = [("1929-09", "1932-06"), ("1937-03", "1938-03"), ("1973-01", "1974-09"),
             ("2000-09", "2002-09"), ("2007-11", "2009-02"), ("2022-01", "2022-09")]
    print(f"{'window':20s} " + " ".join(f"{n:>14s}" for n in rets))
    print("-" * 84)
    for a, b in bears:
        cells = []
        for name, r in rets.items():
            seg = r[(r.index >= a) & (r.index <= b)]
            cells.append(f"{(1+seg).prod()-1:13.1%} ")
        print(f"{a} .. {b}  " + " ".join(cells))

    os.makedirs(RESULTS, exist_ok=True)
    pd.DataFrame(table).T.to_csv(os.path.join(RESULTS, "longrun_regime.csv"))
    pd.DataFrame(rets).to_csv(os.path.join(RESULTS, "longrun_monthly_returns.csv"))
    print(f"\nwrote {RESULTS}/longrun_regime.csv")


if __name__ == "__main__":
    main()
