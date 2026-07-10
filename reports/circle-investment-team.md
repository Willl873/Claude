# Circle Internet Group (CRCL) — Investment Team Report

> Framework: 4-role team synthesis (business/financial/industry/risk lenses), team-lead integration
> Data as of 2026-07-10 ｜ AI-assisted research, not investment advice

---

## AI Research-Bias Assessment

**Information sufficiency: B+ grade.** Circle is a real, SEC-reporting company with dense analyst coverage and audited financials — this is not a data-scarcity situation. The genuine limitation is **trading history length**: CRCL has been public for only about 13 months (June 2025 IPO), which means there is no observed data on how the stock or the underlying reserve-income business behaves across a full multi-year Fed hiking-and-cutting cycle. Every claim below about "how sensitive is Circle to rate changes" is grounded in disclosed mechanics (94% of revenue is reserve income), not in a long observed track record — that's flagged explicitly rather than implied to be more proven than it is.

**Companion report note**: this project's [`sp500-investment-team.md`](./sp500-investment-team.md) covers the broader Fed/inflation backdrop (CPI reaccelerating to 4.2% YoY, a genuinely split FOMC) in more depth — that macro context matters directly here, since Circle's core revenue line is mechanically a function of the same interest-rate environment.

---

## Core Data Snapshot

| Metric | Value | Confidence |
|---|---|---|
| Stock price (2026-07-10) | **$66.12** (intraday range $65.07–$73.67 same session) | Confirmed |
| 52-week range | **$49.90 – $262.97** | Confirmed — stock is down **~75% from its 52-week/all-time high**, but still up **~113% from its $31 IPO price** |
| IPO details | Priced at **$31.00/share**, June 2025; ~19.9M Class A shares, ~$583M net proceeds | Confirmed |
| Market cap | **≈ $16.4B** | Confirmed |
| Trailing P/E | **Negative (≈ -100x headline)** | Confirmed, but **misleading** — see financial-analyst section: driven by a one-time non-cash IPO-vesting stock-comp charge, not an operating loss |
| TTM net loss (GAAP) | **≈ -$79M** (as of Q1 2026 TTM window) | Confirmed |
| Q1 2026 net income | **$55M** (down 15% YoY due to post-IPO stock comp) | Confirmed |
| Q1 2026 total revenue + reserve income | **$694M**, +20% YoY | Confirmed |
| Q1 2026 reserve income | **$652.5M** (94.0% of total revenue), +17% YoY | Confirmed |
| Reserve return rate | **3.5%**, down YoY as rates have drifted | Confirmed |
| Q1 2026 adjusted EBITDA | **$151M**, +24% YoY, **53% margin** | Confirmed |
| USDC circulation (end Q1 2026) | **$77B**, +28% YoY | Confirmed |
| Onchain USDC transaction volume (Q1 2026) | **$21.5T**, +263% YoY | Confirmed — real usage growth well outpacing circulation growth |
| Distribution/transaction costs (Q1 2026) | **$407M**, +17% YoY (~59% of gross reserve income) | Confirmed |
| Coinbase revenue-share arrangement | Coinbase receives **50% of the "residual payment base"** tied to USDC held on its platform | Confirmed |
| Stablecoin market share (by supply) | USDT ≈ 67%, USDC ≈ 27% (total stablecoin supply >$240B) | Confirmed |
| Stablecoin market share (by June 2026 transaction volume) | USDC ≈ 67%, USDT ≈ 32% — **inverse of supply share** | Confirmed |
| GENIUS Act final rules | Due **2026-07-18**; mandates 1:1 reserves in cash/insured deposits/short T-bills, bans issuers paying direct interest to holders | Confirmed |
| Analyst consensus | **Hold** (5 Buy / 6 Hold / 4 Sell) | Confirmed — genuine, disclosed split |
| Analyst price targets | **Wide disagreement**: one source cites ~$133.71 (12-mo target, ~99% implied upside from $66.12); another cites an average of $171.43 tied to an earlier, higher reference price | ⚠️ Flagged discrepancy, not resolved — likely reflects different snapshot dates given the stock's extreme volatility this year |

---

## 🟢 business-analyst (Duan Yongping lens)

