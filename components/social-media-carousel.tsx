"use client";

import * as React from "react";
import { FiArrowLeft } from "react-icons/fi";
import {
    motion,
    useMotionValue,
    useTransform,
    animate,
    AnimatePresence,
    type PanInfo,
    type MotionValue,
} from "framer-motion";
// import {
//   FaInstagram,
//   FaLinkedin,
//   FaXTwitter,
//   FaYoutube,
//   FaGithub,
// } from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";
import { useTheme } from "@/components/theme-provider";

export interface SocialCard {
    title: string;
    username: string;
    href: string;
    image?: string;
    icon?: React.ReactNode;
}

interface SocialMediaCarouselProps {
    cards: SocialCard[];
    onClose: () => void;
}

interface CarouselConfig {
    distanceDivisor: number;
    velocityDivisor: number;
    sensitivity: number;
    xMultiplier: number;
    yMultiplier: number;
    rotationMultiplier: number;
    scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
    if (width < 640) {
        return {
            distanceDivisor: 120,
            velocityDivisor: 500,
            sensitivity: 180,
            xMultiplier: 75,
            yMultiplier: 16,
            rotationMultiplier: 8,
            scaleReduction: 0.06,
        };
    }
    if (width < 1024) {
        return {
            distanceDivisor: 160,
            velocityDivisor: 650,
            sensitivity: 220,
            xMultiplier: 105,
            yMultiplier: 24,
            rotationMultiplier: 10,
            scaleReduction: 0.09,
        };
    }
    return {
        distanceDivisor: 200,
        velocityDivisor: 800,
        sensitivity: 250,
        xMultiplier: 135,
        yMultiplier: 32,
        rotationMultiplier: 12,
        scaleReduction: 0.12,
    };
};

import SocialMediaStackScroll from "./social-media-stack-scroll";

