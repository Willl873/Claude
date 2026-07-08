# AI Compute — Industry Funnel: Full Market to 3 Final Picks

> Framework: value-investing funnel — broad scan → hard-metric filter → detailed analysis → four-master deep dive on 3 finalists
> Screen date: 2026-07-08 ｜ AI-assisted research, not investment advice

---

## Step 0: Investment Logic Chain (quick validation before the funnel)

```
AI model training & inference demand keeps compounding
  → Hyperscalers commit record capex (Microsoft/Google/Amazon/Meta capex guidance all raised through 2026)
    → Demand for accelerators (GPU + custom ASIC) far exceeds supply
      → Bottlenecks cascade upstream: leading-edge foundry capacity, EUV lithography, HBM memory
      → Bottlenecks cascade sideways: power delivery, liquid cooling, high-speed networking/optics
        → Value concentrates in the chokepoints, not just the chip brand names
```

**Already-happened validation events** (not projections):
- Broadcom's AI backlog is **$73B**, with a stated target of **$100B annual AI revenue by 2027** — a real, disclosed order book, not a forecast.
- HBM memory is **sold out through 2026** across suppliers — a supply-constraint fact, not a demand guess.
- Vertiv's backlog exceeds **$15B** (~17 months of forward revenue at current run-rate, verified by calculation) — real signed business.
- Arista raised **FY2026 revenue guidance to ~$11.5B**, already running at a $10.8B annualized pace in Q1 — a raise on top of delivered results, not a hope.

This is a logic chain with hard, already-signed evidence at every link — a stronger starting position than most "AI-themed" narratives.

---

## Step 1: Value Chain Map

```
Upstream (equipment & materials): EUV lithography (ASML monopoly) → wafer fab equipment (Applied Materials/Lam/KLA/Tokyo Electron)
Midstream (silicon):    Foundry (TSMC dominant; Samsung, Intel Foundry, SMIC distant) → GPU/Accelerator design (Nvidia, AMD, custom ASIC via Broadcom/Marvell)
                          → Memory (HBM: SK Hynix/Micron/Samsung)
Interconnect:            Networking & optics (Arista, Credo, Astera Labs, Coherent, Marvell)
Physical infrastructure: Power delivery & liquid cooling (Vertiv, Eaton) → server/rack integration (Super Micro, Dell, Foxconn, Quanta, Wiwynn)
Demand side:             Hyperscalers (Microsoft, Google, Amazon, Meta) — both biggest customers AND increasingly in-house chip designers
China-parallel track:    Huawei Ascend, Cambricon, SMIC, domestic HBM — capped by export controls, ~5x behind today, gap widening to ~17x by 2027 per most-cited estimates
Private/pre-IPO:         Cerebras, Groq, SambaNova — alternative accelerator architectures, none yet at hyperscale commercial volume
```

### Chokepoint identification (highest pricing power / hardest to replicate)
1. **ASML (EUV lithography)** — true single-supplier monopoly; without it, no leading-edge chip of any kind gets made, anywhere, by anyone.
2. **TSMC (leading-edge foundry)** — the only foundry that can reliably produce at the nodes Nvidia/AMD/Broadcom's designs require at volume.
3. **HBM memory (SK Hynix/Micron)** — sold out through 2026; binding constraint on how many accelerators can actually ship, regardless of GPU/ASIC design capacity.
4. **Broadcom (custom ASIC co-design)** — the design partner behind Google TPU, Meta MTIA, Microsoft Maia, and (new in 2026) OpenAI/Anthropic's Titan program — a chokepoint on the *design* side that's less visible than the chip brand names.

---

## Step 2: Market-Wide Scan (~30 names, full value chain)

