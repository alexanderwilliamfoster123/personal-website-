"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  forwardRef,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/components/theme-provider";

gsap.registerPlugin(ScrollTrigger);

export interface Company {
  id?: string;
  name: string;
  logo: string;
  description?: string;
  darkImage?: string;
  lightImage?: string;
}

interface CompanyCardScrollProps {
  companies: Company[];
  className?: string;

  scrollDuration?: number;
  visiblePercentage?: number;
  baseRadius?: number;
  mobileRadius?: number;
  startTrigger?: string;
}

const CompanyCardScroll = forwardRef<
  HTMLDivElement,
  CompanyCardScrollProps
>(function CompanyCardScroll(
  {
    companies,
    className = "",
    scrollDuration = 1600,
    visiblePercentage = 42,
    baseRadius = 430,
    mobileRadius = 210,
    startTrigger = "top 35%",
  },
  forwardedRef
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLUListElement>(null);
  const firstCardRef = useRef<HTMLLIElement>(null);

  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [ready, setReady] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  /*
   * Keep the forwarded ref working.
   */
  useEffect(() => {
    if (!forwardedRef) return;

    if (typeof forwardedRef === "function") {
      forwardedRef(containerRef.current);
    } else {
      forwardedRef.current = containerRef.current;
    }
  }, [forwardedRef]);

  /*
   * Exact template radius:
   *
   * Desktop: 430
   * Mobile: 210
   */
  const radius =
    typeof window !== "undefined" && window.innerWidth < 768
      ? mobileRadius
      : baseRadius;

  const wheelSize = radius * 2;

  /*
   * Exact visible percentage behavior.
   */
  const visibleDecimal = useMemo(() => {
    return Math.max(10, Math.min(100, visiblePercentage)) / 100;
  }, [visiblePercentage]);

  const hiddenDecimal = 1 - visibleDecimal;

  /*
   * The original uses ResizeObserver to measure
   * the first card and calculate the wheel viewport.
   */
  useEffect(() => {
    setReady(true);

    if (!firstCardRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;

        setContainerSize({
          width: rect.width,
          height: rect.height,
        });

        ScrollTrigger.refresh();
      }
    });

    observer.observe(firstCardRef.current);

    return () => observer.disconnect();
  }, [companies.length]);

  /*
   * ==========================================
   * EXACT TEMPLATE ANIMATION
   * ==========================================
   */
  useEffect(() => {
    if (
      !containerRef.current ||
      !wheelRef.current ||
      companies.length === 0 ||
      !ready
    ) {
      return;
    }

    const container = containerRef.current;
    const wheel = wheelRef.current;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    /*
     * ------------------------------------------
     * CARD ENTRANCE
     * ------------------------------------------
     *
     * scale: 0 -> 1
     * opacity: 0 -> 1
     * duration: 1.2
     * ease: back.out(1.2)
     * stagger: 0.05
     */
    const entranceAnimation = gsap.fromTo(
      wheel.children,
      {
        scale: 0,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 1.2,
        ease: "back.out(1.2)",
        stagger: 0.05,

        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    /*
     * ------------------------------------------
     * WHOLE WHEEL ROTATION
     * ------------------------------------------
     *
     * IMPORTANT:
     * We rotate the wheel itself.
     *
     * We DO NOT recalculate every card
     * position on every scroll update.
     */
    const rotationAnimation = gsap.to(wheel, {
      rotation: 360,
      ease: "none",

      scrollTrigger: {
        trigger: container,
        pin: true,
        start: startTrigger,
        end: `+=${scrollDuration}`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      entranceAnimation.scrollTrigger?.kill();
      entranceAnimation.kill();

      rotationAnimation.scrollTrigger?.kill();
      rotationAnimation.kill();
    };
  }, [
    companies.length,
    ready,
    scrollDuration,
    startTrigger,
    radius,
    visibleDecimal,
  ]);

  /*
   * ==========================================
   * WHEEL HEIGHT
   * ==========================================
   */
  const extraSpace = containerSize
    ? containerSize.height * 1.25 -
    containerSize.height +
    60
    : 150;

  const wheelContainerHeight = containerSize
    ? wheelSize * visibleDecimal +
    containerSize.height / 2 +
    extraSpace +
    50
    : wheelSize * visibleDecimal + 260;

  if (companies.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`
        relative
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        overflow-hidden
        ${className}
      `}
    >
      {/* =====================================
          VISIBLE WHEEL WINDOW
          ===================================== */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: `${wheelContainerHeight}px`,

          maskImage:
            "linear-gradient(to top, transparent 0%, black 40%, black 100%)",

          WebkitMaskImage:
            "linear-gradient(to top, transparent 0%, black 40%, black 100%)",
        }}
      >
        {/* =====================================
            ACTUAL ROTATING WHEEL
            ===================================== */}
        <ul
          ref={wheelRef}
          className={`
            absolute
            left-1/2
            -translate-x-1/2
            will-change-transform
            m-0
            p-0
            list-none
            transition-opacity
            duration-500
            ease-out
            ${ready ? "opacity-100" : "opacity-0"}
          `}
          style={{
            width: wheelSize,
            height: wheelSize,
            bottom: -(wheelSize * hiddenDecimal),
            transformOrigin: "center center",
          }}
        >
          {companies.map((company, index) => {
            /*
             * Distribute cards evenly around circle, starting from top (12 o'clock).
             */
            const angle =
              -Math.PI / 2 + (index / companies.length) * Math.PI * 2;

            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            const rotation =
              (angle * 180) / Math.PI + 90;

            const isHovered = hoveredIndex === index;
            const isDimmed = hoveredIndex !== null && !isHovered;

            return (
              <li
                key={`${company.name}-${index}`}
                className={`absolute top-1/2 left-1/2 ${isHovered ? "z-50" : "z-10"}`}
                style={{
                  zIndex: isHovered ? 50 : 10,
                  transform: `
      translate(-50%, -50%)
      translate3d(${x}px, ${y}px, 0)
      rotate(${rotation}deg)
    `,
                }}
              >
                {/* Card - small by default (like screenshot), zooms on hover, dims when neighbor is hovered */}
                <div
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    group
                    relative
                    flex
                    h-[320px]
                    w-[230px]
                    xs:h-[360px]
                    xs:w-[250px]
                    sm:h-[460px]
                    sm:w-[330px]
                    flex-col
                    justify-between
                    overflow-hidden
                    scale-[0.66]
                    hover:scale-[0.84]
                    transition-all
                    duration-500
                    ease-[cubic-bezier(0.16,1,0.3,1)]
                    cursor-pointer
                    rounded-[14px] sm:rounded-[16px]
                    ${isDimmed ? "opacity-30" : "opacity-100"}
                  `}
                  style={{
                    transformOrigin: "center center",
                    willChange: "transform, opacity",
                    backgroundColor: isDark ? "#121212" : "#efefec",
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.07)"
                      : "1px solid #0000001f",
                  }}
                >
                  {/* Hover Overlay: Shows current gradient, stroke, and inset shadows on hover only */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      rounded-[14px] sm:rounded-[16px]
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity
                      duration-500
                      ease-out
                    "
                    style={{
                      border: isDark
                        ? "1px solid #343434"
                        : "1px solid var(--card-stroke, #EAEAEA)",
                      background: isDark
                        ? "var(--card-hover, linear-gradient(180deg, var(--100, #0D0D0D) 0%, var(--300, #272727) 100%))"
                        : "linear-gradient(180deg, var(--2000, #FFF) 0%, var(--1800, #EAEAEA) 100%)",
                      boxShadow: isDark
                        ? `
                          0 4px 4px 0 var(--button-shadow-1, rgba(0, 0, 0, 0.20)),
                          6px 80px 80px 0 rgba(255, 255, 255, 0.01) inset,
                          0 -1px 1px 0 rgba(255, 255, 255, 0.10) inset,
                          0 1px 1px 0 rgba(255, 255, 255, 0.10) inset
                        `
                        : `
                          0 4px 4px 0 var(--button-shadow-1, rgba(0, 0, 0, 0.03)),
                          6px 80px 80px 0 rgba(255, 255, 255, 0.01) inset,
                          0 -1px 1px 0 rgba(255, 255, 255, 0.10) inset,
                          0 1px 1px 0 rgba(255, 255, 255, 0.10) inset
                        `,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  />

                  {/* =========================================
                      TOP CONTENT: CARD NUMBER (01, 02, etc.)
                     ========================================= */}
                  <div className="relative z-10 p-5 xs:p-6 sm:p-7 pb-0">
                    <span
                      className="text-[12px] sm:text-sm font-mono font-medium text-neutral-400 dark:text-neutral-500 tracking-wider select-none"
                      style={{
                        fontFamily: '"Neue Montreal", monospace, sans-serif',
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* =========================================
                      BOTTOM CONTENT: COMPANY NAME
                     ========================================= */}
                  <div className="relative z-10 mt-auto flex items-center p-5 xs:p-6 sm:p-7 pt-0">
                    <span
                      className="text-[18px] sm:text-[32px] font-medium tracking-tight lowercase select-none"
                      style={{
                        fontFamily: '"Neue Montreal", sans-serif',
                        color: "var(--text-primary)",
                      }}
                    >
                      {company.name}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});

CompanyCardScroll.displayName = "CompanyCardScroll";

export default CompanyCardScroll;