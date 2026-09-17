"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

export interface BlurCarouselItem {
  id: string;
  content: (isActive: boolean) => React.ReactNode;
  onClick?: () => void;
}

interface BlurCarouselProps {
  items: BlurCarouselItem[];
  initialIndex?: number;
  autoPlayInterval?: number;
}

export default function BlurCarousel({
  items,
  initialIndex = 0,
  autoPlayInterval = 2500,
}: BlurCarouselProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isInteracting, setIsInteracting] = useState(false);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const lastSwipedTime = useRef<number>(0);

  // Auto-play timer: advances to next item smoothly when user is not actively swiping
  useEffect(() => {
    if (items.length <= 1 || isInteracting) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [items.length, autoPlayInterval, isInteracting]);

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = Date.now();
    setIsInteracting(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setTimeout(() => setIsInteracting(false), 200);
    if (startX.current === null) return;

    const deltaX = e.clientX - startX.current;
    const deltaY = startY.current !== null ? e.clientY - startY.current : 0;
    const deltaTime = Math.max(1, Date.now() - startTime.current);

    const now = Date.now();
    // Guard against rapid duplicate trigger
    if (now - lastSwipedTime.current < 250) {
      startX.current = null;
      startY.current = null;
      return;
    }

    if (
      Math.abs(deltaX) > Math.abs(deltaY) * 1.1 &&
      (Math.abs(deltaX) > 25 || Math.abs(deltaX) / deltaTime > 0.2)
    ) {
      lastSwipedTime.current = now;
      if (deltaX < 0 && activeIndex < items.length - 1) {
        setActiveIndex((prev) => prev + 1);
      } else if (deltaX > 0 && activeIndex > 0) {
        setActiveIndex((prev) => prev - 1);
      }
    }

    startX.current = null;
    startY.current = null;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startX.current = null;
        startY.current = null;
        setIsInteracting(false);
      }}
      className="relative flex flex-col items-center justify-center w-full overflow-hidden select-none py-4 touch-pan-y"
    >
      {/* Carousel Track Area */}
      <div className="relative flex items-center justify-center h-[260px] w-full cursor-grab active:cursor-grabbing">
        {items.map((item, index) => {
          const offset = index - activeIndex;
          const isActive = index === activeIndex;

          return (
            <motion.div
              key={item.id}
              animate={{
                x: `${offset * 215}px`,
                scale: isActive ? 1 : 0.82,
                opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.45 : 0,
                filter: isActive ? "blur(0px)" : "blur(8px)",
                zIndex: isActive ? 20 : 10 - Math.abs(offset),
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 26,
                mass: 0.7,
              }}
              onClick={() => {
                if (isActive) {
                  if (item.onClick) item.onClick();
                } else {
                  setActiveIndex(index);
                }
              }}
              className="absolute flex items-center justify-center cursor-pointer will-change-transform"
            >
              {item.content(isActive)}
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="mt-8 flex items-center justify-center gap-2 z-20">
        {items.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`dot-${index}`}
              type="button"
              aria-label={`Go to folder ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? isDark
                    ? "h-1.5 w-1.5 bg-white scale-125"
                    : "h-1.5 w-1.5 bg-black scale-125"
                  : isDark
                  ? "h-1 w-1 bg-white/30 hover:bg-white/60"
                  : "h-1 w-1 bg-black/20 hover:bg-black/40"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
