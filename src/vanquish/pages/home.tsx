import { Link } from "../router";
import { CTA, RiskDots, SectionLabel, Sparkline, Ticker } from "../ui";
import { Hero3D } from "../hero3d";
import { traders, posts } from "../data";

const stats = [
  { v: "$1.4B+", l: "Assets on platform" },
  { v: "620K+", l: "Funded accounts" },
  { v: "2,300+", l: "Verified lead traders" },
  { v: "48", l: "Countries served" },
];

const steps = [
  {
    n: "01",
    t: "Find your trader",
    d: "Filter 2,300+ verified traders by strategy, risk score, drawdown, and consistency — every stat audited, every losing trade published.",
  },
  {
    n: "02",
    t: "Set your terms",
    d: "Choose how much to allocate, cap your maximum loss, and set stop-copy rules. Your money never leaves your account.",
  },
  {
    n: "03",
    t: "Copy in real time",
    d: "Every trade mirrors into your account proportionally, in milliseconds. Pause, adjust, or exit whenever you want.",
  },
];

const pillars = [
  {
    t: "Radical transparency",
    d: "Complete, unedited trade histories on every trader. Max drawdown front and center. No cherry-picked screenshots, ever.",
  },
  {
    t: "Risk controls that bite",
    d: "Per-trader loss caps, drawdown alerts, and instant stop-copy. You decide your worst case before you invest a cent.",
  },
  {
    t: "Aligned incentives",
    d: "Lead traders earn from performance we pay them — not from spreads or fees skimmed off your account.",
  },
  {
    t: "Honest pricing",
    d: "Commission-free stocks and ETFs, a published fee schedule, and 4.1% APY on uninvested cash. No payment for order flow.",
  },
];

export function HomePage() {
  const top = traders.slice(0, 4);
  return (
    <>
      <Ticker />

      {/* Hero */}
      <section className="vq-grid-bg relative overflow-hidden border-b border-hairline">
        <div className="vq-hero-fade absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pt-16 pb-20 lg:grid-cols-2 lg:pt-24">
          <div>
            <p className="vq-rise vq-mono mb-6 inline-flex items-center gap-2 rounded-full border border-hairline-bright px-4 py-1.5 text-xs text-mist">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
              Live · $1.4B+ copied on Vanquish
            </p>
            <h1 className="vq-rise vq-rise-1 vq-display text-5xl leading-[1.02] font-semibold text-ink md:text-7xl">
              Trade like the
              <br />
              top <span className="vq-glow text-signal">1%</span>.
              <br />
              Automatically.
            </h1>
            <p className="vq-rise vq-rise-2 mt-7 max-w-lg text-lg leading-relaxed text-mist">
              Vanquish is the copy trading platform built on radical transparency. Follow verified
              traders with audited track records, mirror their every move in real time, and stay in
              full control of your money.
            </p>
            <div className="vq-rise vq-rise-3 mt-9 flex flex-wrap items-center gap-4">
              <CTA to="/download">Start investing</CTA>
              <CTA to="/traders" ghost>
                Browse top traders
              </CTA>
            </div>
            <p className="vq-rise vq-rise-3 mt-6 text-xs text-faint">
              Capital at risk. Fractional shares from $1. No commission on stocks &amp; ETFs.
            </p>
          </div>
          <div className="h-[380px] md:h-[520px]">
            <Hero3D />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-hairline bg-obsidian">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="px-6 py-10 text-center">
              <p className="vq-display text-3xl font-semibold text-ink md:text-4xl">{s.v}</p>
              <p className="mt-2 text-sm text-faint">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top traders */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>Leaderboard</SectionLabel>
            <h2 className="vq-display text-3xl font-semibold text-ink md:text-5xl">
              Traders worth following
            </h2>
          </div>
          <Link to="/traders" className="text-sm font-semibold text-signal hover:text-signal-dim">
            View all 2,300+ traders →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {top.map((t) => (
            <Link key={t.handle} to="/traders" className="vq-card block p-6 transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink">@{t.handle}</p>
                  <p className="mt-0.5 text-xs text-faint">{t.strategy}</p>
                </div>
                <RiskDots level={t.risk} />
              </div>
              <div className="mt-5">
                <Sparkline data={t.spark} />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="vq-mono text-2xl font-semibold text-signal">+{t.return12m}%</p>
                  <p className="text-xs text-faint">12-month return</p>
                </div>
                <div className="text-right">
                  <p className="vq-mono text-sm text-ink">{t.copiers.toLocaleString()}</p>
                  <p className="text-xs text-faint">copiers</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs text-faint">
          Figures shown are historical returns of real strategies over the trailing 12 months, net
          of fees. Past performance is not a reliable indicator of future results.
        </p>
      </section>

      {/* How it works */}
      <section className="border-y border-hairline bg-obsidian px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="vq-display max-w-xl text-3xl font-semibold text-ink md:text-5xl">
            From zero to copying in under five minutes
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="vq-mono text-sm text-signal">{s.n}</p>
                <h3 className="vq-display mt-3 text-xl font-semibold text-ink">{s.t}</h3>
                <p className="mt-3 leading-relaxed text-mist">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <CTA to="/how-it-works" ghost>
              See the full mechanics
            </CTA>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <SectionLabel>Why Vanquish</SectionLabel>
        <h2 className="vq-display max-w-2xl text-3xl font-semibold text-ink md:text-5xl">
          Built for people who read the fine print
        </h2>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.t} className="vq-card p-8">
              <h3 className="vq-display text-xl font-semibold text-ink">{p.t}</h3>
              <p className="mt-3 leading-relaxed text-mist">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learn preview */}
      <section className="border-t border-hairline bg-obsidian px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel>Learn</SectionLabel>
              <h2 className="vq-display text-3xl font-semibold text-ink md:text-5xl">
                Sharper every week
              </h2>
            </div>
            <Link to="/learn" className="text-sm font-semibold text-signal hover:text-signal-dim">
              All articles →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <Link key={p.title} to="/learn" className="vq-card block p-7 transition">
                <p className="vq-mono text-xs text-signal">{p.tag} · {p.read}</p>
                <h3 className="vq-display mt-3 text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="vq-hero-fade px-5 py-28 text-center">
        <h2 className="vq-display mx-auto max-w-2xl text-4xl font-semibold text-ink md:text-6xl">
          Your edge is one tap away
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Join 620,000+ investors copying verified traders on Vanquish.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <CTA to="/download">Get the app</CTA>
          <CTA to="/pricing" ghost>
            See pricing
          </CTA>
        </div>
      </section>
    </>
  );
}
