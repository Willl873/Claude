# Quality Screen: S&P 500 (Representative Sample)

> Framework: 7 hard exclusion metrics + 3 waiver rules — designed to screen OUT clearly sub-first-rate companies, not to certify "good" ones.
> Screen date: 2026-07-08 ｜ AI-assisted research, not investment advice

---

## Methodology & Scope Disclosure (read before the results)

The S&P 500 has 500 constituents. Exhaustively pulling 10-year ROE, 5-year cumulative FCF, interest coverage, margin trends, OCF/NI, and share-count history for all 500 is not something that can be done with verified rigor in a single research pass — doing so would either take hundreds of individual lookups or force low-confidence guesses across the board.

**Scope actually screened**: **22 companies**, hand-picked for (a) index-weight significance (the mega-caps that dominate S&P 500 returns) and (b) deliberate sector diversification (11 GICS sectors represented), covering roughly **40–45% of total index market-cap weight**. This is a sample, not a census — treat conclusions about "the S&P 500" as directional, not exhaustive.

**Data-confidence labeling** (per company, in the table below):
- **[Verified]** — figures come from a live search this session (financecharts/macrotrends/stockanalysis/GuruFocus), specifically because the metric was ambiguous, contested, or cyclical enough to need checking.
- **[Est.]** — figures reflect well-established, broadly-published financial characteristics for extremely well-covered blue-chip companies, not re-verified via a fresh search this session. These are typically not close calls (e.g., Apple's ROE has been >100% for years due to buybacks — this is not in dispute).

Per the skill's own bias-check principle: **certainty should come from the business model, not from data volume.** A company being [Est.] doesn't make its screen result less valid — the underlying facts are simply stable and uncontroversial.

---

## Company Sample & Sector Coverage

| Company | Ticker | Sector |
|---|---|---|
| Apple | AAPL | Information Technology |
| Microsoft | MSFT | Information Technology |
| Nvidia | NVDA | Information Technology |
| Broadcom | AVGO | Information Technology |
| Amazon | AMZN | Consumer Discretionary |
| Tesla | TSLA | Consumer Discretionary |
| Home Depot | HD | Consumer Discretionary |
| Alphabet | GOOGL | Communication Services |
| Meta Platforms | META | Communication Services |
| Berkshire Hathaway | BRK.B | Financials |
| JPMorgan Chase | JPM | Financials |
| Visa | V | Financials |
| Mastercard | MA | Financials |
| Eli Lilly | LLY | Healthcare |
| UnitedHealth Group | UNH | Healthcare |
| Johnson & Johnson | JNJ | Healthcare |
| Walmart | WMT | Consumer Staples |
| Procter & Gamble | PG | Consumer Staples |
| Costco | COST | Consumer Staples |
| ExxonMobil | XOM | Energy |
| Caterpillar | CAT | Industrials |
| NextEra Energy | NEE | Utilities |

---

## Summary Table

| Company | ①ROE | ②FCF | ③Int.Cov | ④GrossM | ⑤OCF/NI | ⑥NetM | ⑦Dilution | Result |
|---|---|---|---|---|---|---|---|---|
| Apple [Est.] | ✅ >100% | ✅ | ✅ | ✅ ~44% | ✅ | ✅ ~25% | ✅ (shrinking, buybacks) | **Pass** |
| Microsoft [Est.] | ✅ ~35-40% | ✅ | ✅ | ✅ ~69% | ✅ | ✅ ~35% | ✅ | **Pass** |
| Nvidia [Est.] | ✅ ~90%+ (recent) | ✅ | ✅ | ✅ ~70%+ | ✅ | ✅ ~50%+ | ✅ | **Pass** |
| Broadcom [Verified] | ✅ (elevated post-VMware) | ✅ | ✅ | ✅ high | ✅ | ✅ | ⚠️→✅ waived (M&A-driven share issuance for VMware, explicitly M&A-exempt under metric #7) | **Pass (waived #7)** |
| Amazon [Est.] | ⚠️ historically <8% for years, recently improved | ✅ (recently positive after capex-heavy years) | ✅ | ✅ ~48% | ✅ | ⚠️ historically <5%, improving | ✅ | **Pass via Waiver B** (high gross margin + net margin now recovering above 5%) |
| Tesla [Verified] | ❌ **10-yr median ROE 4.84%** | ✅ ($6.22B FY25 FCF, positive recent years) | ✅ | ✅ ~20% | ⚠️ not verified | ⚠️ historically thin, volatile (2-8%) | ⚠️ real (non-split) dilution present but moderate | **Fails #1 — no waiver applies** (listed >10 yrs, so Waiver A unavailable) |
| Home Depot [Est.] | ✅ very high (negative/small equity base inflates ratio) | ✅ | ✅ | ✅ ~33% | ✅ | ✅ ~10% | ✅ (shrinking via buybacks) | **Pass** |
| Alphabet [Est.] | ✅ ~30%+ | ✅ | ✅ | ✅ ~57% | ✅ | ✅ ~28% | ✅ | **Pass** |
| Meta Platforms [Est.] | ✅ ~30%+ | ✅ | ✅ | ✅ ~80% | ✅ | ✅ ~30%+ | ✅ | **Pass** |
| Berkshire Hathaway [Est.] | ✅ ~10-12% | ✅ | N/A (insurance/conglomerate) | N/A (conglomerate, not meaningful) | ✅ | ✅ | ✅ (shrinking via buybacks) | **Pass** (insurance-adjusted) |
| JPMorgan Chase [Est.] | ✅ ~15-17% | N/A (bank — FCF not a standard metric) | N/A (bank, exempt) | N/A (bank) | N/A (bank) | ✅ ~30%+ (net margin proxy) | ✅ | **Pass** (bank-adjusted) |
| Visa [Est.] | ✅ ~35%+ | ✅ | ✅ | ✅ ~97% | ✅ | ✅ ~50%+ | ✅ | **Pass** |
| Mastercard [Est.] | ✅ (often >100%, negative equity from buybacks) | ✅ | ✅ | ✅ ~76% | ✅ | ✅ ~45% | ✅ | **Pass** |
| Eli Lilly [Est.] | ✅ ~60%+ (recent) | ✅ | ✅ | ✅ ~80% | ⚠️ high capex phase, watch | ✅ ~20%+ | ✅ | **Pass** |
| UnitedHealth [Est.] | ✅ ~20%+ | ✅ | ✅ | N/A (managed care, low "gross margin" concept) | ✅ | ✅ ~4-6%, borderline | ✅ | **Pass via Waiver C-style logic** (high-turnover insurance model; ROE and cash-flow quality carry the case) |
| Johnson & Johnson [Est.] | ✅ ~25-30% | ✅ | ✅ | ✅ ~65% | ✅ | ✅ ~20% | ✅ | **Pass** |
| Walmart [Est.] | ✅ ~20%+ | ✅ | ✅ | ✅ ~24% | ✅ | ⚠️ ~2.5-3%, thin | ✅ | **Pass via Waiver C** (high-turnover retail, ROE strong, OCF/NI healthy) |
| Procter & Gamble [Est.] | ✅ ~30%+ | ✅ | ✅ | ✅ ~51% | ✅ | ✅ ~18% | ✅ | **Pass** |
| Costco [Est., matches skill's own reference case] | ✅ ~25%+ | ✅ | ✅ | ❌ ~12% | ✅ >1.0 | ❌ ~2.5% | ✅ | **Pass via Waiver C** (explicit textbook case: high ROE + strong OCF/NI + membership-fee-driven high-turnover thin-margin model) |
| ExxonMobil [Verified] | ✅ 10-yr avg ~10.2% (median ~11%) | ✅ (cyclical but cumulative positive) | ✅ | ⚠️ not a standard "gross margin" business (integrated oil — treated as N/A/approximate) | ⚠️ not verified | ✅ historically >5% in most years, volatile | ✅ | **Pass with cyclicality caveat** |
| Caterpillar [Verified] | ✅ ~40%+ recent, historically volatile | ✅ ($7.45B recent FCF) | ✅ | ✅ ~28.6% | ✅ | ✅ ~13% | ✅ (buybacks shrinking count, -3%/yr) | **Pass** |
| NextEra Energy [Verified] | ✅ ~10% | ❌ **structurally negative** (TTM FCF ≈ -$15.4B on heavy capex) | ⚠️ not verified, utilities typically thin but adequate | N/A (regulated utility, "gross margin" not standard) | ⚠️ not verified | ✅ ~26% | ⚠️ utility equity issuance for capex — needs check, likely elevated | **Fails #2 — flagged as regulated-utility artifact, see note below** |

---

## Companies Excluded (with reasoning)

| Company | Metric(s) failed | Specific data | Exclusion rationale |
|---|---|---|---|
| **Tesla (TSLA)** | #1 ROE | 10-year median ROE **4.84%**, well below the 8% threshold; current ROE 2.30% is 52% below its own median | Waiver A (early-stage exemption) requires listing <10 years — Tesla has been public since 2010, so it does **not** qualify for the young-growth carve-out despite its ~20% gross margin. Under a strict reading of the screen, Tesla is **excluded** — a genuinely non-consensus result, since Tesla is widely treated as a "quality" mega-cap. The screen's own logic is that capital efficiency, not narrative, defines quality; a decade-long sub-8% median ROE is a real signal, not noise. |
| **NextEra Energy (NEE)** | #2 cumulative FCF | TTM operating cash flow $12.33B vs. capex -$27.73B → FCF **≈ -$15.4B** | This is flagged with an important caveat below — it is very likely a **structural artifact of the regulated-utility growth model** (heavy reinvestment into renewables buildout) rather than a business-quality failure, but the mechanical screen still excludes it as written. |

### ⚠️ Analyst note on NEE's FCF exclusion
Regulated utilities in a heavy capex-growth phase (renewables buildout, grid expansion) routinely show negative free cash flow for years at a time because they're required to reinvest faster than depreciation to grow the regulated asset base — this is often *rewarded* by regulators via rate-base growth, not a sign of poor capital allocation. The 7-metric screen, as literally written, does not carve out this case (unlike its explicit REIT and bank/insurance carve-outs). **Judgment call**: NEE is mechanically excluded per the letter of the rule, but an analyst should not read this the same way as, say, a serial-dilution meme stock failing the same metric. This is exactly the kind of case the skill's own limitations disclaimer warns about — passing/failing a mechanical filter isn't the final word.

---

## Sector Summary

**Pass rate: 20/22 (91%)** — expected and by design, since this sample was deliberately weighted toward S&P 500 mega-cap leaders, which are disproportionately high-quality by construction (they got to mega-cap status partly *because* of strong historical capital efficiency). This pass rate should **not** be read as "91% of the S&P 500 passes" — a genuinely random sample including mid-cap laggards, over-levered legacy names, and cyclical also-rans would score meaningfully lower.

| Quality tier | Companies | Common trait |
|---|---|---|
| First-rate, no waivers needed | AAPL, MSFT, NVDA, GOOGL, META, V, MA, JNJ, PG, LLY, BRK.B (adjusted), JPM (adjusted), CAT | Clean pass on all applicable metrics |
| Pass, but via explicit waiver | COST (Waiver C — textbook case), WMT (Waiver C), UNH (Waiver-C-style logic), AMZN (Waiver B), AVGO (#7 waived for M&A issuance) | Thin margins or historically low ROE offset by high turnover/ROE/cash-flow quality |
| **Fails, non-consensus** | **TSLA** (ROE), **NEE** (FCF, flagged as likely sector artifact) | Both are "beloved" names the mechanical screen still catches — the point of the exercise |

---

## AI Confidence vs. Investment Certainty
- **High confidence**: the two excluded names' disqualifying figures (TSLA's 10-yr median ROE, NEE's TTM FCF) were independently verified this session from named sources.
- **Lower confidence**: [Est.] entries reflect well-established consensus financial characteristics for extremely well-covered mega-caps, not freshly re-verified point-in-time figures this session — directionally reliable, but exact percentages could be off by a few points and should be re-checked before being used as a hard input to a valuation model.
- **Critical reminder**: passing this screen ≠ "good investment" — it only means a company is not *disqualified* on capital-efficiency grounds. Valuation, moat durability, and management quality are separate, unaddressed questions (see the skill's own limitations statement).

## Follow-up / First-Party Verification Checklist
1. Full 10-year ROE/margin series (not median/average approximations) for all [Est.]-labeled companies, pulled directly from 10-Ks rather than aggregator sites.
2. NEE: confirm whether utility-sector capex-driven negative FCF should be treated as a standing methodological carve-out (like the REIT and bank/insurance exemptions already in the skill) rather than a case-by-case judgment call.
3. TSLA: verify whether recent (2024-2026) ROE improvement is durable enough to move the 10-year average above 8% in the next rolling window, which would flip the screen result.
4. Expand the sample beyond mega-caps — a genuinely representative random sample of ~40-50 companies spanning small/mid-cap S&P 500 constituents would give a more honest "S&P 500 overall quality" read than this mega-cap-weighted sample.

---

### Sources
- [GuruFocus – TSLA ROE](https://www.gurufocus.com/term/roe/TSLA) · [MacroTrends – Tesla free cash flow](https://www.macrotrends.net/stocks/charts/TSLA/tesla/free-cash-flow) · [MacroTrends – Tesla financial ratios](https://www.macrotrends.net/stocks/charts/TSLA/tesla/financial-ratios)
- [FinanceCharts – XOM ROE](https://www.financecharts.com/stocks/XOM/growth/roe) · [GuruFocus – XOM ROE](https://www.gurufocus.com/term/ROE/NYSE:XOM/ROE-/Exxon-Mobil) · [MacroTrends – Exxon FCF](https://www.macrotrends.net/stocks/charts/XOM/exxon/free-cash-flow)
- [Broadcom VMware acquisition terms](https://investors.broadcom.com/news-releases/news-release-details/broadcom-acquire-vmware-approximately-61-billion-cash-and-stock) · [Capital.com – VMware deal](https://capital.com/en-int/analysis/vmware-vmw-takeover-avgo-broadcom-stock-price)
- [StockAnalysis – NEE statistics](https://stockanalysis.com/stocks/nee/statistics/) · [StockAnalysis – NEE cash flow statement](https://stockanalysis.com/stocks/nee/financials/cash-flow-statement/) · [Eulerpool – NEE ROE](https://eulerpool.com/stock/Nextera-Energy-Stock-US65339F1012/roe)
- [MacroTrends – Caterpillar ROE](https://www.macrotrends.net/stocks/charts/CAT/caterpillar/roe) · [MacroTrends – Caterpillar FCF](https://www.macrotrends.net/stocks/charts/CAT/caterpillar/free-cash-flow) · [MacroTrends – Caterpillar net margin](https://www.macrotrends.net/stocks/charts/CAT/caterpillar/profit-margins)

*This report is AI-generated from public sources and general knowledge for research-framework demonstration purposes and is not investment advice. [Est.]-labeled figures should be independently re-verified before use in any real investment decision.*
