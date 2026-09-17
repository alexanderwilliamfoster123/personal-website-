"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ShaderMount,
  liquidMetalFragmentShader,
} from "@paper-design/shaders";
import { useTheme } from "./theme-provider";

interface AnimatedEnterButtonProps {
  onClick: () => void;
}

export default function AnimatedEnterButton({
  onClick,
}: AnimatedEnterButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const shaderRef = useRef<HTMLDivElement>(null);
  const shader = useRef<ShaderMount | null>(null);

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!shaderRef.current) return;

    shader.current = new ShaderMount(
      shaderRef.current,
      liquidMetalFragmentShader,
      {
        u_repetition: 4,
        u_softness: 0.5,
        u_shiftRed: 0.3,
        u_shiftBlue: 0.3,
        u_distortion: 0,
        u_contour: 0,
        u_angle: 45,
        u_scale: 8,
        u_shape: 1,
        u_offsetX: 0.1,
        u_offsetY: -0.1,
      },
      undefined,
      0.6
    );

    return () => {
      shader.current?.dispose();
      shader.current = null;
    };
  }, []);

  const handleMouseEnter = () => {
    setHovered(true);
    shader.current?.setSpeed(1);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setPressed(false);
    shader.current?.setSpeed(0.6);
  };

  const handleMouseDown = () => {
    setPressed(true);
  };

  const handleMouseUp = () => {
    setPressed(false);
  };

  return (
    <div className="relative inline-block">
      <div
        className="relative"
        style={{
          width: "142px",
          height: "46px",
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Outer animated border */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            borderRadius: "100px",
            overflow: "hidden",
            boxShadow: isDark
              ? hovered
                ? "0 0 0 1px rgba(0,0,0,0.4), 0 12px 6px rgba(0,0,0,0.05), 0 8px 5px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.15)"
                : "0 0 0 1px rgba(0,0,0,0.3), 0 20px 12px rgba(0,0,0,0.08), 0 9px 9px rgba(0,0,0,0.12), 0 2px 5px rgba(0,0,0,0.15)"
              : hovered
                ? "0 0 0 1px rgba(0,0,0,0.12), 0 10px 18px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04)"
                : "0 0 0 1px rgba(0,0,0,0.08), 0 8px 14px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)",
            transform: pressed
              ? "translateY(1px) scale(0.98)"
              : "translateY(0) scale(1)",
            transition:
              "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div
            ref={shaderRef}
            className="absolute inset-0"
            style={{
              width: "142px",
              height: "46px",
              borderRadius: "100px",
              overflow: "hidden",
            }}
          />
        </div>

        {/* Inner button */}
        <div
          className="absolute transition-colors duration-300"
          style={{
            top: "2px",
            left: "2px",
            width: "138px",
            height: "42px",
            borderRadius: "100px",
            background: isDark
              ? "linear-gradient(180deg, #202020 0%, #000000 100%)"
              : "linear-gradient(180deg, #FFFFFF 0%, #EAEAEA 100%)",
            transform: pressed
              ? "translateZ(10px) translateY(1px) scale(0.98)"
              : "translateZ(10px)",
            boxShadow: isDark
              ? pressed
                ? "inset 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(0,0,0,0.3)"
                : "none"
              : pressed
                ? "inset 0 2px 4px rgba(0,0,0,0.12), inset 0 1px 2px rgba(0,0,0,0.06)"
                : "inset 0 1px 1px rgba(255,255,255,1), 0 1px 2px rgba(0,0,0,0.06)",
            border: isDark ? "none" : "0.5px solid rgba(0,0,0,0.08)",
            transition:
              "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />

        {/* Text */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: "translateZ(20px)",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          <span
            className="transition-colors duration-300"
            style={{
              fontFamily: '"Neue Montreal", sans-serif',
              fontSize: "15px",
              fontWeight: 400,
              color: isDark ? "#ffffff" : "#111111",
              textShadow: isDark
                ? "0 1px 2px rgba(0,0,0,0.5)"
                : "0 1px 0 rgba(255,255,255,0.8)",
              letterSpacing: "0.01em",
            }}
          >
            Enter
          </span>
        </div>

        {/* Actual clickable button */}
        <button
          type="button"
          aria-label="Enter"
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="absolute inset-0 cursor-pointer"
          style={{
            zIndex: 40,
            width: "142px",
            height: "46px",
            border: "none",
            outline: "none",
            background: "transparent",
            borderRadius: "100px",
          }}
        />
      </div>
    </div>
  );
}