**One-line business model**: Circle issues USD-pegged stablecoins — primarily USDC — backed 1:1 by reserves (overwhelmingly short-term U.S. Treasuries and cash), and earns interest income on those reserves. It does **not** charge most users a direct fee to hold or transact USDC; the entire "product" is a stable digital dollar, and the entire "revenue model" is the float.

**Real, verifiable usage growth, not just circulation growth**: USDC circulation grew 28% YoY to $77B — solid, but the more interesting number is **onchain transaction volume, which surged 263% YoY to $21.5T notional** in Q1 2026 alone. Volume growing roughly 9x faster than circulation is a genuine signal that USDC is increasingly being used as a **settlement/payments rail** (moving repeatedly through the economy) rather than sitting idle as a trading-desk parking spot — that's a meaningfully different, more durable kind of demand.

**Diversification beyond pure float income is a real, disclosed strategic priority, not just a talking point**: Circle has committed real capital to **Arc**, a purpose-built Layer-1 blockchain for stablecoin finance (testnet processed 150M+ transactions with ~1.5M wallets in its first 90 days; a $222M token presale from backers including BlackRock and Apollo valued it at ~$3B), alongside the **Circle Payments Network** (cross-border stablecoin payments/FX) and a ~$1.6B tokenized money-market fund (USYC). These are genuine second-engine bets, not yet proven revenue contributors.

**Duan Yongping's test — is this a good business, and what's the "one sentence"?**
> "Circle's core business today is structurally closer to a money-market fund manager than a typical tech company — it collects the float on money it doesn't own and passes none of the yield to depositors. That's a real, working business model with genuine usage growth behind it; the open question is whether that specific economic arrangement (issuer keeps 100% of reserve yield) survives intact as the category matures and competitors challenge it."

---

## 🟢 financial-analyst (Buffett lens)

**The headline "negative P/E" is a real number but a misleading signal — this needs correcting up front.** Circle's TTM GAAP net loss (~-$79M) is driven almost entirely by a one-time, non-cash **$424M stock-based compensation charge in Q2 2025** tied to RSU vesting triggered by the IPO itself — not an ongoing operating loss. On a run-rate basis, the business is clearly profitable: **Q1 2026 net income was $55M, and adjusted EBITDA was $151M at a 53% margin.** Anyone reading only the trailing P/E without this context would draw the wrong conclusion.

**94% of revenue is reserve income — this is, structurally, a leveraged bet on short-term interest rates.** Every dollar of USDC circulating earns Circle the prevailing short-term Treasury yield on that dollar (currently a ~3.5% reserve return rate, already down YoY as the rate cycle has drifted). This cuts both ways depending on Fed policy — see the industry/risk sections below for the direct tie-in to this project's [S&P 500 report](./sp500-investment-team.md) on the current rate environment.

**Distribution costs are the single biggest structural drag on the model, and Coinbase is the biggest single counterparty risk within that drag.** Total distribution/transaction costs were $407M in Q1 2026 (+17% YoY) against $694M of revenue — a ~59% take rate at the gross level. Coinbase specifically receives **50% of the "residual payment base"** tied to USDC balances held on its platform. Revenue-less-distribution-cost margin was 41.4% in Q1, improving slightly as more balances shift to Circle's own platforms (Circle Mint, CPN), where Circle keeps the full spread — **this on-platform mix shift is arguably the single most important margin lever Circle controls**, and is worth monitoring quarter to quarter.

**Buffett's test — real money or fake money, and what's the margin of safety?**
> The profit is real — $55M of quarterly net income and a 53% adjusted-EBITDA margin are not accounting fiction. But it is **rate-cycle-dependent real money**, not the kind of durable, rate-agnostic earnings power Buffett typically prizes. A meaningful, sustained Fed cutting cycle would mechanically compress the reserve return rate and, with it, ~94% of the revenue line — growth in circulation would need to outrun the rate decline just to hold revenue flat.

---

## 🟡 industry-researcher (Munger lens)

**A genuinely contested "who's actually leading" picture — presented honestly rather than resolved artificially, echoing this project's earlier Archer-vs-Joby framing.** By raw supply, Tether's USDT dominates (~67% vs. USDC's ~27%). But by **June 2026 transaction volume, USDC actually led (67% vs. USDT's 32%)** — the inverse ranking. These are two different kinds of leadership: USDT is the dominant *store* of stablecoin value (especially offshore/emerging markets payments), while USDC has become the dominant *DeFi and onchain-transaction* rail. Neither framing is simply wrong.