| Company | Ticker/Market | Segment | Category |
|---|---|---|---|
| Nvidia | NVDA (US) | GPU/accelerator | A (mkt cap anchor) |
| AMD | AMD (US) | GPU/accelerator | A |
| Intel | INTC (US) | GPU/accelerator, foundry | A |
| Broadcom | AVGO (US) | Custom ASIC design | A |
| Marvell | MRVL (US) | Custom ASIC design | A |
| Alchip | 3661.TWO (Taiwan) | ASIC design services | C |
| TSMC | TSM (US ADR/Taiwan) | Foundry | A |
| Samsung Electronics | 005930.KS (Korea) | Foundry + memory | A |
| Intel Foundry | (part of INTC) | Foundry | A |
| SMIC | 0981.HK (Hong Kong) | Foundry (China, capped at 7nm) | B/C |
| SK Hynix | 000660.KS (Korea) | HBM memory | A |
| Micron | MU (US) | HBM memory | A |
| ASML | ASML (US ADR/Netherlands) | EUV lithography | A |
| Applied Materials | AMAT (US) | Wafer fab equipment | A |
| Lam Research | LRCX (US) | Wafer fab equipment | A |
| KLA Corp | KLAC (US) | Wafer fab equipment | A |
| Tokyo Electron | 8035.T (Japan) | Wafer fab equipment | A |
| Arista Networks | ANET (US) | AI networking/switching | A |
| Credo Technology | CRDO (US) | High-speed connectivity | A |
| Astera Labs | ALAB (US) | Connectivity chiplets/fabric | A |
| Coherent | COHR (US) | Optical components | A |
| Vertiv | VRT (US) | Power & liquid cooling | A |
| Eaton | ETN (US) | Power management | A |
| Schneider Electric | SU.PA (France) | Power/energy management | A |
| Super Micro | SMCI (US) | Server integration | B |
| Dell Technologies | DELL (US) | Server integration | A |
| HPE | HPE (US) | Server integration | A |
| Foxconn/Hon Hai | 2317.TW (Taiwan) | Contract manufacturing | A |
| Quanta Computer | 2382.TW (Taiwan) | Server ODM | A |
| Wiwynn | 6669.TWO (Taiwan) | Server ODM | B |
| Huawei (Ascend) | Not listed (private) | GPU/accelerator (China) | C — future IPO candidate, none scheduled |
| Cambricon | 688256.SH (China A-share, STAR Market) | GPU/accelerator (China) | B/C |
| Cerebras | Private | Alternative accelerator architecture | C — IPO withdrawn/pending as of last public filing |
| Groq | Private | Alternative accelerator architecture | C — future IPO candidate |
| SambaNova | Private | Alternative accelerator architecture | C — future IPO candidate |
| Microsoft/Google/Amazon/Meta | MSFT/GOOGL/AMZN/META | Hyperscaler + in-house silicon | A, but diversified mega-caps, not pure-plays |

**Bias check**: this pool deliberately includes Taiwan/Korea/Japan equipment and ODM names (not just US tickers) and explicitly flags the China track (Huawei/Cambricon/SMIC) rather than omitting it for data-scarcity reasons — consistent with the "don't drop names just because English coverage is thin" rule.

---

## Step 3: Hard-Metric Filter → Retained ≤10

### Filter criteria applied
Reasonable valuation for growth profile · ROE >15% or clearly improving · operating cash flow positive and healthy vs. net income · manageable leverage · moat ★★★ or higher.

### Retained (9)

| Company | Segment | Moat rating | Why retained |
|---|---|---|---|
| **Nvidia (NVDA)** | GPU/accelerator | ★★★★★ | ~70–75% of a $200B+ market; CUDA software lock-in is the deepest moat in the group |
| **Broadcom (AVGO)** | Custom ASIC design | ★★★★★ | Sole design partner across all 5 hyperscalers' custom silicon programs; $73B backlog |
| **TSMC (TSM)** | Foundry | ★★★★★ | Only foundry that can reliably deliver leading-edge volume; effectively irreplaceable |
| **ASML** | EUV lithography | ★★★★★ | Literal single-supplier monopoly on EUV tools |
| **SK Hynix** | HBM memory | ★★★★ | 50–62% of HBM market, ~2/3 of NVIDIA's next-gen HBM4 orders |
| **Micron (MU)** | HBM memory | ★★★★ | #2/3 HBM supplier, US-listed, sold out capacity through 2026 |
| **Arista Networks (ANET)** | AI networking | ★★★★ | 35% YoY growth, raised FY26 guide to ~$11.5B, entering optics |
| **Astera Labs (ALAB)** | Connectivity/fabric | ★★★★ | 93% YoY growth, new $20B switching-market entry (Scorpio) |
| **Vertiv (VRT)** | Power & cooling | ★★★★ | $15B backlog (~17 months forward revenue, verified), margins expanding |