export default function SocialMediaCarousel({
    cards,
    onClose,
}: SocialMediaCarouselProps) {
    const scrollProgress = useMotionValue(0);
    const startProgress = React.useRef(0);
    const [windowWidth, setWindowWidth] = React.useState(0);

    const total = cards.length;

    React.useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const config = React.useMemo(
        () => getCarouselConfig(windowWidth || (typeof window !== "undefined" ? window.innerWidth : 1200)),
        [windowWidth]
    );

    const handleDragStart = () => {
        scrollProgress.stop();
        startProgress.current = scrollProgress.get();
    };

    const handleDragEnd = (
        _: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => {
        const dragDistance = info.offset.x;
        const velocity = info.velocity.x;

        const distanceShift = -dragDistance / config.distanceDivisor;
        const velocityShift = -velocity / config.velocityDivisor;

        let totalShift = Math.round(distanceShift + velocityShift);
        totalShift = Math.max(-3, Math.min(3, totalShift));

        const target = Math.round(startProgress.current) + totalShift;

        animate(scrollProgress, target, {
            type: "spring",
            stiffness: 180,
            damping: 24,
            mass: 0.8,
        });
    };

    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <AnimatePresence mode="wait">
            {/* Mobile View: Skiper 16 Sticky Card Stack Scroll */}
            <div key="mobile-social-stack-container" className="block sm:hidden">
                <SocialMediaStackScroll cards={cards} onClose={onClose} />
            </div>

            {/* Desktop View: 3D Horizontal Perspective Carousel */}
            <motion.div
                key="desktop-social-carousel-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden sm:flex fixed inset-0 z-50 flex-col justify-between overflow-hidden select-none px-6 py-8 sm:px-10 sm:py-10 transition-colors duration-300"
                style={{
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                }}
            >
                {/* Top Header Row */}

                {/* Screen-Wide Pan Surface: Drag anywhere (whitespace, upwards, downwards, sidewards, and images) */}
                <motion.div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
                    onPanStart={handleDragStart}
                    onPan={(_, info) => {
                        const delta = -info.delta.x / config.sensitivity;
                        scrollProgress.set(scrollProgress.get() + delta);
                    }}
                    onPanEnd={handleDragEnd}
                >
                    {/* Text above social media carousel */}
                    <div
                        className="mb-8 sm:mb-12 text-[13px] leading-[1.5] font-medium text-foreground whitespace-nowrap select-none tracking-tight pointer-events-none z-20"
                        style={{
                            fontFamily: '"Neue Montreal", sans-serif',
                        }}
                    >
                        social media.
                    </div>

                    {/* Centered Cards Container */}
                    <div className="relative w-full max-w-6xl h-64 sm:h-80 lg:h-96 flex items-center justify-center pointer-events-none">
                        {cards.map((card, i) => (
                            <Card
                                key={`social-carousel-card-${card.title}-${i}`}
                                card={card}
                                index={i}
                                total={total}
                                progress={scrollProgress}
                                config={config}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Bottom Spacer to balance top header */}
                <div className="h-6 pointer-events-none" />
            </motion.div>
        </AnimatePresence>
    );
}

interface CardProps {
    card: SocialCard;
    index: number;
    total: number;
    progress: MotionValue<number>;
    config: CarouselConfig;
}



const Card = ({ card, index, total, progress, config }: CardProps) => {
    const offset = useTransform(progress, (p) => {
        let diff = (index - p) % total;
        while (diff > total / 2) diff -= total;
        while (diff < -total / 2) diff += total;
        return diff;
    });

    const x = useTransform(offset, (o) => o * config.xMultiplier);
    const rotate = useTransform(offset, (o) => o * config.rotationMultiplier);
    const y = useTransform(offset, (o) => Math.abs(o) * config.yMultiplier);
    const scale = useTransform(
        offset,
        (o) => Math.max(0.72, 1 - Math.abs(o) * config.scaleReduction)
    );
    const opacity = useTransform(
        offset,
        [-total / 2, -total / 2 + 0.6, 0, total / 2 - 0.6, total / 2],
        [0, 1, 1, 1, 0]
    );
    const zIndex = useTransform(offset, (o) =>
        Math.round(50 - Math.abs(o) * 2)
    );

    const { theme } = useTheme();
    const isDark = theme === "dark";
    return (
        <motion.div
            style={{
                x,
                rotate,
                y,
                scale,
                opacity,
                zIndex,
                borderRadius: "14px",
                border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid var(--card-stroke, #EAEAEA)",
                background: isDark
                    ? "linear-gradient(180deg, var(--100, #141414) 0%, var(--300, #0a0a0a) 100%)"
                    : "linear-gradient(180deg, var(--2000, #FFFFFF) 0%, var(--1800, #F3F3F3) 100%)",
                boxShadow: isDark
                    ? "0 8px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)"
                    : "0 8px 32px 0 rgba(0, 0, 0, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
            className={`
        absolute
        overflow-hidden
        pointer-events-none
        w-40
        h-48
        sm:w-44
        sm:h-64
        lg:w-52
        lg:h-68
        ${isDark ? "bg-[#141414]" : "bg-[#f7f7f7]"}
      `}
        >
            {/* Top Left Social Icon Badge */}
            <div
                className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex h-8 w-8  items-center justify-center rounded-xl transition-colors ${
                    isDark ? "bg-white/10 text-white" : "bg-black/5 text-[#111]"
                }`}
            >
                {card.icon}
            </div>

            {/* Bottom Card Info & Action Link */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-end justify-between">
                <div className="flex flex-col items-start text-left">
                    <motion.p
                        style={{
                            opacity: useTransform(offset, [-0.85, 0, 0.85], [0, 1, 0]),
                            fontFamily: '"Neue Montreal", sans-serif',
                        }}
                        className={`text-[14px] font-medium leading-tight  drop-shadow-sm ${
                            isDark ? "text-white" : "text-black"
                        }`}
                    >
                        {card.title}
                    </motion.p>
                    <motion.p
                        style={{
                            opacity: useTransform(offset, [-0.85, 0, 0.85], [0, 1, 0]),
                            fontFamily: '"Neue Montreal", sans-serif',
                        }}
                        className={`text-[10px] sm:text-[11px] font-normal mt-0.5 ${
                            isDark ? "text-white/50" : "text-black/50"
                        }`}
                    >
                        {card.username}
                    </motion.p>
                </div>

                {/* Link Button */}
                <motion.a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        opacity: useTransform(offset, [-0.85, 0, 0.85], [0, 1, 0]),
                    }}
                    className={`pointer-events-auto flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
                        isDark
                            ? "bg-white/10 text-white hover:bg-white hover:text-black"
                            : "bg-black/5 text-black hover:bg-black hover:text-white"
                    }`}
                >
                    <FiArrowUpRight size={13} />
                </motion.a>
            </div>
        </motion.div>
    );
};