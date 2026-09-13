import { useEffect } from "react";
import { RouterProvider, useRouter } from "./router";
import { Footer, Nav } from "./ui";
import { HomePage } from "./pages/home";
import { HowItWorksPage, MarketsPage, PricingPage, SecurityPage, TradersPage } from "./pages/product";
import {
  AboutPage,
  CareersPage,
  DownloadPage,
  LearnPage,
  PrivacyPage,
  RiskPage,
  SupportPage,
  TermsPage,
} from "./pages/company";

const routes: Record<string, { title: string; el: () => JSX.Element }> = {
  "/": { title: "Vanquish — Copy the top 1% of traders", el: HomePage },
  "/traders": { title: "Top Traders — Vanquish", el: TradersPage },
  "/how-it-works": { title: "How Copy Trading Works — Vanquish", el: HowItWorksPage },
  "/markets": { title: "Markets — Vanquish", el: MarketsPage },
  "/pricing": { title: "Pricing — Vanquish", el: PricingPage },
  "/security": { title: "Security — Vanquish", el: SecurityPage },
  "/about": { title: "About — Vanquish", el: AboutPage },
  "/careers": { title: "Careers — Vanquish", el: CareersPage },
  "/learn": { title: "Learn — Vanquish", el: LearnPage },
  "/support": { title: "Support — Vanquish", el: SupportPage },
  "/download": { title: "Get the App — Vanquish", el: DownloadPage },
  "/legal/terms": { title: "Terms of Service — Vanquish", el: TermsPage },
  "/legal/privacy": { title: "Privacy Policy — Vanquish", el: PrivacyPage },
  "/legal/risk": { title: "Risk Disclosure — Vanquish", el: RiskPage },
};

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 text-center">
      <p className="vq-mono text-sm text-signal">404</p>
      <h1 className="vq-display mt-3 text-4xl font-semibold text-ink">This chart went flat</h1>
      <p className="mt-4 text-mist">The page you're looking for doesn't exist.</p>
    </div>
  );
}

function Routed() {
  const { path } = useRouter();
  const route = routes[path];
  useEffect(() => {
    document.title = route?.title ?? "Vanquish";
  }, [route]);
  const Page = route?.el ?? NotFound;
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Page />
      </main>
      <Footer />
    </div>
  );
}

export default function VanquishApp() {
  return (
    <RouterProvider>
      <Routed />
    </RouterProvider>
  );
}