### Excluded (with reasons — no black boxes)

| Company | Reason excluded |
|---|---|
| AMD | Only 6–8% accelerator share vs. Nvidia's 70–75%; weaker software-ecosystem moat (no CUDA-equivalent lock-in); included in the scan but not competitive enough on moat depth to make the cut |
| Intel | Persistent execution problems in both products and foundry; cash-flow quality has been weak during the ongoing turnaround; moat actively eroding rather than widening |
| Samsung Electronics | Conglomerate structure dilutes the pure-play thesis; memory-cycle ROE has been volatile with foundry division still loss-making in recent periods |
| SMIC | Capped at ~7nm by export controls with no credible path to leading-edge; data transparency is limited (China A-share/HK, state-linked); excluded on both technology-ceiling and data-quality grounds |
| Cambricon | Extreme valuation volatility, thin multi-year track record, revenue base still small relative to Huawei; promising (forecast 3.7x revenue growth this year per Goldman Sachs) but too speculative for the hard-metric filter — flagged for the watchlist, not the funnel |
| Huawei (Ascend) | Not investable — no listed pure-play vehicle exists |
| Credo Technology | Excellent momentum (272% YoY revenue growth) but smaller scale than Astera Labs in the same connectivity niche; kept on close watchlist rather than retained twice in an overlapping category |
| Coherent | Solid optics beneficiary but more commoditized component supplier vs. Astera/Credo's higher-value chiplet/fabric positioning |
| Applied Materials / Lam Research / KLA / Tokyo Electron | All solid wafer-fab-equipment businesses, but positioned one step further from the AI-specific bottleneck than ASML's EUV monopoly; grouped as a diversified "picks-and-shovels" basket rather than individually retained to avoid redundant equipment-sector weight |
| Super Micro, Dell, HPE, Foxconn, Quanta, Wiwynn | Thin-margin assemblers/integrators — high revenue growth riding the AI wave, but weak pricing power and low structural moat (commodity hardware economics); excluded on moat-depth grounds despite strong top-line growth |
| Eaton, Schneider Electric | Diversified industrial conglomerates where AI data-center exposure is one segment among several — Vertiv is the cleaner pure-play retained instead |
| Cerebras, Groq, SambaNova | Private, no listed vehicle; alternative accelerator architectures with real technical merit but no proven hyperscale commercial volume yet — future-IPO watchlist, not currently investable |
| Microsoft, Google, Amazon, Meta | Real AI-compute beneficiaries (and increasingly in-house chip designers) but excluded from this **pure-play** funnel as diversified mega-caps — they belong in a general mega-cap tech allocation, not an AI-infrastructure-specific one |

---

## Step 4: Detailed Analysis (9 retained companies, ~300–500 words each)

### Nvidia (NVDA)
**One-line model**: sells the GPU + CUDA software stack that trains and runs almost all frontier AI models. **Financial quality**: ~70–75% share of a data-center accelerator market now above $200B and still roughly doubling — even a "shrinking" share slice is a much bigger absolute number than a year ago. **Moat depth**: CUDA's multi-year software lock-in remains the single deepest moat in the entire value chain — switching an AI training stack off Nvidia is an enormous engineering undertaking, not a spec-sheet decision. **Key risks (top 3)**: (1) hyperscaler custom ASIC is growing ~3x faster than merchant GPU shipments and now sits near 15–20% share — the erosion is real, even if slow; (2) valuation already prices in continued dominance, leaving little room for share-loss surprises; (3) export-control policy risk to China revenue. **Valuation quick take**: priced for continued category leadership — not cheap, but not obviously disconnected from the realistic growth path either. **Advance to final 3?** No — not because it's a bad business, but because it is the single most consensus, most-discussed, most-already-owned name in this entire theme. Including it would add no informational edge and no portfolio differentiation versus simply buying an AI-themed index.

