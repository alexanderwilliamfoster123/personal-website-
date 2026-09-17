"use client";

import React from "react";
import { UserSession } from "@/lib/auth";
import { TabId } from "@/components/bottom-navigation";

interface HomePanelProps {
  session: UserSession | null;
  signOut: () => void;
  onNavigateTab?: (tab: TabId) => void;
}

export default function HomePanel(_props: HomePanelProps) {
  return (
    <main
      className="relative min-h-dvh w-full overflow-hidden flex flex-col items-center justify-center select-none transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="-mt-50">
        <div
          className="text-[13px] leading-[1.5] text-neutral-500"
          style={{
            fontFamily: '"Neue Montreal", sans-serif',
          }}
        >
          <p>
            <span>
              <span
                className="wr-word font-medium text-foreground"
                style={{
                  animationDelay: "0s",
                }}
              >
                by
              </span>{" "}
            </span>

            <span>
              <span
                className="wr-word font-medium text-foreground"
                style={{
                  animationDelay: "0.178s",
                }}
              >
                design.
              </span>{" "}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}