"use client";

import React, { memo, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { useTheme } from "@/components/theme-provider";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query);
    }
    return defaultValue;
  });

  const handleChange = () => {
    setMatches(getMatches(query));
  };

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query);
    handleChange();

    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

export interface FramePhoto {
  id: string;
  image: string;
  title: string;
  location: string;
  date: string;
}

export const defaultFrames: FramePhoto[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80",
    title: "Web Summit 2025",
    location: "Lisbon",
    date: "Nov 2025",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    title: "Dark Flow Abstract",
    location: "San Francisco",
    date: "May 2025",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    title: "Quiet Terrains",
    location: "Dolomites",
    date: "Jan 2025",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80",
    title: "Coastline Monolith",
    location: "Faroe Islands",
    date: "Aug 2024",
  },
  {
    id: "5",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    title: "Misty Alpine Ridge",
    location: "Swiss Alps",
    date: "Feb 2024",
  },
  {
    id: "6",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    title: "Monochrome Geometry",
    location: "Berlin",
    date: "Oct 2023",
  },
  {
    id: "7",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    title: "Concrete Reflections",
    location: "London",
    date: "Jun 2023",
  },
  {
    id: "8",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    title: "Metropolis High-Rise",
    location: "Tokyo",
    date: "Apr 2023",
  },
];

const duration = 0.15;
const transition = { duration, ease: [0.32, 0.72, 0, 1] as any, filter: "blur(4px)" };
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as any };

interface CarouselProps {
  handleClick: (frame: FramePhoto, index: number) => void;
  controls: any;
  frames: FramePhoto[];
  isCarouselActive: boolean;
  rotation: any;
}

