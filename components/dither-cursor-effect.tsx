// "use client";

// import { useEffect, useRef } from "react";

// interface DitherCursorProps {
//   dotSize?: number;
//   spacing?: number;
//   radius?: number;
//   intensity?: number;
//   color?: string;
// }

// export default function DitherCursor({
//   dotSize = 1.2,
//   spacing = 7,
//   radius = 220,
//   intensity = 0.9,
//   color = "255,255,255",
// }: DitherCursorProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;

//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");

//     if (!ctx) return;

//     let animationFrame = 0;
//     let width = 0;
//     let height = 0;
//     let dpr = 1;

//     const mouse = {
//       x: -1000,
//       y: -1000,
//       targetX: -1000,
//       targetY: -1000,
//     };

//     const resize = () => {
//       dpr = Math.min(window.devicePixelRatio || 1, 2);

//       width = window.innerWidth;
//       height = window.innerHeight;

//       canvas.width = width * dpr;
//       canvas.height = height * dpr;

//       canvas.style.width = `${width}px`;
//       canvas.style.height = `${height}px`;

//       ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
//     };

//     const handleMouseMove = (event: MouseEvent) => {
//       mouse.targetX = event.clientX;
//       mouse.targetY = event.clientY;
//     };

//     const handleMouseLeave = () => {
//       mouse.targetX = -1000;
//       mouse.targetY = -1000;
//     };

//     const handleTouch = () => {
//       mouse.targetX = -1000;
//       mouse.targetY = -1000;
//     };

//     const prefersReducedMotion = window.matchMedia(
//       "(prefers-reduced-motion: reduce)"
//     ).matches;

//     if (prefersReducedMotion) {
//       return;
//     }

//     resize();

//     window.addEventListener("resize", resize);
//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseleave", handleMouseLeave);
//     window.addEventListener("touchstart", handleTouch, { passive: true });

//     const render = () => {
//       mouse.x += (mouse.targetX - mouse.x) * 0.12;
//       mouse.y += (mouse.targetY - mouse.y) * 0.12;

//       ctx.clearRect(0, 0, width, height);

//       /*
//        * Only render around the cursor.
//        */
//       const startX =
//         Math.floor((mouse.x - radius) / spacing) * spacing;

//       const endX =
//         Math.ceil((mouse.x + radius) / spacing) * spacing;

//       const startY =
//         Math.floor((mouse.y - radius) / spacing) * spacing;

//       const endY =
//         Math.ceil((mouse.y + radius) / spacing) * spacing;

//       for (let x = startX; x <= endX; x += spacing) {
//         for (let y = startY; y <= endY; y += spacing) {
//           const dx = x - mouse.x;
//           const dy = y - mouse.y;

//           const distance = Math.sqrt(dx * dx + dy * dy);

//           if (distance > radius) continue;

//           /*
//            * Smooth falloff from cursor.
//            */
//           const falloff = 1 - distance / radius;

//           /*
//            * Dither/noise pattern.
//            *
//            * This creates alternating dots instead of
//            * one solid radial glow.
//            */
//           const noise =
//             Math.sin(x * 0.17 + y * 0.13) *
//               0.5 +
//             0.5;

//           const pattern =
//             Math.sin(x * 0.75 + y * 0.42) >
//             0
//               ? 1
//               : 0;

//           const alpha =
//             falloff *
//             falloff *
//             intensity *
//             (0.25 + noise * 0.45) *
//             (0.35 + pattern * 0.65);

//           if (alpha <= 0.01) continue;

//           /*
//            * Slightly larger dots near the cursor.
//            */
//           const size =
//             dotSize +
//             falloff * 1.2;

//           ctx.fillStyle = `rgba(${color}, ${alpha})`;

//           ctx.fillRect(
//             x - size / 2,
//             y - size / 2,
//             size,
//             size
//           );
//         }
//       }

//       animationFrame = requestAnimationFrame(render);
//     };

//     render();

//     return () => {
//       cancelAnimationFrame(animationFrame);

//       window.removeEventListener("resize", resize);
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseleave", handleMouseLeave);
//       window.removeEventListener(
//         "touchstart",
//         handleTouch
//       );
//     };
//   }, [color, dotSize, spacing, radius, intensity]);

//   return (
//     <canvas
//       ref={canvasRef}
//       aria-hidden="true"
//       className="
//         pointer-events-none
//         fixed
//         inset-0
//         z-0
//         h-full
//         w-full
//       "
//     />
//   );
// }