import React, { useState } from "react";
import { Link, useRouter } from "./router";
import { tickerItems } from "./data";

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M3 5h7l6 14 6-14h7L17.5 29h-3L3 5z" fill="#00e07f" />
        <path d="M11.5 5h9L16 15.5 11.5 5z" fill="#f4f6f7" fillOpacity="0.92" />
      </svg>
      <span className="vq-display text-[1.15rem] font-semibold tracking-tight text-ink">
        VANQUISH
      </span>
    </span>
  );
}

const navLinks = [
  { to: "/traders", label: "Traders" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/markets", label: "Markets" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/learn", label: "Learn" },
];

export function Nav() {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-void/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm transition-colors ${
                path.startsWith(l.to) ? "text-ink" : "text-mist hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/support" className="text-sm text-mist hover:text-ink">
            Support
          </Link>
          <Link
            to="/download"
            className="rounded-full bg-signal px-5 py-2 text-sm font-semibold text-void transition hover:bg-signal-dim"
          >
            Get the app
          </Link>
        </div>
        <button
          className="text-mist lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-hairline bg-obsidian px-5 py-4 lg:hidden">
          {[...navLinks, { to: "/support", label: "Support" }, { to: "/download", label: "Get the app" }].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-base text-mist hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="overflow-hidden border-b border-hairline bg-obsidian">
      <div className="vq-ticker-track flex w-max gap-8 px-6 py-2.5">
        {items.map((t, i) => (
          <span key={i} className="vq-mono flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="text-faint">{t.s}</span>
            <span className="text-ink">{t.p}</span>
            <span className={t.d >= 0 ? "text-signal" : "text-loss"}>
              {t.d >= 0 ? "+" : ""}
              {t.d.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Sparkline({ data, up = true, w = 120, h = 36 }: { data: number[]; up?: boolean; w?: number; h?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`)
    .join(" ");
  const color = up ? "#00e07f" : "#ff4d5e";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.08" />
    </svg>
  );
}

export function RiskDots({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-1" title={`Risk ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= level ? (level >= 4 ? "bg-gold" : "bg-signal") : "bg-hairline-bright"
          }`}
        />
      ))}
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="vq-mono mb-4 text-[0.7rem] font-medium tracking-[0.25em] text-signal uppercase">
      {children}
    </p>
  );
}

export function CTA({ to, children, ghost = false }: { to: string; children: React.ReactNode; ghost?: boolean }) {
  return (
    <Link
      to={to}
      className={
        ghost
          ? "inline-flex items-center gap-2 rounded-full border border-hairline-bright px-7 py-3.5 text-sm font-semibold text-ink transition hover:border-mist"
          : "inline-flex items-center gap-2 rounded-full bg-signal px-7 py-3.5 text-sm font-semibold text-void transition hover:bg-signal-dim hover:shadow-[0_0_32px_rgba(0,224,127,0.35)]"
      }
    >
      {children}
    </Link>
  );
}

export function RiskBanner() {
  return (
    <div className="border-t border-hairline bg-obsidian px-5 py-4">
      <p className="mx-auto max-w-7xl text-xs leading-relaxed text-faint">
        <strong className="text-mist">Risk warning:</strong> Investing involves risk of loss. Copy
        trading does not amount to investment advice, and the past performance of any trader is not
        a reliable indicator of future results. The value of your investments can go down as well as
        up, and you may get back less than you invest. Crypto assets are unregulated in some
        jurisdictions and not covered by investor-protection schemes. See our{" "}
        <Link to="/legal/risk" className="underline hover:text-mist">full risk disclosure</Link>.
      </p>
    </div>
  );
}

const footerCols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Copy trading", to: "/how-it-works" },
      { label: "Top traders", to: "/traders" },
      { label: "Markets", to: "/markets" },
      { label: "Pricing", to: "/pricing" },
      { label: "Download", to: "/download" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Learn", to: "/learn" },
      { label: "Support", to: "/support" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", to: "/security" },
      { label: "Risk disclosure", to: "/legal/risk" },
      { label: "Terms of service", to: "/legal/terms" },
      { label: "Privacy policy", to: "/legal/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-void">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-faint">
            The copy trading platform for people who take investing seriously. Follow verified
            traders, keep full control, pay honest fees.
          </p>
          <p className="vq-mono mt-6 text-xs text-faint">London · Dublin · Lisbon</p>
        </div>
        {footerCols.map((c) => (
          <div key={c.title}>
            <p className="mb-4 text-sm font-semibold text-ink">{c.title}</p>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link to={l.to} className="text-sm text-faint transition hover:text-mist">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl border-t border-hairline px-5 py-8">
        <p className="text-xs leading-relaxed text-faint">
          Vanquish Markets Ltd is authorised and regulated in the jurisdictions in which it
          operates. Products and protections vary by region. Nothing on this site is investment
          advice or a recommendation to buy or sell any financial instrument.
        </p>
        <p className="mt-4 text-xs text-faint">© {new Date().getFullYear()} Vanquish Markets Ltd. All rights reserved.</p>
      </div>
      <RiskBanner />
    </footer>
  );
}

export function PageHero({ label, title, sub }: { label: string; title: React.ReactNode; sub?: string }) {
  return (
    <section className="vq-hero-fade border-b border-hairline px-5 pt-20 pb-16 text-center">
      <div className="mx-auto max-w-3xl">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="vq-display text-4xl font-semibold text-ink md:text-6xl">{title}</h1>
        {sub && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-mist">{sub}</p>}
      </div>
    </section>
  );
}