const Carousel = memo(
  ({
    handleClick,
    controls,
    frames,
    isCarouselActive,
    rotation,
  }: CarouselProps) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)");
    const cylinderWidth = isScreenSizeSm ? 1350 : 2300;
    const faceCount = frames.length;
    const faceWidth = cylinderWidth / faceCount;
    const radius = cylinderWidth / (2 * Math.PI);

    const { theme } = useTheme();
    const isDark = theme === "dark";

    const transform = useTransform(
      rotation,
      (value: number) => `rotate3d(0, 1, 0, ${value}deg)`
    );

    return (
      <div
        className="flex h-full items-center justify-center select-none"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
            touchAction: "pan-y",
            willChange: "transform",
          }}
          onPanStart={() => {
            controls.stop();
          }}
          onPan={(_, info) => {
            if (isCarouselActive) {
              rotation.set(rotation.get() + info.delta.x * (isScreenSizeSm ? 0.28 : 0.20));
            }
          }}
          onPanEnd={(_, info) => {
            if (isCarouselActive) {
              controls.start({
                rotateY: rotation.get() + info.velocity.x * 0.035,
                transition: {
                  type: "spring",
                  stiffness: 85,
                  damping: 22,
                  mass: 0.2,
                },
              });
            }
          }}
          animate={controls}
        >
          {frames.map((frame, i) => (
            <div
              key={`key-${frame.id}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center p-2.5"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
                transformStyle: "preserve-3d",
              }}
              onClick={() => handleClick(frame, i)}
            >
              <div
                className={`group relative w-full overflow-hidden rounded-2xl border cursor-pointer transition-transform duration-300 hover:scale-105 ${
                  isDark
                    ? "border-white/10 bg-[#141414]"
                    : "border-black/5 bg-[#f7f7f7]"
                }`}
              >
                <img
                  src={frame.image}
                  alt={frame.title}
                  className="pointer-events-none w-full h-[160px] sm:h-[185px] md:h-[210px] object-cover transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }
);

Carousel.displayName = "Carousel";

// Linear style animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
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

interface FramesGalleryViewProps {
  onBack: () => void;
  frames?: FramePhoto[];
}

export default function FramesGalleryView({
  onBack,
  frames = defaultFrames,
}: FramesGalleryViewProps) {
  const [activeFrame, setActiveFrame] = useState<FramePhoto | null>(null);
  const [isCarouselActive, setIsCarouselActive] = useState(true);
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const faceCount = frames.length;

  useEffect(() => {
    const anglePerFace = 360 / faceCount;
    const unsubscribe = rotation.on("change", (latest) => {
      const normalized = ((-latest % 360) + 360) % 360;
      const index = ((Math.round(normalized / anglePerFace) % faceCount) + faceCount) % faceCount;
      setActiveIndex((prev) => (prev !== index ? index : prev));
    });
    return () => unsubscribe();
  }, [rotation, faceCount]);

  const isScreenSizeSm = useMediaQuery("(max-width: 640px)");

  const currentCenteredFrame = frames[activeIndex] || frames[0];

  const handleClick = (frame: FramePhoto) => {
    setActiveFrame(frame);
    setIsCarouselActive(false);
    controls.stop();
  };

  const handleClose = () => {
    setActiveFrame(null);
    setIsCarouselActive(true);
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="relative flex min-h-dvh w-full flex-col justify-between overflow-hidden px-0 py-8 sm:px-10 sm:py-10 select-none transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Header */}

      {/* Center 3D Carousel Section - Screen-Wide Pan Surface */}
      <motion.div
        variants={linearItemVariants}
        className="my-auto flex flex-1 flex-col items-center justify-center py-4 w-full touch-pan-y cursor-grab active:cursor-grabbing"
        onPanStart={() => {
          controls.stop();
        }}
        onPan={(_, info) => {
          if (isCarouselActive) {
            rotation.set(rotation.get() + info.delta.x * (isScreenSizeSm ? 0.28 : 0.20));
          }
        }}
        onPanEnd={(_, info) => {
          if (isCarouselActive) {
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.035,
              transition: {
                type: "spring",
                stiffness: 85,
                damping: 22,
                mass: 0.2,
              },
            });
          }
        }}
      >
        <div className="relative h-[260px] sm:h-[300px] md:h-[340px] w-full flex items-center justify-center overflow-hidden">
          <Carousel
            handleClick={handleClick}
            controls={controls}
            frames={frames}
            isCarouselActive={isCarouselActive}
            rotation={rotation}
          />
        </div>

        {/* Dynamic Caption below Carousel */}
        <motion.div
          key={currentCenteredFrame.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 flex flex-col items-center text-center px-6 sm:px-0"
        >
          <h2
            className="text-sm sm:text-base font-medium  tracking-tight"
            style={{
              fontFamily: '"Neue Montreal", sans-serif',
              color:"var(--text-primary)"
            }}
          >
            {currentCenteredFrame.title}
          </h2>
          <p
            className="mt-1 text-xs  font-normal"
            style={{
              fontFamily: '"Neue Montreal", sans-serif',
               color:"var(--text-secondary)"
            }}
          >
            {currentCenteredFrame.location} · {currentCenteredFrame.date}
          </p>
        </motion.div>
      </motion.div>

      {/* Expanded Modal Overlay */}
      <AnimatePresence mode="sync">
        {activeFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layoutId={`img-container-${activeFrame.image}`}
            onClick={handleClose}
            className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 sm:p-6 pb-20 sm:pb-24 ${
              isDark ? "bg-black/90" : "bg-white/90"
            }`}
            transition={transitionOverlay}
          >
            <button
              onClick={handleClose}
              className={`absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                isDark
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-black/10 text-black hover:bg-black/20"
              }`}
            >
              <FiX size={20} />
            </button>

            <div
              className={`relative max-h-[75dvh] max-w-[88vw] sm:max-w-md md:max-w-lg lg:max-w-xl overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col ${
                isDark ? "border-white/10" : "border-black/5"
              }`}
            >
              <motion.img
                layoutId={`img-${activeFrame.image}`}
                src={activeFrame.image}
                alt={activeFrame.title}
                className="max-h-[65dvh] sm:max-h-[62dvh] w-auto object-contain rounded-t-2xl sm:rounded-t-3xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1] as any,
                }}
              />
              <div
                className={`p-3.5 sm:p-4 text-center shrink-0 ${
                  isDark ? "bg-[#141414]" : "bg-[#f7f7f7]"
                }`}
              >
                <h3
                  className={`text-sm sm:text-base font-semibold ${
                    isDark ? "text-white" : "text-[#111]"
                  }`}
                  style={{ fontFamily: '"Neue Montreal", sans-serif' }}
                >
                  {activeFrame.title}
                </h3>
                <p
                  className={`text-[11px] sm:text-xs mt-0.5 ${
                    isDark ? "text-white/50" : "text-[#555]"
                  }`}
                  style={{ fontFamily: '"Neue Montreal", sans-serif' }}
                >
                  {activeFrame.location} · {activeFrame.date}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
