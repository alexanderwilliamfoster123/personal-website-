"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

interface Pixel {
  x: number;
  y: number;
  opacity: number;
  age: number;
}

const PIXEL_SIZE = 12;
const TRAIL_LENGTH = 40;
const FADE_SPEED = 0.04;

export function PixelCursorTrail() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const lastPosRef = useRef({ x: -100, y: -100 });
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > PIXEL_SIZE) {
        pixelsRef.current.push({
          x,
          y,
          opacity: 1,
          age: 0,
        });

        if (pixelsRef.current.length > TRAIL_LENGTH) {
          pixelsRef.current.shift();
        }

        lastPosRef.current = { x, y };
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const isCurrentDark = isDarkRef.current;
      const fillColor = isCurrentDark ? "255, 255, 255" : "17, 17, 17";

      for (let i = 0; i < pixelsRef.current.length; i++) {
        const pixel = pixelsRef.current[i];
        pixel.opacity -= FADE_SPEED;
        pixel.age += 1;

        if (pixel.opacity > 0) {
          const sizeMultiplier = Math.max(0.3, 1 - pixel.age / 100);
          const currentSize = PIXEL_SIZE * sizeMultiplier;

          ctx.fillStyle = `rgba(${fillColor}, ${Math.max(0, pixel.opacity)})`;
          ctx.fillRect(
            pixel.x - currentSize / 2,
            pixel.y - currentSize / 2,
            currentSize,
            currentSize
          );
        }
      }

      pixelsRef.current = pixelsRef.current.filter((p) => p.opacity > 0);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}