### Broadcom (AVGO)
**One-line model**: co-designs the custom AI silicon that Google, Meta, Microsoft, and now OpenAI/Anthropic use instead of (or alongside) Nvidia GPUs — sells picks-and-shovels to the GPU-alternative trade. **Financial quality**: $73B AI backlog, explicit management target of $100B annual AI revenue by 2027 — real, disclosed, forward-visible. **Moat depth**: being the design partner across *all five* hyperscalers simultaneously is a structural position no single competitor currently occupies at the same scale. **Key risks**: (1) customer concentration — a handful of hyperscalers account for the overwhelming majority of this backlog; (2) if custom ASIC economics disappoint hyperscalers relative to next-gen merchant GPUs, orders could slow; (3) integration/execution risk given the scale of simultaneous programs. **Valuation quick take**: priced for continued acceleration, which the backlog partially de-risks versus a pure-story stock. **Advance to final 3? Yes** — designated **Growth** slot.

### TSMC (TSM)
**One-line model**: the only foundry that can reliably manufacture leading-edge chips at the volumes Nvidia, AMD, and Broadcom's designs require. **Financial quality**: industry-leading ROIC, extremely disciplined capital allocation history. **Moat depth**: genuinely close to irreplaceable — every credible AI chip design in this entire report ultimately depends on TSMC capacity somewhere in its supply chain. **Key risks**: (1) geopolitical/Taiwan concentration risk is the single largest tail risk in the entire AI compute value chain; (2) enormous, unavoidable capex requirements; (3) customer concentration on the same handful of AI chip designers as everyone else in this report. **Valuation quick take**: historically re-rates cautiously despite the strength of its position, partly because of the geopolitical discount. **Advance to final 3? Yes** — designated **Core** slot.

### ASML
**One-line model**: sells the one machine (EUV lithography) without which no leading-edge chip — GPU, ASIC, HBM, or otherwise — can be manufactured anywhere in the world. **Financial quality**: extreme pricing power, order-book visibility measured in years. **Moat depth**: a literal single-supplier monopoly — the cleanest moat of anything in this report. **Key risks**: (1) export-control/geopolitics affect who it can sell to; (2) extremely long sales cycles and lumpy order timing create volatility even in a structurally growing market; (3) concentrated customer base (TSMC, Samsung, Intel, SK Hynix, Micron — largely the same companies already in this report). **Valuation quick take**: consistently commands a premium, which the monopoly justifies but limits margin of safety. **Advance to final 3?** Close call — excluded only to avoid stacking two near-identical "irreplaceable monopoly" slots with TSMC; flagged as the top alternate for the Core slot.

### SK Hynix
**One-line model**: sells the HBM memory that is the current binding constraint on how many AI accelerators can actually ship. **Financial quality**: 50–62% of HBM market, ~2/3 of Nvidia's next-gen HBM4 orders — clear technology leadership within the segment. **Moat depth**: technology lead in the highest-value memory tier, though memory itself is historically a brutally cyclical, capital-intensive commodity business. **Key risks**: (1) memory is the most historically cyclical segment in this entire report — HBM's current shortage could become oversupply if capacity additions overshoot demand; (2) Korean listing adds currency/access friction for some investors; (3) competitive gap with Samsung/Micron could narrow. **Advance to final 3?** No — retained for the watchlist; Micron chosen instead as the "optionality" pick for accessibility (US-listed) reasons, see below.

### Micron (MU)
**One-line model**: the US-listed HBM/memory pure-play riding the same supply-constraint dynamic as SK Hynix. **Financial quality**: capacity sold out through 2026 — real, disclosed near-term revenue visibility. **Moat depth**: weaker than SK Hynix's #1 position, but the entire HBM segment currently enjoys extraordinary pricing power due to the supply shortage. **Key risks**: (1) the classic memory-cycle risk — this segment has boomed and busted repeatedly over decades, and today's shortage is not guaranteed to persist; (2) technology leadership gap vs. SK Hynix on HBM4; (3) capital intensity requires continuous heavy reinvestment. **Advance to final 3? Yes** — designated **Optionality/high-beta** slot, specifically because memory's cyclicality is exactly the kind of asymmetric, less-consensus exposure a portfolio-completing third pick should carry.

