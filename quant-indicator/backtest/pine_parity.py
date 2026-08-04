"""Parity check: does VRO_strategy.pine actually implement the tested rule?

The research code applies a clean weight series to a return series. The Pine
strategy places integer-quantity orders against an equity balance, only
rebalances when drift exceeds a band, and pays commission and slippage. Those
differences can quietly change the result, so this script re-implements the
Pine order logic step for step and checks that it lands in the same place.

Any mismatch here means the published Pine script does not do what the study
says it does.
"""

from __future__ import annotations

import os
import numpy as np
import pandas as pd

from longrun_regime import load_sp500_monthly, stats, MONTHS
from data import load_panel, equal_weight_index

RESULTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "results")


def simulate_pine(signal_px: pd.Series, ret: pd.Series, rf: pd.Series | None,
                  bars_per_year: int, ma_len: int, vol_len: int, target_vol: float,
                  max_lev: float, rebal_band_pp: float, commission_pct: float,
                  slippage_bps: float, use_slope: bool = True,
                  slope_len: int = 20) -> pd.Series:
    """Mirrors the order block in VRO_strategy.pine.

    `signal_px` is the chart's price series (what the MA and realised vol are
    computed from, exactly as Pine sees it). `ret` is the return actually earned
    by holding the asset -- total return, including dividends, which a price
    chart does not show. Keeping these separate matters: over 156 years the two
    series diverge by orders of magnitude, and computing the trend MA on the
    wrong one silently changes every signal.

    The position is held as a weight that drifts with prices between rebalances,
    which is what actually happens in an account. Costs are charged on turnover.
    """
    ma = signal_px.rolling(ma_len).mean()
    trend_ok = signal_px > ma
    if use_slope:
        trend_ok = trend_ok & (ma > ma.shift(slope_len))
    logret = np.log(signal_px).diff()
    real_vol = logret.rolling(vol_len).std(ddof=0) * np.sqrt(bars_per_year)
    vol_w = np.minimum(target_vol / real_vol, max_lev)
    target_w = (trend_ok.astype(float) * vol_w).fillna(0.0)
    warm = (ma.notna() & real_vol.notna() & (real_vol > 0)).to_numpy(bool)

    n = len(signal_px)
    tw = target_w.to_numpy(float)
    trend = trend_ok.to_numpy(bool)
    r = ret.reindex(signal_px.index).fillna(0.0).to_numpy(float)
    rf_arr = (rf.reindex(signal_px.index).fillna(0.0).to_numpy(float)
              if rf is not None else np.zeros(n))

    held_w = 0.0
    out = np.zeros(n)
    cost_rate = (commission_pct / 100.0) + (slippage_bps / 1e4)

    for t in range(1, n):
        # decision uses bar t-1's close; the trade is filled into bar t
        if warm[t - 1]:
            flip = trend[t - 1] != trend[t - 2] if t >= 2 else False
            drift = tw[t - 1] - held_w
            if flip or abs(drift) * 100 >= rebal_band_pp:
                out[t] -= abs(drift) * cost_rate
                held_w = tw[t - 1]

        # earn the bar
        port = held_w * r[t] + max(0.0, 1.0 - held_w) * rf_arr[t]
        out[t] += port
        # the held weight drifts with relative performance until the next trade
        if 1.0 + port != 0:
            held_w = held_w * (1.0 + r[t]) / (1.0 + port)

    return pd.Series(out, index=signal_px.index).iloc[1:]


def main() -> None:
    print("PARITY CHECK — Pine order logic vs the research weights\n")

    # ---------------------------------------------------------------- monthly
    d = load_sp500_monthly()
    rf = d["rf"]

    research = (
        ((d["SP500"] > d["SP500"].rolling(10).mean()).astype(float)
         * (0.12 / (d["tr"].rolling(12).std(ddof=0) * np.sqrt(MONTHS))).clip(upper=1.0)
         ).shift(1)
    )
    research_ret = research * d["tr"] + (1 - research).clip(lower=0) * rf

    # signals from the price index (what a chart shows), P&L from total return
    pine_ret = simulate_pine(d["SP500"], d["tr"], rf, bars_per_year=MONTHS, ma_len=10,
                             vol_len=12, target_vol=0.12, max_lev=1.0,
                             rebal_band_pp=15.0, commission_pct=0.03, slippage_bps=2.0,
                             use_slope=False)

    print("S&P 500 monthly, 1871-2026")
    print(f"{'':22s} {'CAGR':>8s} {'vol':>8s} {'Sharpe':>8s} {'maxDD':>8s}")
    print("-" * 58)
    for label, r in [("research weights", research_ret), ("pine order logic", pine_ret)]:
        s = stats(r.dropna(), rf)
        print(f"{label:22s} {s['cagr']:7.2%} {s['vol']:7.2%} {s['sharpe']:8.2f} {s['max_dd']:7.1%}")
    s_bh = stats(d["tr"], rf)
    print(f"{'buy & hold':22s} {s_bh['cagr']:7.2%} {s_bh['vol']:7.2%} "
          f"{s_bh['sharpe']:8.2f} {s_bh['max_dd']:7.1%}")

    gap = abs(stats(pine_ret.dropna(), rf)["sharpe"] - stats(research_ret.dropna(), rf)["sharpe"])
    print(f"\n  Sharpe gap between the two implementations: {gap:.3f}")
    if gap < 0.10:
        print("  PASS — the Pine script implements the rule that was tested")
    else:
        print("  FAIL — gap too large, the Pine script and the study have diverged")

    # ------------------------------------------------------------------ daily
    panel = load_panel()
    ewi = equal_weight_index(panel)
    ewi_px = (1 + ewi.fillna(0)).cumprod()
    daily_pine = simulate_pine(ewi_px, ewi, None, bars_per_year=252, ma_len=200,
                               vol_len=20, target_vol=0.12, max_lev=1.0,
                               rebal_band_pp=15.0, commission_pct=0.03, slippage_bps=2.0,
                               use_slope=True, slope_len=20)

    def dstats(r):
        r = r.dropna()
        eq = (1 + r).cumprod()
        return dict(cagr=eq.iloc[-1] ** (252 / len(r)) - 1, vol=r.std() * np.sqrt(252),
                    sharpe=r.mean() / r.std() * np.sqrt(252),
                    max_dd=(eq / eq.cummax() - 1).min())

    print("\nEqual-weight S&P 500, daily bars, 2013-2018 (the sample with no bear market)")
    print(f"{'':22s} {'CAGR':>8s} {'vol':>8s} {'Sharpe':>8s} {'maxDD':>8s}")
    print("-" * 58)
    for label, r in [("pine order logic", daily_pine), ("buy & hold", ewi)]:
        s = dstats(r)
        print(f"{label:22s} {s['cagr']:7.2%} {s['vol']:7.2%} {s['sharpe']:8.2f} {s['max_dd']:7.1%}")
    print("\n  Expected shape here: LOWER return, LOWER drawdown than buy & hold.")
    print("  That is what the 1975-2000 bull-market era of the monthly study also showed.")


if __name__ == "__main__":
    main()
