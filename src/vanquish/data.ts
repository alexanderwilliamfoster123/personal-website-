export type Trader = {
  handle: string;
  name: string;
  strategy: string;
  return12m: number;
  winRate: number;
  copiers: number;
  aum: string;
  risk: 1 | 2 | 3 | 4 | 5;
  markets: string[];
  spark: number[];
};

export const traders: Trader[] = [
  { handle: "northstar", name: "Elena Marsh", strategy: "Momentum · Large-cap equities", return12m: 87.4, winRate: 68, copiers: 14210, aum: "$41.2M", risk: 3, markets: ["Equities", "ETFs"], spark: [12, 18, 15, 24, 31, 28, 39, 44, 41, 58, 71, 87] },
  { handle: "quietalpha", name: "Dario Venn", strategy: "Market-neutral pairs", return12m: 31.2, winRate: 74, copiers: 9877, aum: "$63.8M", risk: 2, markets: ["Equities"], spark: [3, 5, 8, 7, 11, 14, 13, 18, 21, 24, 27, 31] },
  { handle: "voltedge", name: "Priya Anand", strategy: "Crypto volatility harvesting", return12m: 142.9, winRate: 61, copiers: 22045, aum: "$28.4M", risk: 5, markets: ["Crypto"], spark: [8, 22, 15, 41, 36, 58, 49, 77, 92, 84, 118, 143] },
  { handle: "ironclad", name: "Marcus Oyelaran", strategy: "Defensive dividend core", return12m: 18.6, winRate: 81, copiers: 18453, aum: "$112.6M", risk: 1, markets: ["Equities", "ETFs"], spark: [2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19] },
  { handle: "fxmeridian", name: "Sofia Keller", strategy: "G10 macro FX", return12m: 44.8, winRate: 66, copiers: 7621, aum: "$37.9M", risk: 3, markets: ["FX"], spark: [5, 9, 7, 14, 12, 19, 24, 22, 29, 34, 39, 45] },
  { handle: "deltatheory", name: "James Whitfield", strategy: "Options income · SPX", return12m: 52.3, winRate: 72, copiers: 11302, aum: "$54.1M", risk: 3, markets: ["Options"], spark: [4, 8, 12, 11, 17, 21, 26, 24, 33, 39, 46, 52] },
  { handle: "atlasmacro", name: "Yuki Tanaka", strategy: "Global macro · Multi-asset", return12m: 61.7, winRate: 64, copiers: 15988, aum: "$89.3M", risk: 4, markets: ["FX", "Commodities", "Indices"], spark: [6, 11, 9, 18, 25, 22, 31, 38, 35, 47, 54, 62] },
  { handle: "greenline", name: "Amara Diallo", strategy: "Clean energy thematic", return12m: 73.1, winRate: 63, copiers: 8874, aum: "$22.7M", risk: 4, markets: ["Equities", "ETFs"], spark: [7, 13, 10, 21, 18, 29, 35, 31, 44, 52, 61, 73] },
];

export const markets = [
  { name: "US Equities", count: "5,000+ stocks", desc: "Every listed US name, from mega-cap to small-cap, with fractional shares from $1." },
  { name: "ETFs", count: "2,400+ funds", desc: "Index, sector, thematic and bond ETFs from the world's largest issuers." },
  { name: "Crypto", count: "120+ assets", desc: "Deep-liquidity execution on majors and alts, held 1:1 in segregated cold storage." },
  { name: "FX", count: "55 pairs", desc: "Institutional spreads on majors, minors and select EM crosses." },
  { name: "Options", count: "US listed", desc: "Defined-risk strategies with plain-English risk summaries before every order." },
  { name: "Commodities & Indices", count: "40+ CFDs", desc: "Gold, oil, and global index exposure where regulation permits." },
];

export const plans = [
  {
    name: "Standard",
    price: "$0",
    period: "/month",
    tagline: "Everything you need to start copying.",
    features: ["Commission-free stocks & ETFs", "Copy up to 3 traders", "Fractional investing from $1", "Real-time market data", "Standard support"],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Premium",
    price: "$12",
    period: "/month",
    tagline: "For serious copiers building a portfolio of traders.",
    features: ["Copy up to 15 traders", "Advanced risk controls & stop-copy rules", "Trader analytics & drawdown alerts", "Priority execution queue", "24/7 priority support", "4.1% APY on uninvested cash"],
    cta: "Start 30-day free trial",
    featured: true,
  },
  {
    name: "Institutional",
    price: "Custom",
    period: "",
    tagline: "For funds, family offices, and professional traders.",
    features: ["Unlimited copy relationships", "API & FIX connectivity", "Dedicated account management", "Custom fee schedules", "Sub-account structures", "White-glove onboarding"],
    cta: "Talk to sales",
    featured: false,
  },
];

