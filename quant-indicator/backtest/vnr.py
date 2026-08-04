"""
VNR — Volatility-Normalised Reversal in Momentum States.

Core objects:
    compute_signals(df, params)  -> adds signal columns to a single ticker's OHLCV frame
    simulate_ticker(df, params)  -> path-dependent trade simulation for one ticker
    Params                       -> the full parameter set

Design notes (why each piece is here):

1. Regime gate (trend).  Time-series momentum: assets trading above their
   long-run moving average have historically delivered higher risk-adjusted
   returns and far shallower drawdowns (Moskowitz/Ooi/Pedersen 2012, Faber
   2007). We use it as a *gate*, never as an entry trigger, because the trend
   itself is a weak timing signal at the daily horizon.

2. Entry trigger (reversal).  Short-horizon (1-5 day) reversal is one of the
   oldest documented anomalies in liquid equities (Lehmann 1990, Lo/MacKinlay
   1990): recent losers outperform recent winners over the following days.
   We measure "recent loser" as a z-score of the current log price against the
   distribution of log prices over the last N bars, which is dimensionless and
   self-normalising across tickers and vol regimes.

3. Sizing (volatility targeting).  Scaling exposure by inverse realised
   volatility raises Sharpe and truncates the left tail (Moreira/Muir 2017).

Everything is computed on bar t and executed at the OPEN of bar t+1. No bar
uses information from its own close to trade its own close.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict

import numpy as np
import pandas as pd

TRADING_DAYS = 252


@dataclass(frozen=True)
class Params:
    # --- entry / exit ---
    z_len: int = 10          # lookback for the reversal z-score
    z_entry: float = -1.0    # enter when z drops below this
    z_exit: float = 0.0      # exit when z recovers above this
    max_hold: int = 10       # hard time stop, in bars
    atr_len: int = 14
    atr_stop: float = 2.5    # stop at entry - atr_stop * ATR (checked on close)

    # --- regime gate ---
    trend_len: int = 200
    slope_len: int = 20      # trend MA must be above its own value slope_len bars ago
    use_trend_gate: bool = True

    # --- sizing ---
    vol_len: int = 20
    target_vol: float = 0.15   # annualised
    max_leverage: float = 1.0
    vol_target: bool = True

    # --- costs, per side, in basis points of notional ---
    cost_bps: float = 5.0

    def to_dict(self) -> dict:
        return asdict(self)


# --------------------------------------------------------------------------
# signals
# --------------------------------------------------------------------------
def compute_signals(df: pd.DataFrame, p: Params) -> pd.DataFrame:
    """`df` must be a single ticker, sorted by date, with open/high/low/close/volume."""
    out = df.copy()
    c = out["close"]
    logc = np.log(c)

    # 1. reversal z-score: where does today's log price sit inside the
    #    distribution of the last z_len log prices?
    mu = logc.rolling(p.z_len).mean()
    sd = logc.rolling(p.z_len).std(ddof=0)
    out["z"] = (logc - mu) / sd.replace(0.0, np.nan)

    # 2. regime gate
    ma = c.rolling(p.trend_len).mean()
    out["trend_ma"] = ma
    out["trend_ok"] = (c > ma) & (ma > ma.shift(p.slope_len))
    if not p.use_trend_gate:
        out["trend_ok"] = pd.Series(True, index=out.index)

    # 3. realised vol for sizing
    r = logc.diff()
    out["ret"] = r
    out["vol"] = r.rolling(p.vol_len).std(ddof=0) * np.sqrt(TRADING_DAYS)

    # 4. ATR (Wilder) for the protective stop
    prev_c = c.shift(1)
    tr = pd.concat(
        [out["high"] - out["low"], (out["high"] - prev_c).abs(), (out["low"] - prev_c).abs()],
        axis=1,
    ).max(axis=1)
    out["atr"] = tr.ewm(alpha=1.0 / p.atr_len, adjust=False, min_periods=p.atr_len).mean()

    # 5. the tradeable states, decided on this bar's close
    out["entry_signal"] = (out["z"] < p.z_entry) & out["trend_ok"] & out["vol"].notna() & out["atr"].notna()

    if p.vol_target:
        w = (p.target_vol / out["vol"]).clip(upper=p.max_leverage)
    else:
        w = pd.Series(p.max_leverage, index=out.index, dtype=float)
    out["weight"] = w.fillna(0.0)

    return out


# --------------------------------------------------------------------------
# per-ticker path simulation
# --------------------------------------------------------------------------
def simulate_ticker(df: pd.DataFrame, p: Params) -> tuple[pd.Series, pd.DataFrame]:
    """
    Returns (daily_net_return_series, trades_frame).

    Execution model:
      * signal is read from bar t's close
      * the position is opened at bar t+1's OPEN and closed at the OPEN of the
        bar after the exit condition fires
      * cost_bps is charged on both the entry and the exit notional
      * while flat the strategy earns 0 (no cash rate assumed)
    """
    s = compute_signals(df, p)

    o = s["open"].to_numpy(float)
    c = s["close"].to_numpy(float)
    z = s["z"].to_numpy(float)
    atr = s["atr"].to_numpy(float)
    w_all = s["weight"].to_numpy(float)
    entry_sig = s["entry_signal"].to_numpy(bool)
    n = len(s)
    dates = s.index.to_numpy()

    daily = np.zeros(n)
    trades = []

    in_pos = False
    entry_i = -1
    entry_px = np.nan
    stop_px = np.nan
    weight = 0.0
    bars_held = 0
    exit_armed = False

    cost = p.cost_bps / 1e4

    for t in range(1, n):
        if in_pos:
            # mark to market on this bar's open->close is folded into a simple
            # close-to-close accrual; the first day is open->close.
            prev_ref = entry_px if bars_held == 0 else c[t - 1]
            daily[t] = weight * (c[t] / prev_ref - 1.0)
            bars_held += 1

            if exit_armed:
                # we decided yesterday to leave; the fill is today's open
                fill = o[t]
                daily[t] = weight * (fill / prev_ref - 1.0) - weight * cost
                trades.append(
                    dict(
                        ticker=s["Name"].iloc[0],
                        entry_date=dates[entry_i],
                        exit_date=dates[t],
                        bars=bars_held,
                        entry_px=entry_px,
                        exit_px=fill,
                        weight=weight,
                        gross_ret=fill / entry_px - 1.0,
                        net_ret=fill / entry_px - 1.0 - 2 * cost,
                        entry_z=z[entry_i],
                    )
                )
                in_pos = False
                exit_armed = False
                bars_held = 0
                continue

            # exit decision made on this bar's close
            hit_stop = c[t] <= stop_px
            recovered = z[t] > p.z_exit
            timed_out = bars_held >= p.max_hold
            if hit_stop or recovered or timed_out:
                exit_armed = True

        else:
            # entry decision was made on bar t-1's close -> fill at today's open
            if entry_sig[t - 1]:
                weight = w_all[t - 1]
                if weight > 0:
                    in_pos = True
                    entry_i = t
                    entry_px = o[t]
                    stop_px = entry_px - p.atr_stop * atr[t - 1]
                    bars_held = 0
                    daily[t] = weight * (c[t] / entry_px - 1.0) - weight * cost

    # a position still open at the end of the sample is closed at the last close
    if in_pos:
        trades.append(
            dict(
                ticker=s["Name"].iloc[0],
                entry_date=dates[entry_i],
                exit_date=dates[n - 1],
                bars=bars_held,
                entry_px=entry_px,
                exit_px=c[n - 1],
                weight=weight,
                gross_ret=c[n - 1] / entry_px - 1.0,
                net_ret=c[n - 1] / entry_px - 1.0 - 2 * cost,
                entry_z=z[entry_i],
            )
        )
        daily[n - 1] -= weight * cost

    return pd.Series(daily, index=s.index, name=s["Name"].iloc[0]), pd.DataFrame(trades)


# --------------------------------------------------------------------------
# performance stats
# --------------------------------------------------------------------------
def perf_stats(daily: pd.Series, rf: float = 0.0) -> dict:
    d = daily.dropna()
    if len(d) < 2 or d.std() == 0:
        return dict(cagr=np.nan, vol=np.nan, sharpe=np.nan, sortino=np.nan,
                    max_dd=np.nan, calmar=np.nan, hit=np.nan, n_days=len(d),
                    exposure=np.nan, total_ret=np.nan)
    eq = (1.0 + d).cumprod()
    years = len(d) / TRADING_DAYS
    cagr = eq.iloc[-1] ** (1 / years) - 1.0
    vol = d.std() * np.sqrt(TRADING_DAYS)
    sharpe = (d.mean() * TRADING_DAYS - rf) / vol if vol > 0 else np.nan
    downside = d[d < 0].std() * np.sqrt(TRADING_DAYS)
    sortino = (d.mean() * TRADING_DAYS - rf) / downside if downside and downside > 0 else np.nan
    dd = eq / eq.cummax() - 1.0
    max_dd = dd.min()
    nz = d[d != 0]
    return dict(
        cagr=cagr,
        vol=vol,
        sharpe=sharpe,
        sortino=sortino,
        max_dd=max_dd,
        calmar=cagr / abs(max_dd) if max_dd < 0 else np.nan,
        hit=(nz > 0).mean() if len(nz) else np.nan,
        n_days=len(d),
        exposure=(d != 0).mean(),
        total_ret=eq.iloc[-1] - 1.0,
    )


def newey_west_t(x: np.ndarray, lags: int = 5) -> float:
    """t-stat of the mean of x with a Newey-West (HAC) standard error."""
    x = np.asarray(x, float)
    x = x[~np.isnan(x)]
    n = len(x)
    if n < 10:
        return np.nan
    e = x - x.mean()
    gamma0 = (e @ e) / n
    var = gamma0
    for L in range(1, min(lags, n - 1) + 1):
        gl = (e[L:] @ e[:-L]) / n
        var += 2.0 * (1.0 - L / (lags + 1.0)) * gl
    if var <= 0:
        return np.nan
    return x.mean() / np.sqrt(var / n)
