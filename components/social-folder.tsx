"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import FolderIcon from "@/components/svg/folderSvg";
import DarkFolderIcon from "@/components/svg/folderDark";

interface FolderCard {
    title: string;
    description?: string;
    href?: string;
    username?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

interface SocialFolderProps {
    title: string;
    cards: FolderCard[];
    isOpen?: boolean;
    onFrontClick?: () => void;
    className?: string;
}

export default function SocialFolder({
    title,
    cards,
    isOpen,
    onFrontClick,
    className,
}: SocialFolderProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.div
            initial="closed"
            animate={isOpen ? "open" : undefined}
            whileHover="open"
            className={`group relative h-[220px] w-[260px] select-none scale-80 origin-center ${className || ""}`}
            style={{ perspective: "1200px" }}
        >
            {/* =========================
          CARDS BEHIND FOLDER
      ========================== */}

            {cards.map((card, index) => {
                const getOpenPosition = (idx: number, total: number) => {
                    if (total === 1) return { x: 0, y: -25, rotate: 0 };
                    if (total === 2) {
                        const xOffsets = [-30, 30];
                        const rotations = [-6, 6];
                        return {
                            x: xOffsets[idx] ?? 0,
                            y: -22,
                            rotate: rotations[idx] ?? 0,
                        };
                    }
                    if (total === 3) {
                        const xOffsets = [-55, 0, 55];
                        const yOffsets = [-15, -25, -15];
                        const rotations = [-12, 0, 12];
                        return {
                            x: xOffsets[idx] ?? 0,
                            y: yOffsets[idx] ?? -20,
                            rotate: rotations[idx] ?? 0,
                        };
                    }
                    const factor = (idx - (total - 1) / 2) / (total - 1);
                    const x = factor * 130;
                    const y = -25 + Math.abs(factor) * 18;
                    const rotate = factor * 26;
                    return { x, y, rotate };
                };

                const getClosedPosition = (idx: number, total: number) => {
                    if (total === 2) {
                        const closedX = idx === 0 ? 8 : 0;
                        const closedY = idx === 0 ? 12 : 8;
                        const closedRotate = idx === 0 ? -1 : -5;
                        return { x: closedX, y: closedY, rotate: closedRotate };
                    }
                    const closedX = (total - 1 - idx) * 6;
                    const closedY = 8 + (total - 1 - idx) * 4;
                    const rotations = [-1, -5, -9, -13];
                    const closedRotate = rotations[idx] !== undefined ? rotations[idx] : -3 * (idx + 1);
                    return { x: closedX, y: closedY, rotate: closedRotate };
                };

                const position = getOpenPosition(index, cards.length);
                const closedPosition = getClosedPosition(index, cards.length);

                return (
                    <motion.a
                        key={card.title + index}
                        href={card.href && card.href !== "#" ? card.href : undefined}
                        target={card.href && card.href !== "#" ? "_blank" : undefined}
                        rel="noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (card.onClick) {
                                e.preventDefault();
                                card.onClick();
                            }
                        }}
                        variants={{
                            closed: {
                                x: closedPosition.x,
                                y: closedPosition.y,
                                rotate: closedPosition.rotate,
                                scale: 0.95,
                                filter: "blur(0px)",
                            },
                            open: {
                                x: position.x,
                                y: position.y,
                                rotate: position.rotate,
                                scale: 1,
                                filter: "blur(0px)",
                            },
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 220,
                            damping: 18,
                            mass: 0.8,
                        }}
                        className="
              absolute
              left-1/2
              top-[20px]
              -translate-x-1/2
            "
                        style={{
                            display: "flex",
                            width: "120px",
                            height: "130px",
                            padding: "11.1px",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexShrink: 0,
                            borderRadius: "12px",
                            border: "1px solid transparent",
                            background: isDark
                                ? "var(--dark-card-fill, linear-gradient(180deg, var(--card-card-fill-1, #1A1A1A) 0%, var(--card-card-fill-2, #0D0D0D) 100%)) padding-box, var(--card-stroke) border-box"
                                : "var(--dark-card-fill, linear-gradient(180deg, var(--card-card-fill-1, #FFF) 0%, var(--card-card-fill-2, #EAEAEA) 100%)) padding-box, linear-gradient(var(--card-stroke, #EAEAEA), var(--card-stroke, #EAEAEA)) border-box",
                            boxShadow:
                                "0 4px 4px 0 var(--button-shadow-1, rgba(0, 0, 0, 0.03)), 6px 80px 80px 0 rgba(255, 255, 255, 0.01) inset, 0 -1px 1px 0 rgba(255, 255, 255, 0.10) inset, 0 1px 1px 0 rgba(255, 255, 255, 0.10) inset",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            transformOrigin: "bottom center",
                            zIndex: 15 - index,
                        }}
                    >
                        {/* Icon at top right */}
                        <div
                            className="flex w-full justify-end"
                            style={{ color: isDark ? "#FFFFFF" : "#111111" }}
                        >
                            {card.icon}
                        </div>

                        {/* Title and Username at bottom */}
                        <div className="flex flex-col items-start w-full">
                            <span
                                className="text-[11px] font-normal tracking-tight"
                                style={{
                                    fontFamily: '"Neue Montreal", sans-serif',
                                    color: isDark ? "#FFFFFF" : "#111111",
                                }}
                            >
                                {card.title}
                            </span>
                            {card.username && (
                                <span
                                    className="text-[9px] mt-0.5"
                                    style={{
                                        fontFamily: '"Neue Montreal", sans-serif',
                                        color: isDark ? "#9c9c9c" : "#707070",
                                    }}
                                >
                                    {card.username}
                                </span>
                            )}
                        </div>
                    </motion.a>
                );
            })}

            {/* =========================
          BACK OF FOLDER (FolderIcon for Light / DarkFolderIcon for Dark)
      ========================== */}
            <div
                className="
                  absolute
                  left-[8%]
                  top-[50px]
                  z-[1]
                  w-[84%]
                  h-[200px]
                  overflow-hidden
                "
            >
                {isDark ? <DarkFolderIcon /> : <FolderIcon />}
            </div>

            {/* =========================
                AMBIENT SHADOW BELOW FOLDER (Bottom Only)
            ========================== */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    -translate-x-1/2
                    -bottom-[25px]
                    w-[84%]
                    h-[38px]
                    rounded-[50%]
                    blur-md
                    transition-all
                    duration-300
                    z-0
                "
                style={{
                    background: isDark
                        ? `radial-gradient(
                            ellipse at center,
                            rgba(0, 0, 0, 0.90) 0%,
                            rgba(0, 0, 0, 0.40) 50%,
                            transparent 75%
                        )`
                        : `radial-gradient(
                            ellipse at center,
                            rgba(0, 0, 0, 0.16) 0%,
                            rgba(0, 0, 0, 0.05) 50%,
                            transparent 75%
                        )`,
                }}
            />

            {/* =========================
          FRONT OF FOLDER
      ========================== */}

            <motion.div
                onClick={(e) => {
                    e.stopPropagation();
                    onFrontClick?.();
                }}
                variants={{
                    closed: {
                        y: 0,
                        rotateX: 0,
                    },
                    open: {
                        y: 0,
                        rotateX: -10,
                    },
                }}
                transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 20,
                }}
                className="
          absolute
          bottom-0
          left-0
          z-20
          h-[105px]
          w-full    
          px-5
          py-6
          cursor-pointer
        "
                style={{
                    transformOrigin: "bottom center",
                    borderRadius: "12px",
                    boxSizing: "border-box",

                    border: isDark
                        ? "1.143px solid transparent"
                        : "1.143px solid var(--Neutral-50-10, rgba(0, 0, 0, 0.10))",

                    background: isDark
                        ? "var(--folder-linear, linear-gradient(180deg, var(--300, #272727) 0%, var(--100, #0D0D0D) 100%)) padding-box, var(--card-stroke, linear-gradient(180deg, var(--stroke-1, #343434) 0%, var(--stroke-2, #1A1A1A) 100%)) border-box"
                        : "linear-gradient(180deg, var(--2000, #FFF) 0%, var(--1600, #D0D0D0) 100%) padding-box",

                    boxShadow: isDark
                        ? "0 2px 10px 0 rgba(255, 255, 255, 0.08) inset"
                        : "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.85)",
                }}
            >
                {/* Gradient line */}
                <div
                    className="
            absolute
            left-1/2
            top-[24px]
            h-px
            w-[80%]
            -translate-x-1/2
          "
                    style={{
                        background: isDark
                            ? "linear-gradient(90deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.30) 50%, rgba(255, 255, 255, 0.00) 100%)"
                            : "linear-gradient(90deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.12) 50%, rgba(0, 0, 0, 0.00) 100%)",
                        boxShadow: isDark
                            ? "0 1px 0 rgba(0, 0, 0, 0.50)"
                            : "0 1px 0 rgba(255, 255, 255, 0.90)",
                    }}
                />

                {/* Folder title */}
                <div className="absolute inset-x-0 bottom-[22px] flex justify-center">
                    <p
                        className="
              text-[14px]
              font-normal
              leading-[20px]
              tracking-[-0.28px]
              lowercase
            "
                        style={{
                            fontFamily: '"Neue Montreal", sans-serif',
                            color: isDark ? "rgba(255, 255, 255, 0.90)" : "#111111",
                        }}
                    >
                        {title}
                    </p>
                </div>


            </motion.div>
        </motion.div>
    );
}