export const faqs = [
  { q: "What is copy trading?", a: "Copy trading lets you automatically replicate the trades of experienced investors in your own account, proportionally to the amount you allocate. When a trader you copy opens or closes a position, your account mirrors it in real time. You keep full custody and control — you can pause, adjust, or stop copying at any moment." },
  { q: "How do traders on Vanquish earn?", a: "Lead traders earn a share of the performance they generate for copiers, paid by Vanquish — never taken from your account as a hidden charge. This aligns incentives: traders only earn more when their copiers do well." },
  { q: "What does Vanquish cost?", a: "Stock and ETF trades are commission-free. Copying a trader carries no platform markup on Standard. Premium is $12/month for advanced controls and higher copy limits. Full fee schedules, including FX conversion and crypto spreads, are published on our Pricing page — no hidden fees, ever." },
  { q: "Is my money safe?", a: "Client cash and securities are held in segregated accounts with tier-1 custodians, separate from Vanquish's own funds. Securities accounts are protected by the applicable investor-protection scheme in your region, and crypto is held 1:1 in institutional cold storage. Protection schemes do not cover losses from market movements." },
  { q: "Can I stop copying at any time?", a: "Yes. Stop-copy is instant. You choose whether to close all mirrored positions at market or keep them and manage them yourself from that point on." },
  { q: "What are the risks?", a: "All investing carries risk, and copy trading adds a specific one: past performance of a trader is not a reliable indicator of their future results. You can lose some or all of the money you invest. Every trader profile shows maximum drawdown, risk score, and full trade history so you can judge for yourself — and our risk controls let you cap losses per copy relationship." },
  { q: "Which countries does Vanquish support?", a: "Vanquish is available across the UK, EEA, and 40+ additional markets, with product availability varying by local regulation. US availability is rolling out on a waitlist basis." },
  { q: "How do I become a lead trader?", a: "Any funded account with 12+ months of verified history can apply. We review consistency, risk management, and drawdown discipline — not just headline returns. Fewer than 5% of applicants are approved." },
];

export const jobs = [
  { title: "Senior Backend Engineer — Execution", team: "Engineering", location: "London · Hybrid" },
  { title: "Staff Product Designer", team: "Design", location: "London / Remote (EU)" },
  { title: "Quantitative Analyst — Trader Risk", team: "Risk", location: "London" },
  { title: "Head of Compliance, EEA", team: "Legal & Compliance", location: "Dublin" },
  { title: "iOS Engineer", team: "Engineering", location: "Remote (UK/EU)" },
  { title: "Growth Marketing Lead", team: "Marketing", location: "London · Hybrid" },
  { title: "Customer Operations Specialist (24/7)", team: "Operations", location: "Lisbon" },
  { title: "Site Reliability Engineer", team: "Engineering", location: "Remote (UK/EU)" },
];

export const posts = [
  { title: "Copy trading, explained in five minutes", tag: "Basics", read: "5 min", excerpt: "What actually happens in your account when you press Copy — allocation, proportionality, and the controls that keep you in charge." },
  { title: "How to read a trader's risk score", tag: "Risk", read: "7 min", excerpt: "Returns are the loudest number and the least useful one. Here's how drawdown, consistency, and exposure tell the real story." },
  { title: "Why we show every losing trade", tag: "Inside Vanquish", read: "4 min", excerpt: "Most platforms let traders bury their losses. We publish complete, unedited histories. Here's why that's non-negotiable." },
  { title: "Diversifying across traders, not just assets", tag: "Strategy", read: "6 min", excerpt: "Copying one brilliant trader is still concentration risk. How to build a portfolio of uncorrelated strategies." },
  { title: "The true cost of 'free' trading platforms", tag: "Transparency", read: "8 min", excerpt: "Payment for order flow, spread markups, idle-cash skimming — the fee structures nobody prints, and where we stand on each." },
  { title: "What it takes to become a Vanquish lead trader", tag: "Traders", read: "6 min", excerpt: "Under 5% of applicants make it. A look inside our vetting process: the metrics we screen, and the behavior that disqualifies." },
];

export const tickerItems = [
  { s: "AAPL", p: "234.18", d: +1.24 },
  { s: "NVDA", p: "182.44", d: +2.87 },
  { s: "BTC", p: "116,240", d: -0.62 },
  { s: "ETH", p: "4,411", d: +1.09 },
  { s: "TSLA", p: "421.66", d: -1.35 },
  { s: "SPX", p: "6,584", d: +0.41 },
  { s: "EUR/USD", p: "1.1742", d: +0.12 },
  { s: "GOLD", p: "3,644", d: +0.77 },
  { s: "MSFT", p: "509.90", d: +0.58 },
  { s: "AMZN", p: "228.15", d: -0.24 },
];
