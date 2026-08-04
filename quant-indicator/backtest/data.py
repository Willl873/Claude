"""Data access for the VNR backtest.

The default dataset is the S&P 500 daily OHLCV panel (505 tickers,
2013-02-08 .. 2018-02-07) mirrored in plotly/datasets. It is downloaded on
first use and cached under `quant-indicator/data/`.

Known limitations of this panel, which matter for interpreting results:
  * survivorship bias — the ticker list is the S&P 500 membership as of 2018,
    so names that were deleted from the index during the window are absent
  * the window is 2013-2018, a period with no sustained bear market
  * prices are unadjusted for dividends (splits are handled by the source)
"""

from __future__ import annotations

import os
import urllib.request

import pandas as pd

URL = "https://raw.githubusercontent.com/plotly/datasets/master/all_stocks_5yr.csv"
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CSV = os.path.join(DATA_DIR, "all_stocks_5yr.csv")


def download(force: bool = False) -> str:
    os.makedirs(DATA_DIR, exist_ok=True)
    if force or not os.path.exists(CSV):
        print(f"downloading {URL} ...")
        urllib.request.urlretrieve(URL, CSV)
    return CSV


def load_panel(min_bars: int = 900) -> dict[str, pd.DataFrame]:
    """Returns {ticker: OHLCV frame indexed by date}, cleaned."""
    df = pd.read_csv(download(), parse_dates=["date"])
    df = df.dropna(subset=["open", "high", "low", "close"])
    df = df[(df[["open", "high", "low", "close"]] > 0).all(axis=1)]
    df = df.sort_values(["Name", "date"])

    out: dict[str, pd.DataFrame] = {}
    for name, g in df.groupby("Name", sort=True):
        g = g.drop_duplicates(subset="date").set_index("date")
        if len(g) < min_bars:
            continue
        out[name] = g[["open", "high", "low", "close", "volume", "Name"]]
    return out


def equal_weight_index(panel: dict[str, pd.DataFrame]) -> pd.Series:
    """Daily returns of an equal-weight, daily-rebalanced index of the panel.

    This is the buy-and-hold benchmark: it is the return of holding every name
    in the universe, which is what the strategy must beat on a risk-adjusted
    basis to be worth running.
    """
    rets = {t: g["close"].pct_change() for t, g in panel.items()}
    return pd.DataFrame(rets).mean(axis=1).rename("EWI")