**Regulation is a real, near-term catalyst, not a vague background factor.** The GENIUS Act's final implementing rules are due **July 18, 2026** — just days after this report's data date. The Act mandates fully-reserved backing in cash/insured deposits/short Treasuries (which Circle already does) and, notably, **bans stablecoin issuers from paying direct interest to holders**. This is a genuine regulatory tailwind for Circle's specific business model (issuer keeps the float, by law, not just by choice) and creates real friction for Tether, which would need a U.S. banking license or partnership to legally serve American users going forward.

**The most important competitive threat isn't Tether — it's the yield-sharing challenger model.** More than 140 companies are reportedly backing a rival stablecoin (OUSD) built around shared yield, zero-cost minting, and decentralized management — i.e., a model that gives reserve yield back to users/participants instead of keeping it entirely at the issuer level. If any material share of stablecoin demand shifts toward yield-sharing structures (even within GENIUS Act constraints on *direct* interest, since yield-sharing can be structured around the ban via rewards/rebates rather than "interest"), it directly attacks the specific economic arrangement Circle's entire revenue model depends on.

**Munger's inversion — why might a smart investor short or avoid this, and what would kill the thesis?**
> The clearest failure path isn't a hack or a de-peg event — Circle's reserves are conservatively managed and audited. It's a **structural one**: if either (a) Fed rates fall meaningfully over the next few years, or (b) yield-sharing competitors force Circle to give up part of its reserve-income take to stay competitive, or (c) Coinbase's distribution take grows as USDC-on-Coinbase balances grow faster than owned-platform balances — any one of these mechanically compresses the core revenue engine, and all three could plausibly happen at once.

---

## 🔴 risk-assessor (Li Lu lens)

**Risk table**:

| Risk | Probability | Impact |
|---|---|---|
| Interest-rate decline compresses reserve income (94% of revenue) | Medium-high over a multi-year horizon — Fed is currently holding/leaning hawkish (per companion S&P 500 report), but that's a point-in-time snapshot, not a durable floor | Very high — this is the single largest lever on Circle's entire revenue line |
| Coinbase distribution-cost concentration (50% of residual USDC-on-Coinbase reserve revenue) | Ongoing, structural | High — a single counterparty relationship materially shapes Circle's margin profile; renegotiation risk is real |
| Yield-sharing competitive entrants (e.g., OUSD and 140+ backers) erode the "issuer keeps the float" model | Uncertain, early-stage | High if realized — attacks the core economic assumption behind 94% of revenue |
| Extreme share-price volatility / speculative positioning | Already realized | Stock ran from a $31 IPO to a $262.97 all-time high, then fell ~75% from that peak to ~$66 — a boom-bust round trip within ~13 months signals the stock has traded substantially on sentiment/momentum, not just on the (real, growing) underlying financials |
| Insider selling | Disclosed, ongoing | Medium — JPMorgan waived the standard post-IPO lockup, letting insiders (including CEO Jeremy Allaire) sell ~$1.4B combined just two months after the IPO; Allaire continues periodic sales (e.g., 59,232 shares on 2026-07-06), at least partly under a pre-scheduled 10b5-1 plan — disclosed and plan-driven, not necessarily a confidence signal, but worth monitoring given the scale and timing |
| Analyst disagreement (Hold consensus: 5 Buy / 6 Hold / 4 Sell) with materially conflicting price targets | Already realized | Medium — reflects genuine, unresolved uncertainty among professional coverage, not a data gap this report can close |

