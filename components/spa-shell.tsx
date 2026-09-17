"use client";
import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import KeyboardGate from "@/components/keyboard-gate";
import BottomNavigation, { type TabId } from "@/components/bottom-navigation";
import HomePanel from "@/components/panels/home-panel";
import ThemeToggle from "@/components/theme-toggle";
import { getUserSession, setUserSession } from "@/lib/auth";
const CompaniesPanel = lazy(() => import("@/components/panels/companies-panel"));
const ContactPanel = lazy(() => import("@/components/panels/contact-panel"));
export const ACTIVE_TAB_KEY = "alex_foster_active_tab";
const validTabs: TabId[] = ["home", "companies", "contact"];
function saveTab(tab: TabId) { try { localStorage.setItem(ACTIVE_TAB_KEY, tab); } catch { /* Storage is optional. */ } }
export default function SPAShell() {
  const [stage, setStage] = useState<"loading" | "gate" | "app">("loading");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [backAction, setBackAction] = useState<(() => void) | null>(null);
  useEffect(() => {
    let savedTab: TabId = "home";
    try { savedTab = localStorage.getItem(ACTIVE_TAB_KEY) as TabId; } catch { /* Storage is optional. */ }
    const initialTab = validTabs.includes(savedTab) ? savedTab : "home";
    const session = getUserSession();
    const showEntry = new URLSearchParams(window.location.search).get("entry") === "1";
    if (session?.captureVersion === 1 && !showEntry) {
      setVisitorEmail(session.email);
      setActiveTab(initialTab);
      saveTab(initialTab);
      setStage("app");
      if (!validTabs.includes(window.history.state?.spaTab)) window.history.replaceState({ spaTab: initialTab }, "");
    } else setStage("gate");
  }, []);
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const tab: TabId = validTabs.includes(event.state?.spaTab) ? event.state.spaTab : "home";
      setActiveTab(tab);
      saveTab(tab);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const enterSite = async (email: string) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      const result = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      if (!response.ok || result.success !== true) {
        const error = new Error(typeof result.error === "string" ? result.error : "Your email couldn’t be saved. Please try again.");
        error.name = "EmailCaptureError";
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "EmailCaptureError") throw error;
      throw new Error("Your email couldn’t be saved. Please try again.");
    } finally {
      window.clearTimeout(timeout);
    }
    setUserSession({ name: "", email, captureVersion: 1 });
    setVisitorEmail(email);
    setActiveTab("home");
    setStage("app");
    saveTab("home");
    const url = new URL(window.location.href);
    url.searchParams.delete("entry");
    window.history.replaceState({ spaTab: "home" }, "", `${url.pathname}${url.search}${url.hash}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const changeTab = (tab: TabId) => {
    if (tab === activeTab) {
      if (backAction) backAction();
      else window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    setBackAction(null);
    setActiveTab(tab);
    saveTab(tab);
    window.history.pushState({ spaTab: tab }, "");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const registerBackAction = useCallback((action: (() => void) | null) => setBackAction(() => action), []);
  if (stage === "loading") return <main className="min-h-dvh" aria-busy="true" />;
  if (stage === "gate") return <KeyboardGate onComplete={enterSite} />;
  return <div className="relative min-h-dvh w-full">
    <header className="site-header">
      <div className="site-header-left">{backAction && <button type="button" onClick={backAction} className="header-back">back</button>}</div>
      <ThemeToggle />
    </header>
    <Suspense fallback={<main className="min-h-dvh" aria-busy="true" />}>
      {activeTab === "home" && <HomePanel />}
      {activeTab === "companies" && <CompaniesPanel registerBackAction={registerBackAction} />}
      {activeTab === "contact" && <ContactPanel email={visitorEmail} />}
    </Suspense>
    <BottomNavigation activeTab={activeTab} onTabChange={changeTab} />
  </div>;
}