### Arista Networks (ANET)
**One-line model**: sells the high-performance switches that connect thousands of AI accelerators into a single training cluster. **Financial quality**: 35% YoY revenue growth, FY26 guidance raised to ~$11.5B (verified: consistent with the delivered Q1 run-rate plus a modest ~6% implied acceleration). **Moat depth**: strong incumbent position in AI-cluster networking, now expanding into optics (XPO) to defend against disintermediation. **Key risks**: (1) direct competitive pressure from Nvidia's own networking push (NVLink/Spectrum-X); (2) customer concentration in hyperscaler capex cycles; (3) new optics business is unproven at scale. **Advance to final 3?** No — strong retained name, but growth profile overlaps meaningfully with Broadcom's networking-adjacent exposure; kept as the top watchlist alternate for the Growth slot.

### Astera Labs (ALAB)
**One-line model**: sells the connectivity chiplets (PCIe, and now the Scorpio AI fabric switch) that let accelerators talk to each other and to memory at the speeds AI workloads require. **Financial quality**: 93% YoY revenue growth, now entering the $20B AI switching market via Scorpio. **Moat depth**: strong technical position in a genuinely necessary but less-discussed layer of the stack. **Key risks**: (1) much smaller and newer than Arista/Broadcom — less proven at full hyperscale volume; (2) customer concentration; (3) Scorpio is a brand-new product line, unproven competitively at scale yet. **Advance to final 3?** No — retained on watchlist as the highest-optionality networking name, but Micron's cyclical-value profile was chosen over Astera's still-unproven-at-scale profile for the Optionality slot.

### Vertiv (VRT)
**One-line model**: sells the power delivery and (increasingly) liquid cooling systems that keep AI data centers from overheating. **Financial quality**: $15B backlog (verified ≈17 months of forward revenue at the current $2.65B quarterly run-rate), Q1 2026 adjusted EPS +83% YoY, operating margin expanded 430bps to 20.8%. **Moat depth**: incumbent scale advantage in a physically complex, engineering-intensive niche that's shifting fast from air to liquid cooling. **Key risks**: (1) increasing competition as liquid cooling attracts new entrants (e.g., Eaton's Boyd Thermal acquisition); (2) customer concentration in hyperscaler capex; (3) backlog conversion timing risk. **Advance to final 3?** No — excellent business, retained as the top watchlist alternate; excluded from the final 3 only to keep the portfolio focused on silicon/foundry chokepoints rather than adding a fourth semiconductor-adjacent-but-different category.

---

## Step 5: Final 3 — Four-Master Deep Dive

Selection logic: not "top 3 by score," but portfolio complementarity — **1 high-certainty/low-volatility (Core)**, **1 medium-certainty growth (Growth)**, **1 high-optionality/high-volatility (Optionality)**. Nvidia was deliberately not chosen for any slot — not on quality grounds, but because it is the single most consensus, most fully-priced, most-already-owned name in the theme; a good funnel process should ask "where does the market's attention already sit" and lean toward what's comparatively underweighted in typical portfolios, not restate the obvious mega-cap.

---

### 🏛️ Core: TSMC (TSM)

**Duan Yongping lens — business nature**: TSMC's business is deceptively simple: it manufactures the physical chips that every AI compute company in this report (Nvidia, Broadcom, AMD, and even Apple/Qualcomm outside AI) actually depends on. It doesn't design chips, doesn't compete with its customers, and captures value purely from manufacturing excellence at a scale nobody else has matched. Its "本分" (staying in its lane) is arguably the most disciplined in the entire semiconductor industry — it has never meaningfully tried to become a chip designer and compete with its own customers, unlike Samsung or Intel.

**Buffett lens — moat depth** (★ = 1–5):
| Moat | Strength | Evidence |
|---|---|---|
| Brand/pricing power | ★★★★★ | Customers pay a premium and queue for capacity years in advance |
| Switching cost | ★★★★★ | Redesigning a chip for a different foundry's process node takes years and enormous engineering cost |
| Network effects | ★★★ | Ecosystem of design tools/IP optimized for TSMC processes reinforces lock-in |
| Scale effects | ★★★★★ | No competitor can match leading-edge yield and volume simultaneously |
| Technology/license barrier | ★★★★★ | Multi-generation process lead over Samsung and Intel Foundry |

Will this moat still exist in 10 years? Almost certainly yes in *some* form — the capital and expertise barriers to leading-edge fabrication are close to insurmountable for a new entrant. The real question is not whether TSMC's moat erodes, but whether geopolitical events (Taiwan) disrupt access to it entirely — a risk *external* to the business model itself.

