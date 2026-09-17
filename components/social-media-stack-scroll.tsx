"use client";

import React, { useRef, useState } from "react";
import { FiArrowUpRight, FiArrowLeft } from "react-icons/fi";
import type { SocialCard } from "./social-media-carousel";
import { useTheme } from "@/components/theme-provider";

interface SocialMediaStackScrollProps {
  cards: SocialCard[];
  onClose: () => void;
}

interface StickyCardProps {
  i: number;
  card: SocialCard;
  total: number;
}

const StickyCard = ({
  i,
  card,
  total,
}: StickyCardProps) => {
  const container = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const minWidth = 220;
  const maxWidth = 255;
  const cardWidth = total > 1 ? minWidth + (i / (total - 1)) * (maxWidth - minWidth) : maxWidth;

  return (
    <div
      ref={container}
      className="sticky top-0 flex w-full items-center justify-center px-4 pointer-events-none"
    >
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${card.title} (opens in a new tab)`}
        style={{
          top: `calc(15vh + ${i * 16}px)`,
          maxWidth: `${cardWidth}px`,
          zIndex: i + 10,
          borderRadius: "14px",
          border: isDark
            ? "1px solid rgba(255, 255, 255, 0.08)"
            : "1px solid var(--card-stroke, #EAEAEA)",
          background: isDark
            ? "linear-gradient(180deg, var(--100, #141414) 0%, var(--300, #0a0a0a) 100%)"
            : "linear-gradient(180deg, var(--2000, #FFFFFF) 0%, var(--1800, #F3F3F3) 100%)",
          boxShadow: isDark
            ? "0 8px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)"
            : "0 8px 32px 0 rgba(0, 0, 0, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        className={`relative flex h-[280px] w-full flex-col overflow-hidden pointer-events-auto cursor-pointer transition-transform active:scale-[0.98] ${
          isDark ? "bg-[#141414]" : "bg-[#f7f7f7]"
        }`}
      >
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between gap-4 py-1" style={{ color: "var(--text-primary)", fontFamily: '"Neue Montreal", sans-serif' }}>
          <span className="text-sm font-medium leading-tight">{card.title}</span>
          <FiArrowUpRight size={14} aria-hidden="true" />
        </div>
      </a>
    </div>
  );
};

export default function SocialMediaStackScroll({
  cards,
  onClose,
}: SocialMediaStackScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto select-none pb-[50vh] transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Header Row with Back Button */}
      

      {/* Text above social media carousel */}
      <div className="w-full text-center pt-20 pb-6 shrink-0 pointer-events-none">
        <span
          className="text-[13px] leading-[1.5] font-medium text-foreground whitespace-nowrap select-none tracking-tight"
          style={{ fontFamily: '"Neue Montreal", sans-serif' }}
        >
          social media.
        </span>
      </div>

      {/* Stacked Cards Area */}
      <div className="relative flex w-full flex-col items-center justify-center pt-2">
        {cards.map((card, i) => (
          <StickyCard
            key={`stack_card_${i}`}
            i={i}
            card={card}
            total={cards.length}
          />
        ))}
      </div>
    </div>
  );
}
