"use client";

import {
  AnimatePresence, motion, useMotionValue, useSpring, useTransform,
  type HTMLMotionProps, type MotionValue, type SpringOptions,
} from "framer-motion";
import {
  Children, cloneElement, createContext, isValidElement, useContext,
  useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;
const DEFAULT_SPRING: SpringOptions = { mass: .1, stiffness: 150, damping: 12 };

type DockProps = {
  children: ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
  "aria-label"?: string;
};
type DockContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  canMagnify: boolean;
};
type DockChildMotion = { width?: MotionValue<number>; isHovered?: MotionValue<number> };
type DockChildProps = DockChildMotion & { className?: string; children: ReactNode };
type DockItemProps = Omit<HTMLMotionProps<"button">, "children"> & { children: ReactNode };

const DockContext = createContext<DockContextType | undefined>(undefined);
function useDock() {
  const context = useContext(DockContext);
  if (!context) throw new Error("Dock components must be inside a Dock.");
  return context;
}

function Dock({
  children, className, spring = DEFAULT_SPRING,
  magnification = DEFAULT_MAGNIFICATION, distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT, "aria-label": label = "Application dock",
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const pointerInside = useRef(false);
  const canMagnify = useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  const maxHeight = useMemo(() => Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4), [magnification]);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);
  const context = useMemo(() => ({ mouseX, spring, distance, magnification, canMagnify }), [mouseX, spring, distance, magnification, canMagnify]);

  useEffect(() => { if (!canMagnify) mouseX.set(Infinity); }, [canMagnify, mouseX]);

  return <motion.div className="apple-dock-viewport" style={{ height: canMagnify ? height : heightRow, scrollbarWidth: "none" }}>
    <motion.nav
      className={cn("apple-dock-panel", className)}
      style={{ height: panelHeight }}
      aria-label={label}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        pointerInside.current = true;
        isHovered.set(1);
        // Match the viewport coordinates returned by getBoundingClientRect.
        mouseX.set(canMagnify ? event.clientX : Infinity);
      }}
      onPointerLeave={(event) => {
        pointerInside.current = false;
        mouseX.set(Infinity);
        isHovered.set(event.currentTarget.querySelector(":focus-visible") ? 1 : 0);
      }}
      onFocusCapture={() => isHovered.set(1)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget) && !pointerInside.current) isHovered.set(0);
      }}
    >
      <DockContext.Provider value={context}>{children}</DockContext.Provider>
    </motion.nav>
  </motion.div>;
}

function DockItem({ children, className, onFocus, onBlur, ...props }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const keyboardFocus = useRef(false);
  const { distance, magnification, mouseX, spring, canMagnify } = useDock();
  const isHovered = useMotionValue(0);
  const mouseDistance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect();
    return bounds ? value - bounds.x - bounds.width / 2 : Infinity;
  });
  const widthTransform = useTransform(mouseDistance, [-distance, 0, distance], [40, magnification, 40]);
  const width = useSpring(widthTransform, spring);

  return <motion.button
    {...props}
    ref={ref}
    type="button"
    style={{ width: canMagnify ? width : 40 }}
    className={cn("apple-dock-item", className)}
    onHoverStart={() => isHovered.set(1)}
    onHoverEnd={() => { if (!keyboardFocus.current) isHovered.set(0); }}
    onFocus={(event) => {
      keyboardFocus.current = event.currentTarget.matches(":focus-visible");
      if (keyboardFocus.current) isHovered.set(1);
      onFocus?.(event);
    }}
    onBlur={(event) => { keyboardFocus.current = false; isHovered.set(0); onBlur?.(event); }}
  >
    {Children.map(children, (child) => isValidElement<DockChildMotion>(child)
      ? cloneElement(child, { width: canMagnify ? width : widthTransform, isHovered })
      : child)}
  </motion.button>;
}

function DockLabel({ children, className, isHovered }: DockChildProps) {
  const { canMagnify } = useDock();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => isHovered?.on("change", (value) => setIsVisible(value === 1)), [isHovered]);

  return <AnimatePresence>
    {isVisible && <motion.span
      initial={{ opacity: 0, y: canMagnify ? 0 : -10 }}
      animate={{ opacity: 1, y: -10 }}
      exit={{ opacity: 0, y: canMagnify ? 0 : -10 }}
      transition={{ duration: canMagnify ? .2 : 0 }}
      className={cn("apple-dock-label", className)}
      role="tooltip"
      style={{ x: "-50%" }}
    >{children}</motion.span>}
  </AnimatePresence>;
}

function DockIcon({ children, className, width }: DockChildProps) {
  const fallbackWidth = useMotionValue(40);
  const iconWidth = useTransform(width ?? fallbackWidth, (value) => value / 2);
  return <motion.span className={cn("apple-dock-icon", className)} style={{ width: iconWidth }} aria-hidden="true">{children}</motion.span>;
}

export { Dock, DockIcon, DockItem, DockLabel };