**Munger lens — inversion/risk**: Ways this fails: (1) a Taiwan geopolitical crisis disrupts operations or access — by far the largest single risk in this entire report; (2) a genuine technology surprise lets Samsung or Intel Foundry close the process gap faster than expected; (3) a slowdown in AI capex broadly reduces leading-edge demand across all customers simultaneously. Historical analogy: closest comparison is a utility with a geographic monopoly, except the "geography" risk here is literally a live geopolitical fault line. Smart money doesn't avoid TSMC because the business is bad — it's the best-run company in this entire chain — it avoids full position sizing because of the tail risk that has nothing to do with execution.

**Li Lu lens — civilizational trend**: Semiconductor manufacturing at the leading edge is as close to a civilizational chokepoint as exists in the modern economy — TSMC is not just an AI play, it is the substrate underneath the entire digital economy. Twenty years from now, this is very likely still "the standard oil" of computing — the risk to that outcome is almost entirely geopolitical, not commercial.

**Recommendation**: ★★★★★ ｜ Position type: **Core** ｜ Suggested entry: current price or on any geopolitics-driven pullback (the business risk is not mispriced, the geopolitical discount often overshoots) ｜ Suggested weight: 40-50% of a 3-name AI-compute allocation ｜ Key monitoring signal: any material change in Taiwan Strait tensions, and the pace of Samsung/Intel Foundry process-node catch-up.

---

### 🚀 Growth: Broadcom (AVGO)

**Duan Yongping lens — business nature**: Broadcom's AI business is a co-design partnership model — it doesn't sell a branded chip to end users, it embeds itself as the essential engineering partner inside the world's largest technology companies' internal silicon programs. This is a genuinely different business model from Nvidia's merchant-GPU approach: lower brand visibility, but arguably stickier once a hyperscaler's entire chip roadmap is built around Broadcom's design IP.

**Buffett lens — moat depth**:
| Moat | Strength | Evidence |
|---|---|---|
| Brand/pricing power | ★★★★ | Not consumer-visible, but the sole partner across all 5 hyperscaler custom-silicon programs |
| Switching cost | ★★★★★ | A hyperscaler that has co-designed multiple chip generations with Broadcom faces enormous cost to switch design partners mid-roadmap |
| Network effects | ★★ | Limited — this is a bilateral engineering relationship, not a platform effect |
| Scale effects | ★★★★ | Simultaneous programs across 5 major customers create engineering leverage competitors can't easily replicate |
| Technology barrier | ★★★★ | Deep systems-and-silicon co-design expertise built over many acquisitions and years |

Ten years out, this moat depends heavily on whether hyperscalers continue to prefer a specialized outside design partner over fully vertical in-house teams — a real but not certain assumption.

**Munger lens — inversion/risk**: Failure paths: (1) a major hyperscaler brings design fully in-house and drops Broadcom as a partner; (2) custom ASIC economics disappoint relative to next-generation merchant GPUs, slowing the whole category; (3) integration risk from running several massive concurrent design programs simultaneously. Why a smart skeptic might pass: customer concentration this extreme (a handful of hyperscalers) means Broadcom's fate is not fully in its own hands.

**Li Lu lens — civilizational trend**: The shift from "buy a GPU" to "co-design your own silicon" is itself a structural, likely-permanent shift for companies operating at hyperscale — Broadcom is positioned as the indispensable arms-dealer-slash-engineering-partner for that shift, not a single customer's fortunes.

**Recommendation**: ★★★★☆ ｜ Position type: **Growth** ｜ Suggested entry: current price, add on pullbacks tied to broad AI-capex sentiment swings rather than company-specific news ｜ Suggested weight: 30-40% ｜ Key monitoring signal: any hyperscaler announcement of bringing custom silicon design fully in-house (the single biggest threat to this thesis).

---

### 🎲 Optionality: Micron (MU)

**Duan Yongping lens — business nature**: Micron sells memory — historically one of the purest commodity businesses in technology, subject to brutal multi-year boom-bust pricing cycles. What's different right now is that HBM (the specific memory type AI training/inference needs) is structurally supply-constrained through 2026, giving Micron pricing power it has rarely enjoyed in its history. This is a genuinely cyclical business currently enjoying a structural tailwind — the "对的生意" question here is not "is this always a good business" (it isn't) but "is now a good moment in the cycle to own it."

