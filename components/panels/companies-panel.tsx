"use client";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Company } from "@/components/circular-company-scroll";
import NewsletterInternalView from "@/components/newsletter-internal-view";
import SnapCardCarousel from "@/components/snap-card-carousel";
import { companyProfiles, foundedCompanies, investedCompanies } from "@/lib/companies";
import { useMediaQuery } from "@/lib/use-media-query";
import { FiArrowUpRight } from "react-icons/fi";
const CompanyCardScroll = lazy(() => import("@/components/circular-company-scroll"));
export default function CompaniesPanel({ registerBackAction }: { registerBackAction?: (action: (() => void) | null) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [foundedIndex, setFoundedIndex] = useState(0);
  const listScroll = useRef(0);
  // Touch screens use the same scroll-driven wheel as desktop.
  const nativeCards = useMediaQuery("(prefers-reduced-motion: reduce)");
  const selected = companyProfiles.find(company => company.id === selectedId);
  useEffect(() => {
    const restoreHistory = () => {
      const state = window.history.state;
      setSelectedId(state?.spaTab === "companies" ? state.companyArticleId || null : null);
    };
    restoreHistory();
    window.addEventListener("popstate", restoreHistory);
    return () => window.removeEventListener("popstate", restoreHistory);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => window.scrollTo({ top: selectedId ? 0 : listScroll.current, behavior: "instant" }), 100);
    return () => clearTimeout(timer);
  }, [selectedId, nativeCards]);
  const returnToCompanies = useCallback(() => {
    setSelectedId(null);
    window.history.replaceState({ spaTab: "companies" }, "");
  }, []);
  useEffect(() => {
    registerBackAction?.(selectedId ? returnToCompanies : null);
    return () => registerBackAction?.(null);
  }, [registerBackAction, returnToCompanies, selectedId]);
  const openCompany = (company: Company) => {
    if (!company.id) return;
    listScroll.current = window.scrollY;
    setSelectedId(company.id);
    window.history.pushState({ spaTab: "companies", companyArticleId: company.id }, "");
  };
  if (selected) return <NewsletterInternalView key={selected.id} article={selected.article} onBack={returnToCompanies} cta={{label: `Visit ${selected.name}`, href:selected.website}} />;
  if (nativeCards) return <main className="companies-mobile">
    <section aria-labelledby="founded-heading">
      <h1 id="founded-heading" className="collection-heading">founded.</h1>
      <SnapCardCarousel label="Founded" itemLabels={foundedCompanies.map(c=>c.name)} initialIndex={foundedIndex} onIndexChange={setFoundedIndex}>
        {foundedCompanies.map(company=><button key={company.id} type="button" className="company-card-surface company-card" onClick={()=>openCompany(company)} aria-label={`Read about ${company.name}`}>
          <span className="card-number">{company.number}</span>
          <span className="card-caption"><span>{company.name}</span><FiArrowUpRight aria-hidden="true" /></span>
        </button>)}
      </SnapCardCarousel>
    </section>
    <section aria-labelledby="invested-heading" className="invested-section">
      <h2 id="invested-heading" className="collection-heading">invested.</h2>
      <SnapCardCarousel label="Invested" itemLabels={investedCompanies.map(c=>c.name)}>
        {investedCompanies.map(company=><button key={company.id} type="button" className="company-card-surface company-card" onClick={()=>openCompany(company)} aria-label={`Read about ${company.name}`}>
          <span className="card-number">{company.number}</span>
          <span className="card-caption"><span>{company.name}</span><FiArrowUpRight aria-hidden="true" /></span>
        </button>)}
      </SnapCardCarousel>
    </section>
  </main>;
  return <Suspense fallback={<div className="min-h-dvh" />}><section className="company-collection w-full" style={{fontFamily:'"Neue Montreal", sans-serif'}}>
    <div className="company-collection-intro relative w-full"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.8,ease:[.16,1,.3,1]}} className="absolute top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[13px] font-medium" style={{color:"var(--text-primary)"}}><h1 className="font-medium">founded.</h1></motion.div></div>
    <CompanyCardScroll companies={foundedCompanies} onSelectCompany={openCompany} />
    <div className="company-collection-invested flex w-full flex-col items-center justify-center px-6 pb-6 text-[13px]" style={{color:"var(--text-primary)"}}><h2 className="font-medium">invested.</h2></div>
    <CompanyCardScroll companies={investedCompanies} onSelectCompany={openCompany} />
  </section></Suspense>;
}
