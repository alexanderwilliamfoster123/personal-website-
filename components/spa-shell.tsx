"use client";

import React, { useState, useEffect, useCallback } from "react";
import KeyboardGate from "@/components/keyboard-gate";
import ReceiptScreen from "@/components/receipt-screen";
import BottomNavigation, { TabId } from "@/components/bottom-navigation";
import HomePanel from "@/components/panels/home-panel";
import CompaniesPanel from "@/components/panels/companies-panel";
import SocialsPanel from "@/components/panels/socials-panel";
// import ContactPanel from "@/components/panels/contact-panel";
import ThemeToggle from "@/components/theme-toggle";
import { getUserSession, clearUserSession, UserSession } from "@/lib/auth";

export const ACTIVE_TAB_KEY = "alex_foster_active_tab";

export default function SPAShell() {
  const [stage, setStage] = useState<"loading" | "gate" | "receipt" | "app">("loading");
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTabState] = useState<TabId>("home");
  const [backAction, setBackAction] = useState<(() => void) | null>(null);

  // Read session and active tab on client mount
  useEffect(() => {
    const existingSession = getUserSession();
    const savedTab = (localStorage.getItem(ACTIVE_TAB_KEY) as TabId) || "home";
    const validTabs: TabId[] = ["home", "companies", "socials", "contact"];
    const initialTab = validTabs.includes(savedTab) ? savedTab : "home";

    if (existingSession) {
      setSession(existingSession);
      setActiveTabState(initialTab);
      setStage("app");
      if (typeof window !== "undefined" && (!window.history.state || !window.history.state.spaTab)) {
        window.history.replaceState({ spaTab: initialTab }, "");
      }
    } else {
      setStage("gate");
    }
  }, []);

  // Listen for global back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.spaTab) {
        const validTabs: TabId[] = ["home", "companies", "socials", "contact"];
        if (validTabs.includes(state.spaTab)) {
          setActiveTabState(state.spaTab);
          if (typeof window !== "undefined") {
            localStorage.setItem(ACTIVE_TAB_KEY, state.spaTab);
          }
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleGateComplete = (name: string, email: string) => {
    setSession({ name, email });
    setStage("receipt");
  };

  const handleReturningUser = (user: UserSession) => {
    setSession(user);
    setStage("app");
    if (typeof window !== "undefined") {
      window.history.pushState({ spaTab: "home" }, "");
    }
  };

  const handleReceiptEnter = () => {
    setStage("app");
    if (typeof window !== "undefined") {
      window.history.pushState({ spaTab: "home" }, "");
    }
  };

  const handleTabChange = (tab: TabId) => {
    setBackAction(null);
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_TAB_KEY, tab);
      window.history.pushState({ spaTab: tab }, "");
    }
  };

  const registerBackAction = useCallback((action: (() => void) | null) => {
    setBackAction(() => action);
  }, []);

  const handleSignOut = () => {
    clearUserSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACTIVE_TAB_KEY);
    }
    setSession(null);
    setActiveTabState("home");
    setStage("gate");
  };

  if (stage === "loading") {
    return (
      <main
        className="min-h-dvh w-full"
        style={{ backgroundColor: "var(--background)" }}
      />
    );
  }

  if (stage === "gate") {
    return (
      <KeyboardGate
        onComplete={handleGateComplete}
        onReturningUser={handleReturningUser}
      />
    );
  }

  if (stage === "receipt") {
    return (
      <ReceiptScreen
        name={session?.name || "visitor"}
        email={session?.email || "you@somewhere.com"}
        onEnter={handleReceiptEnter}
      />
    );
  }

  return (
    <div className="relative min-h-dvh w-full">
      {/* Global persistent Back button */}
      {backAction && (
        <button
          type="button"
          onClick={backAction}
          className="fixed top-4 left-5 z-[80] cursor-pointer text-[10px] tracking-[0.18em] text-faint transition-colors duration-300 hover:text-foreground"
        >
          back
        </button>
      )}

      {/* Global persistent Sign Out button */}
      <button
        type="button"
        onClick={handleSignOut}
        className="fixed top-4 z-[80] cursor-pointer text-[10px] tracking-[0.18em] text-faint hover:text-foreground transition-all duration-300"
        style={{ left: backAction ? "65px" : "20px" }}
      >
        sign out
      </button>

      {/* Global persistent Theme Toggle */}
      <div className="fixed top-4 right-5 z-[80]">
        <ThemeToggle />
      </div>

      {activeTab === "home" && (
        <HomePanel
          session={session}
          signOut={handleSignOut}
          onNavigateTab={handleTabChange}
        />
      )}
      {activeTab === "companies" && (
        <CompaniesPanel
          session={session}
          signOut={handleSignOut}
          onNavigateTab={handleTabChange}
        />
      )}
      {activeTab === "socials" && (
        <SocialsPanel
          session={session}
          signOut={handleSignOut}
          onNavigateTab={handleTabChange}
          registerBackAction={registerBackAction}
        />
      )}
      {/* {activeTab === "contact" && (
        <ContactPanel
          session={session}
          signOut={handleSignOut}
          onNavigateTab={handleTabChange}
        />
      )} */}

      {/* Persistent Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
