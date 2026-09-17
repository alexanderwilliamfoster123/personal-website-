"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFeather } from "react-icons/fa6";
import { FiArrowLeft } from "react-icons/fi";
import { useTheme } from "@/components/theme-provider";

export interface WritingCard {
  title: string;
  username?: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
}

interface WritingsViewProps {
  cards?: WritingCard[];
  onBack: () => void;
  onOpenNewsletter: () => void;
  onOpenForbes?: () => void;
  onCardClick?: (card: WritingCard) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const linearItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

export default function WritingsView({
  cards = [
    {
      title: "newsletter",
      username: "letters",
      href: "#",
      icon: <FaFeather size={18} />,
    },
    {
      title: "forbes column",
      username: "forbes",
      href: "https://forbes.com",
      icon: <FaFeather size={18} />,
    },
  ],
  onBack,
  onOpenNewsletter,
  onOpenForbes,
  onCardClick,
}: WritingsViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Synchronize deck with cards prop
  const [deck, setDeck] = useState<WritingCard[]>(cards);
  const [dragDx, setDragDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flyDir, setFlyDir] = useState<number>(0);

  const startXRef = React.useRef(0);
  const currentDxRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const hasMovedRef = React.useRef(false);

  React.useEffect(() => {
    setDeck(cards);
  }, [cards]);

  const handleCardTrigger = (card: WritingCard) => {
    if (onCardClick) {
      onCardClick(card);
    } else if (card.title.toLowerCase().includes("newsletter")) {
      onOpenNewsletter();
    } else if (card.title.toLowerCase().includes("forbes")) {
      if (onOpenForbes) onOpenForbes();
      else window.open("https://forbes.com", "_blank");
    } else if (card.href && card.href !== "#") {
      window.open(card.href, "_blank");
    } else {
      onOpenNewsletter();
    }
  };

  const flyOut = (direction: number) => {
    if (isFlying || deck.length <= 1) return;
    setIsFlying(true);
    setFlyDir(direction);
    setTimeout(() => {
      setDeck((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
      setIsFlying(false);
      setFlyDir(0);
      setDragDx(0);
    }, 380);
  };



  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFlying || deck.length <= 1) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
    startXRef.current = e.clientX;
    currentDxRef.current = 0;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    setDragDx(0);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    currentDxRef.current = dx;
    if (Math.abs(dx) > 6) {
      hasMovedRef.current = true;
    }
    setDragDx(dx);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    const dx = currentDxRef.current;
    const THRESHOLD = 70;

    if (Math.abs(dx) > THRESHOLD) {
      flyOut(dx > 0 ? 1 : -1);
    } else {
      setDragDx(0);
      if (!hasMovedRef.current) {
        handleCardTrigger(deck[0]);
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="relative flex min-h-dvh w-full flex-col justify-between overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 select-none transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Header */}

      {/* Center Writing Category Cards */}
      <div className="flex flex-1 items-center justify-center w-full py-4 sm:py-12 -mt-9 sm:mt-0">
        {/* ================= MOBILE VIEW (< 640px): SCD-20 Touch Swipe Media Stack ================= */}
        <div className="flex flex-col sm:hidden items-center justify-center w-full">
          {/* Deck Container */}
          <div className="relative w-[235px] h-[320px] flex items-center justify-center mx-auto">
            {deck.map((card, i) => {
              const isFront = i === 0;
              const d = i;

              let transform = "";
              let opacity = 1;
              let transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s";
              let zIndex = 10 - d;
              let cursor = isFront ? (isDragging ? "grabbing" : "grab") : "default";

              if (isFront) {
                if (isFlying) {
                  transform = `translate3d(${flyDir * 140}%, 0, 0) rotate(${flyDir * 18}deg)`;
                  opacity = 0;
                  transition = "transform 0.38s cubic-bezier(0.3, 0.9, 0.3, 1), opacity 0.38s";
                } else if (isDragging) {
                  transform = `translate3d(${dragDx}px, 0, 0) rotate(${dragDx / 22}deg)`;
                  transition = "none";
                } else {
                  transform = "translate3d(0, 0, 0) rotate(0deg) scale(1)";
                }
              } else {
                // Smoothly step the background card forward during swipe drag or flight
                let effectiveD = d;
                if (isFlying) {
                  effectiveD = Math.max(0, d - 1);
                } else if (isDragging) {
                  const dragRatio = Math.min(1, Math.abs(dragDx) / 100);
                  effectiveD = Math.max(0, d - dragRatio);
                }

                if (effectiveD <= 0) {
                  transform = "translate3d(0, 0, 0) rotate(0deg) scale(1)";
                } else {
                  const rotation = effectiveD * 8;
                  const offsetX = effectiveD * 12;
                  const offsetY = effectiveD * 10;
                  const scale = Math.max(0.92, 1 - effectiveD * 0.02);

                  transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotation}deg) scale(${scale})`;
                }

                if (isDragging) {
                  transition = "none";
                }
              }

              return (
                <div
                  key={card.title}
                  onPointerDown={isFront ? handlePointerDown : undefined}
                  onPointerMove={isFront ? handlePointerMove : undefined}
                  onPointerUp={isFront ? handlePointerUp : undefined}
                  onPointerCancel={isFront ? handlePointerUp : undefined}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform,
                    opacity,
                    zIndex,
                    transition,
                    cursor,
                    touchAction: "pan-y",
                    willChange: "transform, opacity",
                    borderRadius: "14px",
                    border: isDark
                      ? "1px solid #343434"
                      : "1px solid var(--card-stroke, #EAEAEA)",
                    background:
                      "var(--dark-card-fill, linear-gradient(180deg, var(--card-card-fill-1, #FFF) 0%, var(--card-card-fill-2, #EAEAEA) 100%))",
                    boxShadow: isDark
                      ? "0 24px 50px -20px rgba(0,0,0,0.85), 6px 80px 80px 0 rgba(255, 255, 255, 0.01) inset, 0 -1px 1px 0 rgba(255, 255, 255, 0.10) inset, 0 1px 1px 0 rgba(255, 255, 255, 0.10) inset"
                      : "0 24px 50px -20px rgba(0,0,0,0.12), 6px 80px 80px 0 rgba(255, 255, 255, 0.01) inset, 0 -1px 1px 0 rgba(255, 255, 255, 0.10) inset, 0 1px 1px 0 rgba(255, 255, 255, 0.10) inset",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                  className="flex flex-col justify-between p-6 overflow-hidden select-none"
                >
                  {/* Top Icon */}
                  <div
                    className="flex h-9 w-9 items-center justify-center pointer-events-none"
                    style={{
                      color: isDark ? "#FFFFFF" : "#111111",
                    }}
                  >
                    {card.icon || <FaFeather size={18} />}
                  </div>

                  {/* Bottom Content */}
                  <div className="flex flex-col items-start w-full pointer-events-none">
                    <span
                      className="text-[13px] font-bold tracking-tight lowercase"
                      style={{
                        fontFamily: '"Neue Montreal", sans-serif',
                        color: isDark ? "#FFFFFF" : "#111111",
                      }}
                    >
                      {card.title}
                    </span>
                    <span
                      className="mt-0.5 text-[10px] font-normal"
                      style={{
                        fontFamily: '"Neue Montreal", sans-serif',
                        color: isDark ? "#8F8F8F" : "#707070",
                      }}
                    >
                      {card.username || "letters"}
                    </span>

                    <div
                      className="mt-4 flex items-center gap-1.5 text-[11px] font-normal"
                      style={{
                        fontFamily: '"Neue Montreal", sans-serif',
                        color: isDark ? "#777777" : "#8E8E8E",
                      }}
                    >
                      <span>tap to open</span>
                      <span>↗</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

         
        </div>

        {/* ================= DESKTOP VIEW (>= 640px): Side-by-Side Row ================= */}
        <div className="hidden sm:flex flex-row items-center justify-center gap-8 md:gap-10">
          {cards.map((card, index) => (
            <motion.div
              key={card.title + index}
              variants={linearItemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardTrigger(card)}
              className="group relative flex h-[290px] w-[215px] cursor-pointer flex-col justify-between p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                borderRadius: "12px",
                border: "1px solid var(--card-stroke, #EAEAEA)",
                background:
                  "var(--dark-card-fill, linear-gradient(180deg, var(--card-card-fill-1, #FFF) 0%, var(--card-card-fill-2, #EAEAEA) 100%))",
                boxShadow:
                  "0 4px 4px 0 var(--button-shadow-1, rgba(0, 0, 0, 0.03)), 6px 80px 80px 0 rgba(255, 255, 255, 0.01) inset, 0 -1px 1px 0 rgba(255, 255, 255, 0.10) inset, 0 1px 1px 0 rgba(255, 255, 255, 0.10) inset",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              {/* Top Icon */}
              <div
                className="flex h-8 w-8 items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  color: isDark ? "#FFFFFF" : "#111111",
                }}
              >
                {card.icon || <FaFeather size={18} />}
              </div>

              {/* Bottom Content */}
              <div className="flex flex-col items-start w-full">
                <span
                  className="text-[13px] font-medium tracking-tight lowercase"
                  style={{
                    fontFamily: '"Neue Montreal", sans-serif',
                    color: isDark ? "#FFFFFF" : "#111111",
                  }}
                >
                  {card.title}
                </span>
                <span
                  className="mt-0.5 text-[10px] font-normal"
                  style={{
                    fontFamily: '"Neue Montreal", sans-serif',
                    color: isDark ? "#8F8F8F" : "#707070",
                  }}
                >
                  {card.username || "letters"}
                </span>

                <div
                  className="mt-4 flex items-center gap-1 text-[11px] font-normal transition-colors group-hover:opacity-100"
                  style={{
                    fontFamily: '"Neue Montreal", sans-serif',
                    color: isDark ? "#555555" : "#8E8E8E",
                  }}
                >
                  <span>tap to open</span>
                  <span>↗</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
