"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import { useTheme } from "./theme-provider";
import { setUserSession } from "@/lib/auth";
import AnimatedEnterButton from "./animatedEnterButton";

interface ReceiptScreenProps {
  name: string;
  email: string;
  onEnter?: () => void;
}

interface AnimationConfig {
  keyframeCSS: string;
  duration: number;
  numBrakes: number;
}


function generateReceiptAnimation(): AnimationConfig {
  // Random number of brakes between 1 and 4
  const numBrakes = Math.floor(Math.random() * 4) + 1;
  const duration = Number((2.4 + Math.random() * 0.4).toFixed(2)); // ~2.4s to 2.8s

  const startY = -96;
  const endY = 0;

  // Generate random brake positions (Y values in %) between -82% and -22%
  const brakePositions: number[] = [];
  const minRange = -82;
  const maxRange = -22;
  const stepSize = (maxRange - minRange) / numBrakes;

  for (let i = 0; i < numBrakes; i++) {
    const segmentMin = minRange + i * stepSize;
    const pos = segmentMin + stepSize * 0.15 + Math.random() * (stepSize * 0.7);
    brakePositions.push(Number(pos.toFixed(1)));
  }

  // Generate random pause durations for each brake (5.5% to 8% of total timeline each)
  const brakePercents: number[] = [];
  let totalBrakePercent = 0;
  for (let i = 0; i < numBrakes; i++) {
    const bp = Number((5.5 + Math.random() * 2.5).toFixed(2));
    brakePercents.push(bp);
    totalBrakePercent += bp;
  }

  // Available timeline for active feeds
  const availableFeedPercent = 100 - totalBrakePercent;

  // Calculate distance of each feed segment
  const allWaypoints = [startY, ...brakePositions, endY];
  const feedDistances: number[] = [];
  let totalFeedDistance = 0;
  for (let i = 0; i < allWaypoints.length - 1; i++) {
    const dist = Math.abs(allWaypoints[i + 1] - allWaypoints[i]);
    feedDistances.push(dist);
    totalFeedDistance += dist;
  }

  // Build keyframe steps
  let currentTimelinePercent = 0;
  const keyframeSteps: string[] = [];

  // Start at 0%
  keyframeSteps.push(`
    0% {
      transform: translateY(${startY}%) translateX(0px);
      animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
    }
  `);

  for (let i = 0; i < numBrakes; i++) {
    const feedPct = (feedDistances[i] / totalFeedDistance) * availableFeedPercent;
    currentTimelinePercent += feedPct;
    const reachBrakeTime = Number(currentTimelinePercent.toFixed(2));

    // Sub-pixel jitter during movement
    const jitter = i % 2 === 0 ? "0.35px" : "-0.3px";
    const brakeY = brakePositions[i];

    // Reach brake position
    keyframeSteps.push(`
    ${reachBrakeTime}% {
      transform: translateY(${brakeY}%) translateX(${jitter});
      animation-timing-function: step-end;
    }
    `);

    // Hold at brake position (pause)
    currentTimelinePercent += brakePercents[i];
    const resumeTime = Number(currentTimelinePercent.toFixed(2));
    keyframeSteps.push(`
    ${resumeTime}% {
      transform: translateY(${brakeY}%) translateX(0px);
      animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    `);
  }

  // Final feed segment goes directly and smoothly to 0% (endY) with no hesitation
  keyframeSteps.push(`
    100% {
      transform: translateY(${endY}%) translateX(0px);
    }
  `);

  const keyframeCSS = `@keyframes dynamicReceiptPrint { ${keyframeSteps.join("\n")} }`;

  return {
    keyframeCSS,
    duration,
    numBrakes,
  };
}

