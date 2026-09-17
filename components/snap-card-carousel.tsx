"use client";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
interface Props {
  label: string; itemLabels: string[]; children: ReactNode;
  initialIndex?: number; onIndexChange?: (index: number) => void;
}
export default function SnapCardCarousel({ label, itemLabels, children, initialIndex = 0, onIndexChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [startIndex] = useState(initialIndex);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const changeRef = useRef(onIndexChange);
  useEffect(() => { changeRef.current = onIndexChange; }, [onIndexChange]);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const slides = Array.from(track.children) as HTMLElement[];
    const update = () => {
      frame = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0, distance = Infinity;
      slides.forEach((slide, index) => {
        const next = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
        if (next < distance) { distance = next; closest = index; }
      });
      setActiveIndex(closest);
      changeRef.current?.(closest);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const initial = slides[startIndex];
    if (initial) track.scrollLeft = initial.offsetLeft - (track.clientWidth - initial.offsetWidth) / 2;
    const observer = new ResizeObserver(onScroll);
    observer.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); track.removeEventListener("scroll", onScroll); };
  }, [startIndex, itemLabels.length]);
  const goTo = (index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return (
    <div className="snap-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={trackRef} className="snap-carousel-track" onKeyDown={event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const index = Math.max(0, Math.min(itemLabels.length - 1, activeIndex + (event.key === "ArrowRight" ? 1 : -1)));
        goTo(index);
        trackRef.current?.children[index]?.querySelector<HTMLElement>("a,button")?.focus({ preventScroll: true });
      }}>
        {Children.map(children, (child, index) => (
          <div className="snap-carousel-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${itemLabels.length}: ${itemLabels[index]}`}>{child}</div>
        ))}
      </div>
      {itemLabels.length > 1 && <div className="snap-carousel-pagination" aria-label={`${label} navigation`}>
        {itemLabels.map((title, index) => <button key={title} type="button" onClick={() => goTo(index)} aria-label={`Show ${title}`} aria-current={index === activeIndex ? "true" : undefined}><span aria-hidden="true" /></button>)}
      </div>}
    </div>
  );
}
