"""Screen a wide set of candidate signals for real, stable edge.

For every candidate we compute the cross-sectional decile spread of forward
returns (top decile minus bottom decile), averaged per day and then tested with
a Newey-West t-stat on the daily series. Averaging per day first is essential:
stock returns are enormously correlated cross-sectionally, so a t-stat computed
on the pooled panel overstates significance by roughly sqrt(n_stocks).

Forward returns are tradeable: enter at the open after the signal bar, exit at
the close H bars later.
"""

from __future__ import annotations

import sys
import numpy as np
import pandas as pd

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from vnr import newey_west_t  # noqa: E402
from data import load_panel  # noqa: E402


def build_features(g: pd.DataFrame) -> pd.DataFrame:
    c, o, h, l, v = g["close"], g["open"], g["high"], g["low"], g["volume"]
    logc = np.log(c)
    r = logc.diff()
    f = pd.DataFrame(index=g.index)

    # short-horizon reversal, at three speeds
    for n in (5, 10, 20):
        f[f"rev{n}"] = -(logc - logc.rolling(n).mean()) / logc.rolling(n).std(ddof=0)

    # classic RSI(2)
    d = c.diff()
    up = d.clip(lower=0).ewm(alpha=0.5, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=0.5, adjust=False).mean()
    f["rsi2"] = -(100 - 100 / (1 + up / dn.replace(0, np.nan)))  # negated: high = oversold

    # momentum
    f["mom_12_1"] = c.shift(21) / c.shift(252) - 1.0
    f["mom_1m"] = c / c.shift(21) - 1.0
    f["hi52"] = c / c.rolling(252).max()

    # risk / liquidity
    f["lowvol"] = -r.rolling(60).std(ddof=0)
    dollar = (c * v).rolling(20).mean()
    f["amihud"] = (r.abs() / (c * v)).rolling(20).mean()
    f["illiq"] = -np.log(dollar)
    f["volsurge"] = v / v.rolling(20).mean()

    # open/close microstructure
    on = o / c.shift(1) - 1.0
    intr = c / o - 1.0
    f["overnight_20"] = on.rolling(20).mean()
    f["intraday_20"] = intr.rolling(20).mean()
    f["gap"] = -on  # negated: high = gapped down

    # volatility contraction (squeeze)
    prev_c = c.shift(1)
    tr = pd.concat([h - l, (h - prev_c).abs(), (l - prev_c).abs()], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1 / 14, adjust=False, min_periods=14).mean()
    f["squeeze"] = -(atr / c).rolling(100).rank(pct=True)

    return f


def forward_returns(g: pd.DataFrame, horizons=(5, 21)) -> pd.DataFrame:
    o, c = g["open"], g["close"]
    out = pd.DataFrame(index=g.index)
    for H in horizons:
        out[f"fwd{H}"] = c.shift(-H) / o.shift(-1) - 1.0
    return out


def main() -> None:
    panel = load_panel()
    print(f"universe: {len(panel)} tickers")

    frames = []
    for tk, g in panel.items():
        f = build_features(g)
        f = f.join(forward_returns(g))
        f["date"] = g.index
        f["tk"] = tk
        frames.append(f)
    D = pd.concat(frames, ignore_index=True)
    print(f"panel rows: {len(D):,}")

    signals = [c for c in D.columns if c not in ("date", "tk", "fwd5", "fwd21")]

    print("\nCross-sectional decile spread (top-decile minus bottom-decile), "
          "daily-averaged, Newey-West t (5 lags)\n")
    print(f"{'signal':14s} {'H':>3s} {'mean/period':>12s} {'ann.':>8s} {'t':>7s}   per-year t")
    print("-" * 88)

    rows = []
    for sig in signals:
        for H in (5, 21):
            sub = D[["date", sig, f"fwd{H}"]].dropna()
            if len(sub) < 50_000:
                continue
            q = sub.groupby("date")[sig].transform(
                lambda x: pd.qcut(x, 10, labels=False, duplicates="drop")
            )
            hi = sub[q == 9].groupby("date")[f"fwd{H}"].mean()
            lo = sub[q == 0].groupby("date")[f"fwd{H}"].mean()
            sp = (hi - lo).dropna()
            if len(sp) < 200:
                continue
            t = newey_west_t(sp.values, lags=H)
            ann = sp.mean() * (252 / H)
            yearly = " ".join(
                f"{y}:{newey_west_t(gg.values, lags=H):+.1f}" for y, gg in sp.groupby(sp.index.year)
            )
            print(f"{sig:14s} {H:3d} {sp.mean()*100:11.3f}% {ann*100:7.1f}% {t:7.2f}   {yearly}")
            rows.append(dict(signal=sig, horizon=H, mean=sp.mean(), ann=ann, t=t, n_days=len(sp)))

    res = pd.DataFrame(rows).sort_values("t", key=abs, ascending=False)
    res.to_csv(__file__.rsplit("/", 2)[0] + "/results/signal_screen.csv", index=False)
    print("\nwrote results/signal_screen.csv")


if __name__ == "__main__":
    main()