**Management assessment**: Jeremy Allaire co-founded Circle in 2013 and has led it through more than a decade of regulatory and business-model pivots (from a peer-to-peer payments app, to a Bitcoin platform, to today's stablecoin-issuer model) to a successful 2025 IPO — a long, relevant tenure specific to this exact business, which is a point in favor of continuity and domain expertise. The lockup waiver and early, sizable insider selling are disclosed facts that a careful investor should weigh, without over-reading them as a single clean signal either way.

**Li Lu's test — 20 years from now, is this the standard oil of digital dollars, or a flash in the pan?**
> Stablecoins as a category look like a genuinely durable, expanding piece of financial infrastructure — the 263% YoY surge in real onchain transaction volume is hard evidence of that, not hype. Whether **Circle specifically** remains the structurally dominant, most-profitable issuer of that infrastructure over decades is far less certain: it depends on regulatory outcomes still being finalized this month, on a Coinbase relationship Circle doesn't fully control, and on whether the "issuer keeps 100% of the float" economic model survives competitive and possibly regulatory pressure to share yield with end users.

---

## team-lead Synthesis

### One-line conclusion
> Circle is a real, growing, and — contrary to its misleading negative headline P/E — genuinely profitable business (53% adjusted-EBITDA margin) sitting at the center of a real secular growth trend (stablecoins), but its revenue is 94% reserve-income and therefore directly exposed to Fed rate cuts, its margin is structurally capped by a large Coinbase revenue-share arrangement, and its stock has already demonstrated it can round-trip from a $31 IPO to a $263 peak to a ~$66 trough within about a year — this is a real business wrapped in a genuinely volatile, still-immature stock.

### 4-Dimension Scoring

| Dimension | Framework | Score (1-5★) | Verdict |
|---|---|---|---|
| Business quality (Duan Yongping) | Real, profitable, fast-growing usage (263% YoY transaction volume growth); revenue model concentrated in one lever (reserve yield) | ★★★☆☆ | Genuine business, but a narrower earnings engine than the "diversified fintech" framing sometimes implies |
| Moat (Buffett + Munger) | Regulatory tailwind (GENIUS Act) + scale + brand trust in DeFi; but Coinbase dependency and emerging yield-sharing competitors are real, unresolved threats | ★★★☆☆ | Contested — stronger on regulation, weaker on the Coinbase/competitive-model risks |
| Management (Duan Yongping + Buffett) | Long, relevant founder-CEO tenure; disclosed, sizable early insider selling (lockup waiver) | ★★★☆☆ | Domain expertise is a real plus; capital-return/alignment signals are mixed and worth continued monitoring |
| Biggest risk (Munger + Li Lu) | Interest-rate sensitivity of 94% of revenue, layered with Coinbase distribution-cost concentration | High confidence this is the core risk cluster | Structural, not incidental — this is the central fact of the investment case |
| Civilizational trend (Li Lu) | Stablecoins as durable payments/settlement infrastructure | ★★★★☆ | Category trend looks genuinely real; company-specific dominance over decades is less certain |
| Valuation (Buffett) | Negative headline P/E is a one-time GAAP artifact, not an operating loss; on adjusted-EBITDA basis the business is profitable, but the stock has already shown it can move ±75% within a year on sentiment | ★★☆☆☆ | Difficult to underwrite with confidence given the stock's demonstrated volatility and the rate-sensitivity of the earnings base |

### Bull vs Bear

🟢 **Bull case**:
1. Real, growing, profitable business: Q1 2026 adjusted EBITDA of $151M at a 53% margin — not a story stock.
2. Onchain USDC transaction volume grew 263% YoY to $21.5T notional — strong evidence of genuine, deepening real-economy usage, not just speculative circulation.
3. GENIUS Act final rules (due 2026-07-18) mandate fully-reserved, no-direct-interest stablecoins — a structural regulatory tailwind for Circle's existing compliant model, and a real headwind for less-regulated competitors like Tether serving U.S. persons.
4. USDC already leads on transaction volume (67% share in June 2026) even while trailing on raw supply — a meaningful, verifiable form of category leadership.
5. Real second-engine optionality: Arc blockchain (backed by BlackRock, Apollo at a ~$3B token-presale valuation) and Circle Payments Network could diversify revenue beyond pure reserve income over time.
6. Stock is already down ~75% from its all-time high, which for investors who believe the business fundamentals are intact may represent a materially better entry point than mid-2025 euphoria pricing.

🔴 **Bear case**:
1. 94% of revenue is reserve income directly tied to short-term interest rates — a sustained Fed cutting cycle mechanically compresses the core earnings engine regardless of how well the underlying business executes.
2. Distribution costs (~59% of gross reserve income) are structurally high, and 50% of Coinbase-held-balance reserve revenue goes to a single counterparty Circle doesn't control — a real margin ceiling, not a temporary one.
3. Emerging yield-sharing competitors (140+ backers behind OUSD) directly threaten the "issuer keeps 100% of the float" model the entire revenue base depends on.
4. Extreme demonstrated volatility: $31 IPO → $262.97 peak → ~$66 current, a round trip within ~13 months — this is a stock that has already shown it can be priced far above or below any reasonable fundamental anchor.
5. Disclosed, sizable early insider selling (lockup waiver two months post-IPO; CEO continues periodic sales) — not disqualifying on its own, but a real data point.
6. Analyst community itself is split (Hold consensus, 5 Buy/6 Hold/4 Sell) with materially conflicting price targets — genuine, unresolved professional disagreement.

### Buffett Pre-Purchase Checklist

| # | Check | Pass? | Note |
|---|---|---|---|
| 1 | Understandable business | ✅ | Reserve-income-on-a-stablecoin model is genuinely simple to describe, even if the distribution-cost mechanics are less widely understood |
| 2 | Consistent operating history | ⚠️ | Only ~13 months as a public company; longer private operating history exists but under different business-model iterations (peer-to-peer payments, then Bitcoin platform, then stablecoins) |
| 3 | Favorable long-term prospects | ✅ | Stablecoin category usage trend (263% YoY volume growth) is a genuinely strong, verifiable signal |
| 4 | Management rationality on capital allocation | ⚠️ | Real second-engine bets (Arc, CPN) are rational diversification moves; large, early insider selling raises a separate, unresolved question |
| 5 | Management candor | ⚠️ Not independently assessed this pass | Would require direct earnings-call transcript review |
| 6 | Resists institutional imperative | ⚠️ | Coinbase revenue-share arrangement looks more like a structural dependency than a fully independent strategic choice |
| 7 | Focus on ROE, not EPS | ⚠️ Not directly comparable | Reserve-income-model economics don't map cleanly onto traditional ROE analysis |
| 8 | High profit margins | ✅ | 53% adjusted-EBITDA margin in Q1 2026 |
| 9 | Retains and reinvests earnings well | ✅ | Real reinvestment into Arc, CPN, USYC — genuine second-engine capital allocation, not just buybacks/dividends |
| 10 | Price offers a margin of safety | ⚠️ Genuinely unresolved | Negative headline P/E is misleading (one-time charge); on adjusted-EBITDA the business is profitable, but the stock's demonstrated ±75%+ swings within a year make any single "fair value" claim low-confidence |

**Unlike Archer Aviation earlier in this project, most items here are genuinely assessable — Circle passes on business-model clarity and profitability, and the checklist's real weak points are concentrated exactly where the investment thesis is genuinely contested: operating-history length, capital-allocation signal-reading (insider selling), and price certainty given demonstrated extreme volatility.**

### Final Recommendation

| Investor type | Recommendation | Guidance |
|---|---|---|
| Aggressive / growth-oriented | A position sized for genuine rate-cycle and competitive-model risk is defensible | Treat this as a real, profitable business with real optionality (Arc, CPN) — but size assuming both meaningful upside and meaningful downside remain live, given the stock's demonstrated volatility |
| Balanced | **Watch closely; small position at most** | Wait for more clarity on GENIUS Act final rules (due 2026-07-18) and at least a few more quarters of on-platform-mix improvement (the Coinbase-dependency-reducing metric) before sizing up |
| Conservative | **Avoid, or wait for a longer demonstrated operating history** | Only ~13 months of public trading history and revenue that is 94% dependent on the current interest-rate regime are real, disqualifying concerns for a conservative risk budget |

**Key catalysts**:
- 🟢 Add signal: GENIUS Act final rules (2026-07-18) confirm a clean regulatory tailwind for compliant issuers; on-platform (non-Coinbase) balance mix continues rising, lifting margin; Arc or CPN begins contributing meaningful, disclosed revenue; Fed holds or hikes rates, supporting reserve income.
- 🔴 Reduce/avoid signal: Fed pivots to a sustained cutting cycle; Coinbase renegotiates for a larger revenue share or the relationship becomes strained; a yield-sharing competitor (e.g., OUSD) gains meaningful share; further large-scale insider selling beyond routine 10b5-1 activity.

---

## Summary Paragraph

Circle Internet Group is a genuinely profitable, fast-growing business (53% Q1 2026 adjusted-EBITDA margin, 263% YoY growth in real onchain USDC transaction volume) whose negative headline P/E is a misleading artifact of a one-time, non-cash IPO-vesting stock-comp charge rather than a sign of an unprofitable core operation. But the business is also structurally narrow: 94% of revenue is reserve income directly tied to short-term interest rates, nearly 60% of that gross reserve income is paid out in distribution costs (half of the Coinbase-held-balance portion goes straight to Coinbase), and an emerging class of yield-sharing stablecoin competitors directly threatens the "issuer keeps the entire float" economics the whole model depends on. Layer in a stock that has already round-tripped from a $31 IPO to a $262.97 peak to roughly $66 today within about thirteen months, disclosed early and ongoing insider selling, and a genuinely split analyst community (Hold consensus with conflicting price targets), and the honest read is: **a real, regulation-tailwinded business in a durable growth category, priced by a market that has not yet found a stable consensus on what it's worth** — appropriate for capital that can tolerate both the rate-cycle exposure and the stock's demonstrated volatility, not a core holding for a conservative allocation.

---

### Sources
- [StocksToTrade – Circle Internet Group (CRCL) News](https://stockstotrade.com/news/circle-internet-group-inc-crcl-news-2026_07_10/) · [StockAnalysis – CRCL Stock Price & Overview](https://stockanalysis.com/stocks/crcl/)
- [Circle – Circle Reports First Quarter 2026 Results](https://www.circle.com/pressroom/circle-reports-first-quarter-2026-results) · [SEC – Circle Internet Group 8-K, Q1 2026 Results](https://www.sec.gov/Archives/edgar/data/0001876042/000187604226000148/final_05x11q1epr30.htm) · [TIKR – Circle Internet Group Q1 2026: Revenue Hits $694M as USDC Volume Surges 263%](https://www.tikr.com/blog/circle-internet-group-q1-2026-revenue-hits-694m-as-usdc-volume-surges-263title)
- [Decrypt – Coinbase Takes 50% Share of Circle's Residual USDC Reserve Revenue](https://decrypt.co/312757/coinbase-circles-residual-usdc-reserve-revenue-filing) · [insights4vc – Inside Circle's Stablecoin Economics](https://insights4vc.substack.com/p/inside-circles-stablecoin-economics)
- [CNBC – Circle closes $222 million from BlackRock, Apollo for Arc blockchain](https://www.cnbc.com/2026/05/11/circle-closes-222-million-from-blackrock-apollo-for-arc-blockchain.html) · [Circle – Introducing Arc: An L1 Blockchain for Stablecoin Finance](https://www.circle.com/blog/introducing-arc-an-open-layer-1-blockchain-purpose-built-for-stablecoin-finance) · [Circle – Building the Internet Financial System: Circle's Product Vision for 2026](https://www.circle.com/blog/building-the-internet-financial-system-circles-product-vision-for-2026)
- [Bitrue – Stablecoin Trends May 2026: USDT vs USDC, Market Cap & GENIUS Act Explained](https://www.bitrue.com/blog/stablecoin-trend-may-2026) · [Bitcoin Foundation – USDT Dominates Payments, USDC Leads DeFi](https://bitcoinfoundation.org/news/stablecoin-news/usdt-usdc-balance/) · [AssetWhisper – The GENIUS Act and Stablecoin Regulation in 2026](https://assetwhisper.com/genius-act-stablecoin-regulation-2026/)
- [TipRanks – Circle Internet Trade Alert: CEO Allaire and Insiders Cash In Early After IPO Surge](https://www.tipranks.com/news/circle-internet-trade-alert-ceo-allaire-and-insiders-cash-in-early-after-ipo-surge) · [StockTitan – Jeremy Allaire Form 4 Filing (2026-07-06)](https://www.stocktitan.net/sec-filings/CRCL/form-4-circle-internet-group-inc-insider-trading-activity-7c535f8abead.html)
- [Simply Wall St – Circle Internet Group (CRCL) Q1 Profit Challenges Ongoing Trailing Loss Narrative](https://simplywall.st/stocks/us/software/nyse-crcl/circle-internet-group/news/circle-internet-group-crcl-q1-profit-challenges-ongoing-trai) · [FXNewsGroup – Circle incurs net loss of $482M in Q2 2025](https://fxnewsgroup.com/forex-news/payments/circle-incurs-net-loss-of-482m-in-q2-2025/)

*This report is AI-generated from public sources for research-framework demonstration purposes and is not investment advice. Circle's stock has demonstrated extreme volatility (a ~750% rise followed by a ~75% decline within roughly a year of its IPO); all price and valuation figures should be independently re-verified given how quickly they can move.*
