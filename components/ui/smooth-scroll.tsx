"use client";

import React, { forwardRef } from "react";
import { ReactLenis } from "lenis/react";

interface SmoothScrollProps {
  children?: React.ReactNode;
  options?: {
    lerp?: number;
    duration?: number;
    smoothWheel?: boolean;
    wheelMultiplier?: number;
    touchMultiplier?: number;
  };
}

const SmoothScroll = forwardRef<HTMLElement, SmoothScrollProps>(
  ({ children, options }, ref) => {
    return (
      <ReactLenis
        root
        options={{
          lerp: 0.08,
          duration: 1.2,
          smoothWheel: true,
          ...options,
        }}
      >
        <div ref={ref as any}>{children}</div>
      </ReactLenis>
    );
  }
);

SmoothScroll.displayName = "SmoothScroll";

export default SmoothScroll;