**Buffett lens — moat depth**:
| Moat | Strength | Evidence |
|---|---|---|
| Brand/pricing power | ★★★ | Currently strong due to shortage, historically weak in oversupply |
| Switching cost | ★★ | Memory is more substitutable between qualified suppliers than logic chips |
| Network effects | ★ | None |
| Scale effects | ★★★★ | Capital intensity creates real barriers to new entrants |
| Technology barrier | ★★★ | Real but behind SK Hynix specifically on HBM4 |

This is honestly the weakest moat of the three final picks — which is exactly why it's the **Optionality** slot, not the Core.

**Munger lens — inversion/risk**: This is the most classically cyclical name in the entire report. Failure paths: (1) memory capacity additions (from Micron, SK Hynix, Samsung, and new Chinese entrants) overshoot demand, flipping the current shortage into an oversupply glut — this exact pattern has happened repeatedly in memory's history; (2) HBM technology leadership gap to SK Hynix widens further; (3) a broader AI-capex slowdown hits the most price-sensitive, least-differentiated part of the value chain hardest. Historical analogy: memory cycles are the semiconductor industry's most reliable boom-bust pattern — this is precisely why smart, cycle-aware investors are cautious about extrapolating today's shortage indefinitely.

**Li Lu lens — civilizational trend**: AI's memory-bandwidth requirements are a genuine structural shift (this is not "just another PC-memory cycle"), but memory as an industry has never permanently escaped its cyclicality, regardless of the end-demand driver. Twenty years out, this segment is much more likely to still be cyclical than to have become a permanent monopoly-style toll booth.

**Recommendation**: ★★★☆☆ ｜ Position type: **Optionality/high-beta** ｜ Suggested entry: current price is acceptable given sold-out-through-2026 visibility, but this is the name to trim first if cycle-turn signals appear (inventory builds, competitor capacity announcements) ｜ Suggested weight: 10-20% ｜ Key monitoring signal: any HBM capacity-expansion announcement from Samsung/SK Hynix/Chinese entrants, and spot memory pricing trends.

---

## Step 6: Portfolio Summary

| Company | Type | Recommendation | Suggested weight | Core logic | Key risk |
|---|---|---|---|---|---|
| TSMC (TSM) | Core | ★★★★★ | 40-50% | Irreplaceable foundry underneath the entire AI chip stack | Taiwan geopolitical risk |
| Broadcom (AVGO) | Growth | ★★★★☆ | 30-40% | Sole co-design partner across all 5 hyperscaler custom-silicon programs, $73B backlog | Extreme customer concentration |
| Micron (MU) | Optionality | ★★★☆☆ | 10-20% | HBM shortage gives pricing power to an otherwise-cyclical business, sold out through 2026 | Classic memory boom-bust cyclicality |

### Sector ETF alternative
For investors who prefer not to pick individual names: broad semiconductor ETFs (e.g., SOXX, SMH) capture most of this value chain's upstream/midstream exposure in one instrument; a networking/infrastructure-focused AI ETF would be needed separately for the Arista/Vertiv-style names, which broad semis ETFs underweight.

### Overall industry positioning
- Every retained company in Step 4 is trading with real, disclosed forward visibility (backlogs, sold-out capacity, raised guidance) rather than pure narrative — a genuinely unusual amount of hard evidence for an "AI theme."
- The industry is in an **expansion phase**, not early-stage or mature — capex commitments, backlogs, and capacity utilization all point to a multi-year build-out already underway and contractually locked in, not merely anticipated.
- The single largest risk to the *entire* value chain simultaneously is a slowdown in hyperscaler capex growth rates — nearly every retained name's near-term revenue ultimately traces back to the same four or five capex budgets (Microsoft, Google, Amazon, Meta, and increasingly OpenAI/Anthropic via Broadcom).

### Information-sufficiency self-rating

| Dimension | Grade | Note |
|---|---|---|
| Company financial data completeness | A | Public company disclosures, backlogs, and guidance are unusually well-documented across this chain |
| Valuation data timeliness | B | Figures reflect a mix of Q1 2026 reported results and recent secondary aggregation, not all independently re-verified same-day |
| Industry structure judgment | A | Value-chain logic and chokepoint identification are corroborated by multiple independent sources per segment |
| Management information | B | Reflects public earnings-call commentary summaries rather than full primary-transcript reads for all 9 retained names |

