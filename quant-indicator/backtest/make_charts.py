"""Render the result figures used in the README."""

from __future__ import annotations

import os
import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402

from longrun_regime import load_sp500_monthly, build_overlays, stats, MONTHS  # noqa: E402
from robustness import overlay_returns  # noqa: E402

RESULTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "results")

# validated categorical slots 1-4 (light surface); every series is direct-labelled
C = {"buy_hold": "#2a78d6", "trend": "#eb6834", "voltgt": "#1baf7a", "trend_voltgt": "#eda100"}
LABEL = {"buy_hold": "Buy & hold", "trend": "Trend gate", "voltgt": "Vol target",
         "trend_voltgt": "Trend + vol target"}
SURFACE = "#ffffff"
INK, INK2, GRID = "#0b0b0b", "#52514e", "#e6e5e1"
# sequential blue ramp, steps 100 -> 700
SEQ = LinearSegmentedColormap.from_list(
    "blues", ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"])


def style(ax, title=None, ylabel=None):
    ax.set_facecolor(SURFACE)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color(GRID)
    ax.tick_params(colors=INK2, labelsize=9, length=3)
    ax.grid(True, color=GRID, lw=0.8, alpha=0.9)
    ax.set_axisbelow(True)
    if title:
        ax.set_title(title, color=INK, fontsize=12, weight="600", loc="left", pad=10)
    if ylabel:
        ax.set_ylabel(ylabel, color=INK2, fontsize=10)


def fig_equity(d):
    w = build_overlays(d)
    rf = d["rf"]
    rets = {n: w[n] * d["tr"] + (1 - w[n]).clip(lower=0) * rf for n in w.columns}

    fig, (a1, a2) = plt.subplots(2, 1, figsize=(11, 8), sharex=True,
                                 gridspec_kw={"height_ratios": [2.2, 1]}, facecolor=SURFACE)
    for n, r in rets.items():
        eq = (1 + r.dropna()).cumprod()
        a1.plot(eq.index, eq.values, color=C[n], lw=2, label=LABEL[n])
        a1.annotate(f" {LABEL[n]}", (eq.index[-1], eq.iloc[-1]), color=C[n],
                    fontsize=9, weight="600", va="center")
        dd = eq / eq.cummax() - 1
        a2.plot(dd.index, dd.values * 100, color=C[n], lw=1.4)
    a1.set_yscale("log")
    style(a1, "S&P 500 total return, 1871–2026 — growth of $1 (log scale)", "$ (log)")
    a1.set_xlim(d.index[0], d.index[-1] + pd.Timedelta(days=365 * 13))
    style(a2, "Drawdown from prior peak", "%")
    a2.set_ylim(-90, 2)
    fig.tight_layout()
    fig.savefig(f"{RESULTS}/fig1_equity_156y.png", dpi=140, facecolor=SURFACE)
    plt.close(fig)


def fig_grid(d):
    ma_grid = [6, 8, 9, 10, 11, 12, 14, 16, 20]
    tv_grid = [None, 0.08, 0.10, 0.12, 0.15, 0.20]
    M = np.array([[stats(overlay_returns(d, ma, tv), d["rf"])["sharpe"]
                   for tv in tv_grid] for ma in ma_grid])
    bh = stats(d["tr"], d["rf"])["sharpe"]

    fig, ax = plt.subplots(figsize=(8, 6.5), facecolor=SURFACE)
    im = ax.imshow(M, cmap=SEQ, aspect="auto", vmin=min(bh, M.min()), vmax=M.max())
    ax.set_xticks(range(len(tv_grid)),
                  ["none" if t is None else f"{t:.0%}" for t in tv_grid])
    ax.set_yticks(range(len(ma_grid)), [str(m) for m in ma_grid])
    for i in range(M.shape[0]):
        for j in range(M.shape[1]):
            ax.text(j, i, f"{M[i, j]:.2f}", ha="center", va="center", fontsize=9,
                    color="#ffffff" if im.norm(M[i, j]) > 0.45 else INK, weight="600")
    style(ax, f"Sharpe across the parameter grid (buy & hold = {bh:.2f})")
    ax.grid(False)
    ax.set_xlabel("volatility target", color=INK2, fontsize=10)
    ax.set_ylabel("moving-average length (months)", color=INK2, fontsize=10)
    cb = fig.colorbar(im, ax=ax, fraction=0.045)
    cb.outline.set_visible(False)
    cb.ax.tick_params(colors=INK2, labelsize=9)
    fig.tight_layout()
    fig.savefig(f"{RESULTS}/fig2_param_grid.png", dpi=140, facecolor=SURFACE)
    plt.close(fig)


def fig_bears(d):
    w = build_overlays(d)
    rf = d["rf"]
    rets = {n: w[n] * d["tr"] + (1 - w[n]).clip(lower=0) * rf for n in w.columns}
    bears = [("1929-09", "1932-06", "1929–32"), ("1937-03", "1938-03", "1937–38"),
             ("1973-01", "1974-09", "1973–74"), ("2000-09", "2002-09", "2000–02"),
             ("2007-11", "2009-02", "2007–09"), ("2022-01", "2022-09", "2022")]
    names = list(rets)
    x = np.arange(len(bears))
    width = 0.2

    fig, ax = plt.subplots(figsize=(11, 5.5), facecolor=SURFACE)
    for k, n in enumerate(names):
        vals = [((1 + rets[n][(rets[n].index >= a) & (rets[n].index <= b)]).prod() - 1) * 100
                for a, b, _ in bears]
        pos = x + (k - 1.5) * width
        ax.bar(pos, vals, width * 0.92, color=C[n], label=LABEL[n],
               edgecolor=SURFACE, linewidth=2)
        for xi, v in zip(pos, vals):
            ax.text(xi, v - 2.5, f"{v:.0f}".replace("-0", "0"), ha="center", va="top",
                    fontsize=8, color=INK2, weight="600")
    ax.set_xticks(x, [lab for _, _, lab in bears])
    ax.axhline(0, color=INK2, lw=1)
    style(ax, "Total return through the six worst bear markets", "%")
    ax.set_ylim(-92, 6)
    leg = ax.legend(frameon=False, ncol=2, fontsize=9, loc="lower right")
    for t in leg.get_texts():
        t.set_color(INK2)
    fig.tight_layout()
    fig.savefig(f"{RESULTS}/fig3_bear_markets.png", dpi=140, facecolor=SURFACE)
    plt.close(fig)


def fig_null(d):
    rng = np.random.default_rng(20240804)
    rf = d["rf"]
    real = stats(overlay_returns(d, 10, 0.12), rf)["sharpe"]
    rvol = d["tr"].rolling(12).std(ddof=0) * np.sqrt(MONTHS)
    w = ((d["SP500"] > d["SP500"].rolling(10).mean()).astype(float)
         * (0.12 / rvol).clip(upper=1.0)).shift(1).dropna()
    null = []
    for _ in range(4000):
        s = pd.Series(rng.permutation(w.values), index=w.index)
        null.append(stats((s * d["tr"] + (1 - s).clip(lower=0) * rf).dropna(), rf)["sharpe"])
    null = np.array(null)

    fig, ax = plt.subplots(figsize=(9, 5), facecolor=SURFACE)
    ax.hist(null, bins=60, color="#9ec5f4", edgecolor=SURFACE, linewidth=0.5)
    ax.axvline(real, color="#eb6834", lw=2.5)
    ax.annotate(f"actual overlay  {real:.2f}", (real, ax.get_ylim()[1] * 0.88),
                color="#eb6834", fontsize=10, weight="600", ha="right",
                xytext=(-10, 0), textcoords="offset points")
    ax.annotate(f"shuffled weights\nmean {null.mean():.2f}",
                (null.mean(), ax.get_ylim()[1] * 0.55), color="#256abf", fontsize=10,
                weight="600", ha="center")
    style(ax, "Randomisation test — same weights, shuffled in time (4,000 draws)",
          "draws")
    ax.set_xlabel("Sharpe ratio", color=INK2, fontsize=10)
    fig.tight_layout()
    fig.savefig(f"{RESULTS}/fig4_null_test.png", dpi=140, facecolor=SURFACE)
    plt.close(fig)


def main():
    d = load_sp500_monthly()
    fig_equity(d)
    fig_grid(d)
    fig_bears(d)
    fig_null(d)
    print("wrote fig1..fig4 to", RESULTS)


if __name__ == "__main__":
    main()