export default function ReceiptScreen({ name, email, onEnter }: ReceiptScreenProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [receiptDate, setReceiptDate] = useState("");
  const [receiptTime, setReceiptTime] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig | null>(null);

  useEffect(() => {
    if (name && email) {
      setUserSession({ name: name.trim(), email: email.trim() });
    }

    const now = new Date();
    const d = now
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .toLowerCase();
    const t = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setReceiptDate(d);
    setReceiptTime(t);
    setReceiptNo(Math.floor(1000000000 + Math.random() * 9000000000).toString());

    // Generate random receipt animation with 1 to 4 random brakes
    const config = generateReceiptAnimation();
    setAnimationConfig(config);

    // Small delay before printer motor engages
    const printTimer = setTimeout(() => {
      setIsPrinting(true);
    }, 180);

    // Mark printing complete after feed cycle finishes
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
    }, 180 + config.duration * 1000 + 80);

    return () => {
      clearTimeout(printTimer);
      clearTimeout(completeTimer);
    };
  }, [name, email]);

  return (
    <main
      className="gate-screen flex min-h-dvh flex-col justify-between items-center px-4 py-6 sm:py-8 transition-colors duration-500 ease-out select-none"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {animationConfig && <style>{animationConfig.keyframeCSS}</style>}

      {/* Top Header Bar with Theme Toggle */}
      <div className="fixed top-4 right-5 z-[80]">
        <ThemeToggle />
      </div>

      <section
        aria-label="receipt printer"
        data-stage="complete"
        className="relative isolate flex w-full my-auto xs:max-w-[370px] sm:max-w-[420px] md:max-w-[440px] flex-col items-center animate-fade-up px-2 sm:px-0"
        style={{ animationDuration: "0.6s" }}
      >
        {/* Top Printer Chassis / Status */}
        <div
          className="relative z-30 w-full overflow-hidden p-4 sm:p-6 pb-6 sm:pb-8 transition-all duration-300"
          style={{
            borderRadius: isDark ? "24px" : "12px",
            border: isDark
              ? "0.5px solid var(--400, #343434)"
              : "0.5px solid var(--card-stroke, #EAEAEA)",
            background: isDark
              ? "var(--200, #1A1A1A)"
              : "var(--reciept-fill, #EAEAEA)",
            boxShadow: isDark
              ? "0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.07)"
              : "4px 0 10px 0 var(--Neutral-300-05, rgba(39, 39, 39, 0.05)), 0 4px 16px 0 var(--Neutral-300-15, rgba(39, 39, 39, 0.15))",
          }}
        >
          {/* Inner Badge */}
          <div
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300"
            style={{
              background: isDark ? "rgba(10, 10, 12, 0.85)" : "#FFFFFF",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "0.5px solid rgba(0, 0, 0, 0.06)",
              boxShadow: isDark
                ? "inset 0 1px 2px rgba(0, 0, 0, 0.4)"
                : "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              className="flex items-center justify-center gap-2"
              role="status"
              aria-live="polite"
            >
              {isComplete ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 transition-colors duration-300 ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              ) : (
                <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
              <span
                className="truncate transition-colors duration-300"
                style={{
                  color: isDark ? "#FFFFFF" : "#111111",
                  fontFamily: '"Neue Montreal", sans-serif',
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: "22px",
                  letterSpacing: "-0.32px",
                }}
              >
                {isComplete ? "Access Granted" : "Printing Pass..."}
              </span>
            </div>
          </div>

          {/* Printer Slot for Receipt */}
          <div
            aria-hidden="true"
            className="absolute inset-x-5 sm:inset-x-6 bottom-2.5 sm:bottom-3 z-40 h-2 rounded transition-colors duration-300"
            style={{
              backgroundColor: isDark ? "#0D0D0D" : "#C3C3C3",
            }}
          />
        </div>

        {/* Paper Container with Print Slide-down Effect */}
        <div className="relative z-60 -mt-3.5 sm:-mt-4 w-full overflow-hidden px-8 sm:px-10 pb-8 pt-1">
          {/* Deep slot cast shadow onto the sliding paper */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 sm:inset-x-10 top-0 z-20 h-4 transition-opacity duration-300"
            style={{
              background: isDark
                ? "linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)"
                : "linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 50%, transparent 100%)",
            }}
          />

          {/* Slot bottom lip edge to create 3D slot depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 sm:inset-x-10 top-0 z-35 h-[1.5px] transition-colors duration-300"
            style={{
              backgroundColor: isDark ? "#2A2A2A" : "#D1D1D1",
              opacity: 0.9,
            }}
          />

          {/* Printer Slot Mouth (deep dark entry line) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 sm:inset-x-10 -top-[2.5px] z-30 h-[3px] transition-colors duration-300"
            style={{
              backgroundColor: isDark ? "#060606" : "#9E9E9E",
            }}
          />

          {/* Paper Blur Shadow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 sm:inset-x-10 -top-1 z-20 h-2 bg-black/40 blur-[6px]"
          />
          <div
            aria-hidden="false"
            className="relative"
            style={{
              opacity: 1,
              transform: isPrinting ? "translateY(0%)" : "translateY(-96%)",
              animation:
                isPrinting && animationConfig
                  ? `dynamicReceiptPrint ${animationConfig.duration}s forwards`
                  : "none",
              willChange: "transform",
              filter: isDark
                ? "drop-shadow(0 10px 24px rgba(0, 0, 0, 0.45))"
                : "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.06)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.04))",
            }}
          >
            <article
              className="relative min-h-80 px-4 sm:px-5 pt-6 sm:pt-7 pb-7 sm:pb-8 font-mono text-[#161616] transition-colors duration-300"
              style={{
                backgroundColor: isDark ? "#f7f7f4" : "#FFFFFF",
                clipPath:
                  "polygon(0px 0px, 100% 0px, 100% calc(100% - 4px), 98.75% 100%, 97.5% calc(100% - 4px), 96.25% 100%, 95% calc(100% - 4px), 93.75% 100%, 92.5% calc(100% - 4px), 91.25% 100%, 90% calc(100% - 4px), 88.75% 100%, 87.5% calc(100% - 4px), 86.25% 100%, 85% calc(100% - 4px), 83.75% 100%, 82.5% calc(100% - 4px), 81.25% 100%, 80% calc(100% - 4px), 78.75% 100%, 77.5% calc(100% - 4px), 76.25% 100%, 75% calc(100% - 4px), 73.75% 100%, 72.5% calc(100% - 4px), 71.25% 100%, 70% calc(100% - 4px), 68.75% 100%, 67.5% calc(100% - 4px), 66.25% 100%, 65% calc(100% - 4px), 63.75% 100%, 62.5% calc(100% - 4px), 61.25% 100%, 60% calc(100% - 4px), 58.75% 100%, 57.5% calc(100% - 4px), 56.25% 100%, 55% calc(100% - 4px), 53.75% 100%, 52.5% calc(100% - 4px), 51.25% 100%, 50% calc(100% - 4px), 48.75% 100%, 47.5% calc(100% - 4px), 46.25% 100%, 45% calc(100% - 4px), 43.75% 100%, 42.5% calc(100% - 4px), 41.25% 100%, 40% calc(100% - 4px), 38.75% 100%, 37.5% calc(100% - 4px), 36.25% 100%, 35% calc(100% - 4px), 33.75% 100%, 32.5% calc(100% - 4px), 31.25% 100%, 30% calc(100% - 4px), 28.75% 100%, 27.5% calc(100% - 4px), 26.25% 100%, 25% calc(100% - 4px), 23.75% 100%, 22.5% calc(100% - 4px), 21.25% 100%, 20% calc(100% - 4px), 18.75% 100%, 17.5% calc(100% - 4px), 16.25% 100%, 15% calc(100% - 4px), 13.75% 100%, 12.5% calc(100% - 4px), 11.25% 100%, 10% calc(100% - 4px), 8.75% 100%, 7.5% calc(100% - 4px), 6.25% 100%, 5% calc(100% - 4px), 3.75% 100%, 2.5% calc(100% - 4px), 1.25% 100%, 0% calc(100% - 4px))",
              }}
            >
              <div className="text-center">
                <p className="text-[13px] font-medium tracking-tight text-[#161616]">
                  Alexander’s World
                </p>
                <p className="mt-2 text-[10px] text-[#8a8a86]">
                  access receipt
                </p>
                <div
                  className="my-3 sm:my-4 border-t border-dashed"
                  style={{
                    borderColor: isDark ? "#c9c9c4" : "#d8d8d4",
                  }}
                />
                <div
                  className="space-y-4 sm:space-y-6 text-[10px] font-normal"
                  style={{
                    fontFamily: "Consolas, monospace",
                    lineHeight: "120%",
                    letterSpacing: "-0.24px",
                  }}
                >
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#828282]">Name</span>
                    <span className="truncate text-right text-black">
                      {name || "visitor"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#828282]">Email</span>
                    <span className="truncate text-right text-black">
                      {email || "you@somewhere.com"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#828282]">Date</span>
                    <span className="text-right text-black">
                      {receiptDate || "21 aug 2026"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#828282]">Time</span>
                    <span className="text-right text-black">
                      {receiptTime || "15:43"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#828282]">no.</span>
                    <span className="text-right text-black">
                      {receiptNo || "7307206499"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#828282]">Amount</span>
                    <span className="text-right text-black">$0.00</span>
                  </div>
                </div>
                <div
                  className="my-3 sm:my-4 border-t border-dashed"
                  style={{
                    borderColor: isDark ? "#c9c9c4" : "#d8d8d4",
                  }}
                />

                {/* Barcode representation */}
                <div
                  className="mx-auto mt-3 sm:mt-4 flex h-8 sm:h-9 items-stretch justify-center gap-[2px]"
                  aria-hidden="true"
                >
                  {[
                    2, 1, 1, 2, 3, 1, 1, 2, 1, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1,
                    1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 1,
                  ].map((w, idx) => (
                    <span
                      key={idx}
                      className="bg-[#161616]"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-[8px] tracking-[0.34em] text-[#8a8a86]">
                  {receiptNo || "7307206499"}
                </p>
              </div>
            </article>
          </div>
        </div>

        {/* Enter Button below the receipt */}
        <div
          className="z-30 flex justify-center items-center mt-8  transition-all duration-700 ease-out"
          style={{
            opacity: isComplete ? 1 : 0.4,
            transform: isComplete ? " scale(0.7)" : " scale(0.65)",
            transformOrigin: "center center",
            pointerEvents: isComplete ? "auto" : "none",
          }}
        >
          <AnimatedEnterButton
            onClick={() => {
              if (onEnter) {
                onEnter();
              } else {
                router.push("/");
              }
            }}
          />
        </div>
      </section>

      {/* Footer spacer */}
      <footer className="w-full max-w-5xl h-6 pointer-events-none" />
    </main>
  );
}