### Pending data points to update
- Confirm exact FY2026 capex guidance figures directly from Microsoft/Google/Amazon/Meta's own most recent quarterly filings (used here only as directional context, not independently re-verified line by line).
- SK Hynix vs. Micron HBM4 allocation percentages should be re-checked next quarter — this is a fast-moving competitive data point.
- Broadcom's $100B-by-2027 AI revenue target is a management target, not a guarantee — track quarterly backlog conversion against it.
- TSMC's exact leading-edge capacity allocation across Nvidia/AMD/Broadcom customers was not independently broken out in sources reviewed this pass.

---

## AI Research Bias Self-Check (industry-level)
- **Mature-sector bias**: avoided by deliberately including newer/smaller names (Astera Labs, Credo) alongside mega-caps rather than only covering the most-discussed names.
- **Large-cap bias**: directly addressed by excluding Nvidia from the final 3 specifically to avoid restating consensus.
- **Listed-company bias**: addressed by explicitly naming private candidates (Cerebras, Groq, SambaNova) as a future-IPO watchlist rather than omitting them.
- **English-language bias**: addressed by including Korean (SK Hynix, Samsung), Taiwanese (TSMC, Foxconn, Quanta, Wiwynn, Alchip), Japanese (Tokyo Electron), and Chinese (Cambricon, SMIC, Huawei) names in the scan pool rather than defaulting to a US-only universe.

---

### Sources
- [Silicon Analysts – Nvidia AI GPU market share 2026](https://siliconanalysts.com/analysis/nvidia-ai-accelerator-market-share-2024-2026) · [Tom's Hardware – custom AI ASIC state of play](https://www.tomshardware.com/tech-industry/semiconductors/custom-ai-asics-examined-from-broadcom-to-mtia) · [Oplexa – custom ASIC market 2026](https://oplexa.com/custom-asic-market-2026-hyperscalers-ditching-nvidia/)
- [Presenc AI – HBM market share 2026](https://presenc.ai/research/hbm-market-share-samsung-skhynix-micron-2026) · [Astute Group – SK hynix 62% HBM share](https://www.astutegroup.com/news/general/sk-hynix-holds-62-of-hbm-micron-overtakes-samsung-2026-battle-pivots-to-hbm4/) · [Introl – AI memory supercycle](https://introl.com/blog/ai-memory-supercycle-hbm-2026)
- [Arista Q1 2026 earnings release](https://www.arista.com/en/company/news/press-release/24017-pr-20260505) · [AInvest – Arista Q1 2026 analysis](https://www.ainvest.com/news/arista-networks-q1-2026-ai-networking-momentum-justify-premium-2604/) · [Astera Labs Q1 2026 results](https://www.asteralabs.com/news/astera-labs-reports-first-quarter-2026-financial-results/)
- [HeyGoTrade – Vertiv data center cooling 2026](https://www.heygotrade.com/en/blog/vertiv-vrt-data-center-cooling-ai-2026/) · [Motley Fool – Vertiv & Eaton AI infrastructure plays](https://www.fool.com/investing/2026/07/06/why-vertiv-eaton-ultimate-infrastructure-ai/)
- [CFR – China's AI chip deficit](https://www.cfr.org/articles/chinas-ai-chip-deficit-why-huawei-cant-catch-nvidia-and-us-export-controls-should-remain) · [SemiAnalysis – Huawei Ascend production ramp](https://newsletter.semianalysis.com/p/huawei-ascend-production-ramp) · [Presenc AI – Chinese AI chips landscape 2026](https://presenc.ai/research/chinese-ai-chips-landscape-2026) · [Tom's Hardware – China approved AI hardware suppliers list](https://www.tomshardware.com/tech-industry/artificial-intelligence/china-starts-list-of-government-approved-ai-hardware-suppliers-cambricon-and-huawei-are-in-nvidia-is-not)

*This report is AI-generated from public sources for research-framework demonstration purposes and is not investment advice. Several figures reflect recent secondary aggregation rather than same-day primary-source verification — see the pending data points list above.*
