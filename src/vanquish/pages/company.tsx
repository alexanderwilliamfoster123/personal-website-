import { useState } from "react";
import { PageHero, SectionLabel } from "../ui";
import { faqs, jobs, posts } from "../data";

/* ---------- About ---------- */

const values = [
  { t: "Transparency is the product", d: "We publish trader losses, slippage stats, fee schedules, and audit reports. If we wouldn't show it, we shouldn't do it." },
  { t: "The copier comes first", d: "Every incentive on the platform is designed so traders win only when their copiers win. No conflict, no fine print." },
  { t: "Boring where it counts", d: "We're aggressive about product and conservative about custody, capital, and compliance. That order is deliberate." },
  { t: "Earn trust, then scale", d: "620,000 accounts came from doing right by the first thousand. We'd rather grow slower than grow careless." },
];

const timeline = [
  { y: "2021", e: "Founded in London by traders tired of platforms that hid the downside." },
  { y: "2022", e: "FCA authorisation. First 10,000 funded accounts. Copy engine v1 ships." },
  { y: "2023", e: "EEA launch via Dublin entity. $100M copied. Series A led by top-tier fintech investors." },
  { y: "2024", e: "Crypto custody with quarterly attestations. 100,000 accounts. Series B." },
  { y: "2025", e: "$1B in assets on platform. 2,000+ verified lead traders. Lisbon operations hub opens." },
  { y: "2026", e: "620,000+ accounts across 48 countries. US waitlist opens." },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        label="About"
        title="We started Vanquish because we were the customers"
        sub="Three traders, one conviction: retail investors deserve the transparency institutions demand. Everything else follows from that."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionLabel>The story</SectionLabel>
            <div className="space-y-5 text-lg leading-relaxed text-mist">
              <p>
                In 2021, copy trading had a reputation problem — and it had earned it. Platforms
                promoted traders on cherry-picked screenshots, buried losses, and made their real
                money on spreads their users never saw.
              </p>
              <p>
                We believed the idea was right and the execution was rotten. Following a genuinely
                skilled trader, with full visibility into their record and hard limits on your
                downside, is one of the most sensible ways for a busy person to invest. So we built
                the platform we wanted to use: audited track records, published slippage, honest
                fees, and risk controls with teeth.
              </p>
              <p>
                Five years later, more than $1.4 billion sits on Vanquish, and the principle hasn't
                moved an inch: if a number matters to your decision, you'll find it on the page —
                especially when it's a number that makes us look worse.
              </p>
            </div>
          </div>
          <div>
            <SectionLabel>Milestones</SectionLabel>
            <div className="space-y-6 border-l border-hairline pl-6">
              {timeline.map((t) => (
                <div key={t.y}>
                  <p className="vq-mono text-sm text-signal">{t.y}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{t.e}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-20">
          <SectionLabel>What we believe</SectionLabel>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {values.map((v) => (
              <div key={v.t} className="vq-card p-8">
                <h3 className="vq-display text-lg font-semibold text-ink">{v.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Careers ---------- */

export function CareersPage() {
  return (
    <>
      <PageHero
        label="Careers"
        title="Do the best work of your career on the hardest problems in retail finance"
        sub="180 people across London, Dublin, and Lisbon. Real ownership, honest pay, and a product your friends actually use."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-14 grid gap-4 md:grid-cols-3">
          {[
            { t: "Equity for everyone", d: "Every full-time employee holds meaningful options. When Vanquish wins, everyone wins." },
            { t: "Hybrid, humanely", d: "Two office days a week in hub cities, fully remote roles where noted, and a home-office budget that isn't symbolic." },
            { t: "Ship weekly", d: "Small teams with end-to-end ownership. Your work reaches 620,000 investors days after it merges, not quarters." },
          ].map((b) => (
            <div key={b.t} className="vq-card p-8">
              <h3 className="vq-display text-lg font-semibold text-ink">{b.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{b.d}</p>
            </div>
          ))}
        </div>
        <SectionLabel>Open roles</SectionLabel>
        <div className="vq-card overflow-hidden !p-0">
          {jobs.map((j, i) => (
            <div
              key={j.title}
              className={`flex flex-wrap items-center justify-between gap-3 px-7 py-5 transition hover:bg-elevated ${i > 0 ? "border-t border-hairline" : ""}`}
            >
              <div>
                <p className="font-semibold text-ink">{j.title}</p>
                <p className="mt-0.5 text-sm text-faint">{j.team} · {j.location}</p>
              </div>
              <span className="text-sm font-semibold text-signal">Apply →</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-mist">
          Nothing that fits? Write to <span className="text-signal">talent@vanquish.so</span> — we
          read everything.
        </p>
      </section>
    </>
  );
}

/* ---------- Learn ---------- */

export function LearnPage() {
  return (
    <>
      <PageHero
        label="Learn"
        title="Invest smarter, not louder"
        sub="Plain-English guides from the Vanquish research desk. No hype, no signals, no 'one weird trick'."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.title} className="vq-card flex flex-col p-8 transition">
              <p className="vq-mono text-xs text-signal">{p.tag} · {p.read} read</p>
              <h3 className="vq-display mt-3 text-xl font-semibold text-ink">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{p.excerpt}</p>
              <p className="mt-5 text-sm font-semibold text-signal">Read article →</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------- Support / FAQ ---------- */

export function SupportPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <>
      <PageHero
        label="Support"
        title="Answers first, tickets second"
        sub="24/7 human support in 12 languages. Median first response: 90 seconds in-app."
      />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <SectionLabel>Frequently asked</SectionLabel>
        <div className="vq-card overflow-hidden !p-0">
          {faqs.map((f, i) => (
            <div key={f.q} className={i > 0 ? "border-t border-hairline" : ""}>
              <button
                className="flex w-full items-center justify-between px-7 py-5 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-semibold text-ink">{f.q}</span>
                <span className="text-signal">{openIdx === i ? "−" : "+"}</span>
              </button>
              {openIdx === i && (
                <p className="px-7 pb-6 text-sm leading-relaxed text-mist">{f.a}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { t: "In-app chat", d: "24/7 · fastest", c: "Open the app" },
            { t: "Email", d: "support@vanquish.so", c: "~2h response" },
            { t: "Trader desk", d: "For lead traders", c: "traders@vanquish.so" },
          ].map((c) => (
            <div key={c.t} className="vq-card p-7 text-center">
              <p className="vq-display font-semibold text-ink">{c.t}</p>
              <p className="mt-2 text-sm text-signal">{c.d}</p>
              <p className="mt-1 text-xs text-faint">{c.c}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------- Download ---------- */

export function DownloadPage() {
  return (
    <>
      <PageHero
        label="Get Vanquish"
        title="One app. Every market. Full control."
        sub="iOS, Android, and web. Open an account in minutes — most users are verified and funded the same day."
      />
      <section className="mx-auto max-w-5xl px-5 py-16 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          {["Download for iOS", "Download for Android", "Launch web app"].map((l, i) => (
            <span
              key={l}
              className={
                i < 2
                  ? "inline-flex cursor-pointer items-center rounded-full bg-signal px-8 py-4 text-sm font-semibold text-void transition hover:bg-signal-dim"
                  : "inline-flex cursor-pointer items-center rounded-full border border-hairline-bright px-8 py-4 text-sm font-semibold text-ink hover:border-mist"
              }
            >
              {l}
            </span>
          ))}
        </div>
        <div className="mx-auto mt-16 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
          {[
            { n: "1", t: "Verify", d: "Photo ID + a selfie. Median approval: 4 minutes." },
            { n: "2", t: "Fund", d: "Instant bank transfer, card, or Apple/Google Pay. From $10." },
            { n: "3", t: "Copy", d: "Pick a trader, set your limits, and you're live." },
          ].map((s) => (
            <div key={s.n} className="vq-card p-7">
              <p className="vq-mono text-sm text-signal">{s.n}</p>
              <p className="vq-display mt-2 font-semibold text-ink">{s.t}</p>
              <p className="mt-2 text-sm text-mist">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-faint">
          4.8★ average across 90,000+ App Store and Play Store reviews. Capital at risk.
        </p>
      </section>
    </>
  );
}

/* ---------- Legal ---------- */

function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero label="Legal" title={title} sub={`Last updated: ${updated}`} />
      <section className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-[0.95rem] leading-relaxed text-mist">
        {children}
      </section>
    </>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms of service" updated="1 September 2026">
      <p><strong className="text-ink">1. Who we are.</strong> These terms govern your use of the Vanquish platform, operated by Vanquish Markets Ltd and its regulated affiliates ("Vanquish", "we"). By opening an account you agree to these terms, our order execution policy, and the fee schedule published on our Pricing page.</p>
      <p><strong className="text-ink">2. Eligibility.</strong> You must be 18 or over, resident in a supported jurisdiction, and pass identity and appropriateness checks. We may decline or close accounts to meet our legal obligations.</p>
      <p><strong className="text-ink">3. Nature of the service.</strong> Vanquish provides execution-only brokerage and a copy trading facility. We do not provide investment advice. Copying a trader is your decision, made on information we present without endorsement of any trader's future performance.</p>
      <p><strong className="text-ink">4. Copy trading.</strong> When you copy a trader, you authorise us to replicate their orders in your account proportionally to your allocation, subject to the limits and controls you set. You may pause or terminate copying at any time; termination options include closing mirrored positions at prevailing market prices.</p>
      <p><strong className="text-ink">5. Fees.</strong> All charges are listed on the Pricing page. We will give 30 days' notice of fee changes that affect you adversely.</p>
      <p><strong className="text-ink">6. Risk.</strong> Investing puts your capital at risk. You may lose more than you expect, and copy trading can amplify losses when a copied trader performs poorly. Read the Risk Disclosure before trading.</p>
      <p><strong className="text-ink">7. Acceptable use.</strong> You may not use the platform for market abuse, money laundering, or to circumvent copy limits. Lead traders must comply with the Lead Trader Agreement, including position-disclosure and strategy-consistency obligations.</p>
      <p><strong className="text-ink">8. Liability.</strong> Nothing in these terms excludes liability we cannot lawfully exclude. We are not liable for losses from market movements, the performance of traders you choose to copy, or events beyond our reasonable control.</p>
      <p><strong className="text-ink">9. Complaints & disputes.</strong> Contact complaints@vanquish.so. If you are unhappy with our final response, you may be entitled to refer the matter to the ombudsman or dispute-resolution scheme in your jurisdiction.</p>
      <p><strong className="text-ink">10. Changes & termination.</strong> We may update these terms with notice. You may close your account at any time; obligations relating to open positions and settled activity survive closure.</p>
    </LegalShell>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy policy" updated="1 September 2026">
      <p><strong className="text-ink">1. Data we collect.</strong> Identity and contact details, verification documents, financial information you provide, transaction and copy-trading activity, device and usage data, and communications with support.</p>
      <p><strong className="text-ink">2. Why we process it.</strong> To provide brokerage and copy trading services, meet legal obligations (KYC/AML, transaction reporting), keep your account secure, improve the product, and — only with your consent — send marketing.</p>
      <p><strong className="text-ink">3. Legal bases.</strong> Performance of contract, legal obligation, legitimate interests (fraud prevention, product analytics), and consent where required.</p>
      <p><strong className="text-ink">4. Sharing.</strong> With custodians, execution venues, payment providers, identity-verification partners, auditors, and regulators — under contract or legal duty. We never sell personal data.</p>
      <p><strong className="text-ink">5. Public profile data.</strong> If you become a lead trader, your handle, strategy statistics, and trade history are public by design. Copiers' identities are never public.</p>
      <p><strong className="text-ink">6. Retention.</strong> Account records are kept for the periods financial regulation requires (typically 5–7 years after closure), then deleted or irreversibly anonymised.</p>
      <p><strong className="text-ink">7. Your rights.</strong> Access, rectification, erasure, restriction, portability, and objection, subject to regulatory limits. Contact privacy@vanquish.so or our Data Protection Officer at the same address.</p>
      <p><strong className="text-ink">8. International transfers.</strong> Where data leaves your region, we use recognised safeguards such as standard contractual clauses.</p>
      <p><strong className="text-ink">9. Complaints.</strong> You may complain to your data-protection authority (in the UK, the ICO) at any time.</p>
    </LegalShell>
  );
}

export function RiskPage() {
  return (
    <LegalShell title="Risk disclosure" updated="1 September 2026">
      <p><strong className="text-ink">General.</strong> The value of investments can fall as well as rise, and you may get back less than you invest. Nothing on Vanquish is investment advice or a personal recommendation.</p>
      <p><strong className="text-ink">Copy trading risk.</strong> Copying a trader means your account will replicate their losses as well as their gains. Published statistics, including returns, win rates, and risk scores, describe the past; they are not a reliable indicator of future results. A trader may change strategy, take larger risks, or perform worse than their history suggests. Loss caps and stop-copy rules reduce, but do not eliminate, these risks — in fast markets, exits may occur at worse prices than your configured limits.</p>
      <p><strong className="text-ink">Execution risk.</strong> Copy orders are placed after the lead trader's orders and may fill at different prices (slippage), particularly in volatile or illiquid markets.</p>
      <p><strong className="text-ink">Crypto risk.</strong> Crypto assets are highly volatile and, in some jurisdictions, unregulated and outside investor-protection schemes. You could lose the entire amount invested.</p>
      <p><strong className="text-ink">CFD & leverage risk.</strong> CFDs are complex instruments with a high risk of losing money rapidly due to leverage. The majority of retail investor accounts lose money when trading CFDs. Only trade them if you understand how they work and can afford the risk.</p>
      <p><strong className="text-ink">Currency risk.</strong> Investing in instruments denominated in a currency other than your own exposes you to exchange-rate movements in addition to market movements.</p>
      <p><strong className="text-ink">Protection schemes.</strong> Investor-protection and deposit-guarantee schemes protect against firm failure within their limits. They never protect against investment losses.</p>
      <p><strong className="text-ink">Suitability.</strong> Only invest money you can afford to lose, and consider seeking independent financial advice if you are unsure whether copy trading is appropriate for your circumstances.</p>
    </LegalShell>
  );
}
