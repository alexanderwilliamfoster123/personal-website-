"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";
import { useMediaQuery } from "@/lib/use-media-query";

gsap.registerPlugin(ScrollTrigger);

export interface Company {
  id?: string;
  number?: string;
  name: string;
  logo: string;
  description?: string;
  darkImage?: string;
  lightImage?: string;
}

interface CompanyCardScrollProps {
  companies: Company[];
  onSelectCompany?: (company: Company) => void;
  className?: string;
  scrollDuration?: number;
}

const CompanyCardScroll = forwardRef<HTMLDivElement, CompanyCardScrollProps>(
  function CompanyCardScroll({
    companies,
    onSelectCompany,
    className = "",
    scrollDuration = 1600,
  }, forwardedRef) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const wheelRef = useRef<HTMLUListElement>(null);
    const rotationRef = useRef<gsap.core.Tween | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const count = companies.length;
    // Preserve the original full wheel, including the space between each card.
    // Mobile scales this geometry as a whole; it does not use a different arc.
    const angleStep = 360 / Math.max(1, count);

    useImperativeHandle(forwardedRef, () => sceneRef.current as HTMLDivElement, []);

    useLayoutEffect(() => {
      const scene = sceneRef.current;
      const viewport = viewportRef.current;
      const wheel = wheelRef.current;
      // A single investment is ordinary document content: no entrance trigger,
      // sticky stage, rotation tween, or resize-refresh cycle.
      if (!scene || !viewport || !wheel || count < 2 || reducedMotion) return;

      ScrollTrigger.config({ ignoreMobileResize: true });
      const context = gsap.context(() => {
        gsap.fromTo(wheel.querySelectorAll(".company-wheel-entry"), {
          scale: 0.96,
          autoAlpha: 0,
        }, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: scene,
            start: "top 80%",
            once: true,
          },
        });

        if (count > 1) {
          rotationRef.current = gsap.fromTo(wheel, { rotation: 0 }, {
            rotation: -angleStep * (count - 1),
            force3D: true,
            ease: "none",
            scrollTrigger: {
              trigger: scene,
              // CSS owns stickiness; no fixed pin, spacer, or touch interception.
              start: () => `top ${parseFloat(getComputedStyle(viewport).top)}px`,
              end: () => `+=${scene.offsetHeight - viewport.offsetHeight}`,
              // A short settle follows the swipe without a one-second tail.
              scrub: 0.35,
              invalidateOnRefresh: true,
            },
          });
        }
      }, scene);

      // Recalculate after the real stage changes size, including orientation changes.
      // Its svh-based height stays steady when mobile browser chrome collapses.
      let refreshFrame = 0;
      const refresh = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      let previousWidth = viewport.offsetWidth;
      let previousHeight = viewport.offsetHeight;
      const observer = new ResizeObserver(() => {
        const width = viewport.offsetWidth;
        const height = viewport.offsetHeight;
        if (width === previousWidth && height === previousHeight) return;
        previousWidth = width;
        previousHeight = height;
        refresh();
      });
      observer.observe(viewport);
      refresh();
      return () => {
        observer.disconnect();
        cancelAnimationFrame(refreshFrame);
        rotationRef.current = null;
        context.revert();
      };
    }, [angleStep, count, reducedMotion, scrollDuration]);

    if (!count) return null;

    const focusCard = (index: number) => {
      setHoveredIndex(index);
      const trigger = rotationRef.current?.scrollTrigger;
      if (trigger && count > 1) {
        window.scrollTo({
          top: trigger.start + (trigger.end - trigger.start) * index / (count - 1),
          behavior: "instant",
        });
        ScrollTrigger.update();
      }
    };

    return (
      <div
        ref={sceneRef}
        className={`company-wheel-scene ${className}`}
        data-rotating={count > 1 && !reducedMotion ? "true" : "false"}
        data-single={count === 1 ? "true" : undefined}
        style={{
          "--wheel-steps": Math.max(0, count - 1),
          "--wheel-max-travel": `${scrollDuration}px`,
        } as CSSProperties}
      >
        <div ref={viewportRef} className="company-wheel-viewport">
          <div className="company-wheel-window">
            <ul ref={wheelRef} className="company-wheel">
              {companies.map((company, index) => {
                const isHovered = hoveredIndex === index;
                const isDimmed = hoveredIndex !== null && !isHovered;
                return (
                  <li
                    key={company.id ?? company.name}
                    className="company-wheel-position"
                    style={{
                      zIndex: isHovered ? 50 : 10,
                      transform: count === 1 ? "translate(-50%, -50%)" : `translate(-50%, -50%) rotate(${index * angleStep}deg) translateY(calc(-1 * var(--wheel-radius)))`,
                    }}
                  >
                    <div className="company-wheel-entry">
                      <button
                        type="button"
                        aria-label={`Read about ${company.name}`}
                        onClick={() => onSelectCompany?.(company)}
                        onPointerEnter={event => { if (event.pointerType === "mouse") setHoveredIndex(index); }}
                        onPointerLeave={() => setHoveredIndex(null)}
                        onFocus={event => { if (event.currentTarget.matches(":focus-visible")) focusCard(index); }}
                        onBlur={() => setHoveredIndex(null)}
                        className={`company-card-surface company-wheel-card ${isDimmed ? "opacity-30" : "opacity-100"}`}
                      >
                        <span className="card-number">{company.number ?? String(index + 1).padStart(2, "0")}</span>
                        <span className="card-caption"><span>{company.name}</span><FiArrowUpRight aria-hidden="true" /></span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  },
);

export default CompanyCardScroll;
