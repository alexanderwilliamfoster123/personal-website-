import { useState } from "react";
import { CTA, PageHero, RiskDots, SectionLabel, Sparkline } from "../ui";
import { markets, plans, traders } from "../data";

/* ---------- Traders ---------- */

const filters = ["All", "Equities", "Crypto", "FX", "Options", "ETFs", "Commodities", "Indices"];

export function TradersPage() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"return" | "copiers" | "risk">("return");
  const list = traders
    .filter((t) => filter === "All" || t.markets.includes(filter))
    .sort((a, b) =>
      sort === "return" ? b.return12m - a.return12m : sort === "copiers" ? b.copiers - a.copiers : a.risk - b.risk,
    );
  return (
    <>
      <PageHero
        label="Leaderboard"
        title={<>2,300+ verified traders. Zero hidden losses.</>}
        sub="Every profile shows the full, unedited record — wins, losses, drawdowns, and risk. Filter by what matters to you."
      />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  filter === f
                    ? "border-signal bg-signal/10 text-signal"
                    : "border-hairline text-mist hover:border-hairline-bright hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-hairline bg-panel px-3 py-2 text-sm text-mist"
          >
            <option value="return">Sort: 12M return</option>
            <option value="copiers">Sort: Most copied</option>
            <option value="risk">Sort: Lowest risk</option>
          </select>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((t) => (
            <div key={t.handle} className="vq-card grid gap-6 p-7 sm:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="vq-display flex h-11 w-11 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-signal">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">
                      @{t.handle} <span className="ml-1 font-normal text-faint">· {t.name}</span>
                    </p>
                    <p className="text-xs text-faint">{t.strategy}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                  <div>
                    <p className="vq-mono text-lg font-semibold text-signal">+{t.return12m}%</p>
                    <p className="text-xs text-faint">12M return</p>
                  </div>
                  <div>
                    <p className="vq-mono text-lg font-semibold text-ink">{t.winRate}%</p>
                    <p className="text-xs text-faint">Win rate</p>
                  </div>
                  <div>
                    <p className="vq-mono text-lg font-semibold text-ink">{t.copiers.toLocaleString()}</p>
                    <p className="text-xs text-faint">Copiers</p>
                  </div>
                  <div>
                    <p className="vq-mono text-lg font-semibold text-ink">{t.aum}</p>
                    <p className="text-xs text-faint">Copied AUM</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <RiskDots level={t.risk} />
                  <span className="text-xs text-faint">Risk {t.risk}/5</span>
                  {t.markets.map((m) => (
                    <span key={m} className="rounded-full bg-elevated px-2.5 py-0.5 text-xs text-mist">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end justify-between gap-4">
                <Sparkline data={t.spark} w={150} h={48} />
                <span className="rounded-full bg-signal px-6 py-2.5 text-sm font-semibold text-void">
                  Copy
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs leading-relaxed text-faint">
          Returns are trailing 12-month figures net of fees, calculated using time-weighted
          methodology and independently audited quarterly. Past performance is not a reliable
          indicator of future results. Capital at risk.
        </p>
        <div className="mt-14 rounded-2xl border border-signal-deep bg-signal/5 p-10 text-center">
          <h3 className="vq-display text-2xl font-semibold text-ink">Think you belong up here?</h3>
          <p className="mx-auto mt-3 max-w-xl text-mist">
            Lead traders on Vanquish earn performance-based payouts funded by us — not skimmed from
            their copiers. 12+ months of verified history required. Fewer than 5% are approved.
          </p>
          <div className="mt-7">
            <CTA to="/support">Apply to become a lead trader</CTA>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- How it works ---------- */

const mechanics = [
  {
    t: "Proportional mirroring",
    d: "Allocate $2,000 to a trader managing $200,000 and every position they take is replicated at 1% of their size in your account. Fractional shares mean the math always works, even on a $500 allocation.",
  },
  {
    t: "Millisecond execution",
    d: "When a lead trader's order fills, copy orders route within milliseconds through the same execution venues. Slippage between lead and copier fills is monitored, published, and averaged under 0.04% last quarter.",
  },
  {
    t: "Your account, your custody",
    d: "Copying is an instruction layer, not a transfer. Your funds stay in your own segregated account at all times. Traders you copy never see, touch, or hold your money.",
  },
  {
    t: "Loss caps & stop-copy",
    d: "Set a maximum loss per copy relationship — say, 15% of your allocation. If it's hit, we stop copying and close the mirrored positions automatically. You can also pause or exit manually at any moment, instantly.",
  },
  {
    t: "Drawdown alerts",
    d: "If a trader you copy exceeds their historical maximum drawdown or shifts strategy (new asset classes, larger position sizing), you get an alert before it compounds — with one-tap options to reduce or exit.",
  },
  {
    t: "Copy-portfolio view",
    d: "See all your copy relationships as one portfolio: blended return, correlation between traders, and aggregate exposure by asset, sector, and currency. Diversify across strategies, not just tickers.",
  },
];

export function HowItWorksPage() {
  return (
    <>
      <PageHero
        label="How it works"
        title="Copy trading without the black box"
        sub="Most platforms hide the mechanics. We publish them. Here is exactly what happens when you copy a trader on Vanquish."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mechanics.map((m, i) => (
            <div key={m.t} className="vq-card p-8">
              <p className="vq-mono text-sm text-signal">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="vq-display mt-3 text-xl font-semibold text-ink">{m.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{m.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="vq-card p-10">
            <SectionLabel>For copiers</SectionLabel>
            <h3 className="vq-display text-2xl font-semibold text-ink">Start with $100 or $100,000</h3>
            <p className="mt-4 leading-relaxed text-mist">
              Copy up to 3 traders free on Standard, or 15 on Premium. Every trader page shows the
              minimum allocation their strategy supports, so you always know before you commit.
            </p>
            <div className="mt-7"><CTA to="/download">Open an account</CTA></div>
          </div>
          <div className="vq-card p-10">
            <SectionLabel>For traders</SectionLabel>
            <h3 className="vq-display text-2xl font-semibold text-ink">Get paid for being good</h3>
            <p className="mt-4 leading-relaxed text-mist">
              Approved lead traders earn tiered performance payouts on the profit they generate for
              copiers, plus a per-copier platform bonus at scale. Top traders on Vanquish earn
              six figures a year from copying alone.
            </p>
            <div className="mt-7"><CTA to="/traders" ghost>See the leaderboard</CTA></div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Markets ---------- */

export function MarketsPage() {
  return (
    <>
      <PageHero
        label="Markets"
        title="7,600+ instruments. One account."
        sub="Copy traders across asset classes, or trade them yourself — commission-free stocks and ETFs, institutional FX spreads, and cold-storage crypto."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((m) => (
            <div key={m.name} className="vq-card p-8">
              <div className="flex items-baseline justify-between">
                <h3 className="vq-display text-xl font-semibold text-ink">{m.name}</h3>
                <span className="vq-mono text-xs text-signal">{m.count}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mist">{m.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs leading-relaxed text-faint">
          Instrument availability varies by jurisdiction and account type. CFDs are complex
          instruments and come with a high risk of losing money rapidly due to leverage; they are
          not available in all regions. Crypto assets are unregulated in some jurisdictions and not
          covered by investor-protection schemes.
        </p>
        <div className="mt-14 text-center">
          <CTA to="/download">Explore markets in the app</CTA>
        </div>
      </section>
    </>
  );
}

/* ---------- Pricing ---------- */

const feeRows = [
  ["US stocks & ETFs", "$0 commission"],
  ["Copy trading (Standard)", "No platform markup"],
  ["Crypto", "0.45% per side, all-in"],
  ["FX conversion", "0.15% over interbank"],
  ["Options", "$0.35 per contract"],
  ["Deposits & withdrawals", "Free (bank transfer)"],
  ["Uninvested cash", "Earns 4.1% APY (Premium)"],
  ["Inactivity, custody, data fees", "None. Ever."],
];

export function PricingPage() {
  return (
    <>
      <PageHero
        label="Pricing"
        title="Every fee, on one page"
        sub="No payment for order flow. No spread games. No fees invented to be forgotten. If it's not on this page, we don't charge it."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`vq-card relative p-9 ${p.featured ? "border-signal/60 shadow-[0_0_60px_rgba(0,224,127,0.12)]" : ""}`}
            >
              {p.featured && (
                <span className="vq-mono absolute -top-3 left-8 rounded-full bg-signal px-3 py-1 text-[0.65rem] font-semibold tracking-widest text-void uppercase">
                  Most popular
                </span>
              )}
              <h3 className="vq-display text-xl font-semibold text-ink">{p.name}</h3>
              <p className="mt-4">
                <span className="vq-display text-4xl font-semibold text-ink">{p.price}</span>
                <span className="text-mist">{p.period}</span>
              </p>
              <p className="mt-2 text-sm text-mist">{p.tagline}</p>
              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-mist">
                    <span className="mt-0.5 text-signal">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <CTA to="/download" ghost={!p.featured}>{p.cta}</CTA>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <SectionLabel>Fee schedule</SectionLabel>
          <h2 className="vq-display text-3xl font-semibold text-ink">The complete list</h2>
          <div className="vq-card mt-8 overflow-hidden !p-0">
            {feeRows.map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-center justify-between px-7 py-4 ${i > 0 ? "border-t border-hairline" : ""}`}
              >
                <span className="text-sm text-mist">{k}</span>
                <span className="vq-mono text-sm text-ink">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-faint">
            Regulatory and exchange pass-through fees (e.g. SEC/TAF on US sales) are charged at cost
            and itemized on every confirmation. APY is variable, accrues daily, and is paid monthly
            on eligible cash balances. Rates correct as of September 2026.
          </p>
        </div>
      </section>
    </>
  );
}

/* ---------- Security ---------- */

const securityItems = [
  { t: "Segregated client accounts", d: "Your cash and securities are held with tier-1 custodian banks, legally separate from Vanquish's own assets. If Vanquish failed, your assets remain yours." },
  { t: "Investor protection schemes", d: "Securities accounts are covered by the applicable protection scheme in your region (e.g. FSCS in the UK up to £85,000). Protection covers firm failure, not market losses." },
  { t: "1:1 cold-storage crypto", d: "Crypto is held fully backed, 1:1, with the majority in institutionally insured cold storage. We never lend, stake, or rehypothecate client crypto." },
  { t: "Bank-grade encryption", d: "TLS 1.3 in transit, AES-256 at rest, and hardware security modules for key management. Annual penetration testing by independent firms." },
  { t: "Account hardening", d: "Mandatory two-factor authentication, biometric app lock, device binding, and withdrawal address allow-listing with 24-hour cooling periods on changes." },
  { t: "24/7 fraud monitoring", d: "Real-time anomaly detection on every login and withdrawal, backed by a human fraud desk that never sleeps. Guaranteed reimbursement for verified unauthorized activity." },
  { t: "Independent audits", d: "Annual financial audits by a Big Four firm, SOC 2 Type II certification, and quarterly third-party attestation of crypto reserves — all reports published." },
  { t: "Regulatory oversight", d: "Vanquish entities are authorised and regulated in each operating jurisdiction, with capital held well above regulatory minimums." },
];

export function SecurityPage() {
  return (
    <>
      <PageHero
        label="Security"
        title="Paranoid, by design"
        sub="You're trusting us with your money. Here is exactly how we protect it — and the receipts to prove it."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {securityItems.map((s) => (
            <div key={s.t} className="vq-card p-8">
              <h3 className="vq-display text-lg font-semibold text-ink">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 rounded-2xl border border-hairline bg-obsidian p-10 text-center">
          <h3 className="vq-display text-2xl font-semibold text-ink">Found a vulnerability?</h3>
          <p className="mx-auto mt-3 max-w-xl text-mist">
            Our bug bounty program pays up to $250,000 for critical findings. Responsible
            disclosure: security@vanquish.so
          </p>
        </div>
      </section>
    </>
  );
}
