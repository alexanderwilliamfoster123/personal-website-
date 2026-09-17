"use client";

import React, { useRef } from "react";
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import HomeIcon from "@/components/svg/home";
import BagIcon from "@/components/svg/companies";
import ProfileIcon from "@/components/svg/social";
import MessageIcon from "@/components/svg/contact";
import { useTheme } from "@/components/theme-provider";
import { useRouter } from "next/navigation";

export type TabId = "home" | "companies" | "socials" | "contact";

interface NavItem {
  id: TabId;
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

interface DockItemProps extends NavItem {
  mouseX: MotionValue<number>;
  isDark: boolean;
}

function DockItem({
  mouseX,
  title,
  icon,
  onClick,
  active,
  isDark,
}: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  /*
   * Calculate how far the mouse is from
   * the center of this navigation item.
   */
  const distance = useTransform(mouseX, (value) => {
    const rect = ref.current?.getBoundingClientRect();

    if (!rect) {
      return Infinity;
    }

    return value - rect.x - rect.width / 2;
  });

  const width = useTransform(
    distance,
    [-150, 0, 150],
    [28, 50, 28]
  );

  const height = useTransform(
    distance,
    [-150, 0, 150],
    [28, 50, 28]
  );

  const iconWidth = useTransform(
    distance,
    [-150, 0, 150],
    [13, 23, 13]
  );

  const iconHeight = useTransform(
    distance,
    [-150, 0, 150],
    [13, 23, 13]
  );

  /*
   * Spring configuration for smooth 3D dock spring physics.
   */
  const springConfig = {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  };

  const animatedWidth = useSpring(width, springConfig);
  const animatedHeight = useSpring(height, springConfig);

  const animatedIconWidth = useSpring(iconWidth, springConfig);
  const animatedIconHeight = useSpring(iconHeight, springConfig);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={title}
      className="group relative flex h-full items-end justify-center outline-none cursor-pointer"
    >
      {/* Tooltip Bubble */}
      <span
        className={`
          pointer-events-none
          absolute
          bottom-[calc(100%+14px)]
          left-1/2
          -translate-x-1/2
          translate-y-1
          whitespace-nowrap
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          opacity-0
          shadow-lg
          transition-all
          duration-150
          group-hover:translate-y-0
          group-hover:opacity-100
          z-40
          ${isDark
            ? "border border-white/10 bg-[#151515] text-white shadow-black/50"
            : "border border-black/10 bg-white text-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          }
        `}
        style={{ fontFamily: '"Neue Montreal", sans-serif' }}
      >
        {title}
      </span>

      {/* Dock Circle Item (expands upwards out of box) */}
      <motion.div
        style={{
          width: animatedWidth,
          height: animatedHeight,
          borderRadius: "500px",
          border: isDark
            ? active
              ? "0.75px solid rgba(255, 255, 255, 0.20)"
              : "0.75px solid rgba(255, 255, 255, 0.08)"
            : active
              ? "0.75px solid rgba(0, 0, 0, 0.08)"
              : "0.75px solid rgba(0, 0, 0, 0.05)",
          background: isDark
            ? active
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(255, 255, 255, 0.04)"
            : active
              ? "#EAEAEA"
              : "#FFFFFF",
          boxShadow: isDark
            ? active
              ? "0 0 16px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.4)"
              : "0 2px 8px rgba(0,0,0,0.4)"
            : active
              ? "inset 0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.03)"
              : "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        className="
          relative
          flex
          items-center
          justify-center
          rounded-full
          origin-bottom
          will-change-[width,height]
          transition-colors
          duration-150
        "
      >
        <motion.div
          style={{
            width: animatedIconWidth,
            height: animatedIconHeight,
          }}
          className={`
            flex
            items-center
            justify-center
            ${isDark
              ? active
                ? "text-white"
                : "text-white/60 group-hover:text-white"
              : active
                ? "text-black"
                : "text-[#757575] group-hover:text-black"
            }
          `}
        >
          {icon}
        </motion.div>
      </motion.div>
    </button>
  );
}

interface BottomNavigationProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}

export default function BottomNavigation({
  activeTab = "home",
  onTabChange,
}: BottomNavigationProps) {
  const router = useRouter();
  const mouseX = useMotionValue(Infinity);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleTabClick = (tab: TabId) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      router.push(`/${tab}`);
    }
  };

  const items: NavItem[] = [
    {
      id: "home",
      title: "home",
      icon: <HomeIcon className="h-full w-full" />,
      active: activeTab === "home",
      onClick: () => handleTabClick("home"),
    },
    {
      id: "companies",
      title: "companies",
      icon: <BagIcon className="h-full w-full" />,
      active: activeTab === "companies",
      onClick: () => handleTabClick("companies"),
    },
    {
      id: "socials",
      title: "socials",
      icon: <ProfileIcon className="h-full w-full" />,
      active: activeTab === "socials",
      onClick: () => handleTabClick("socials"),
    },
    // {
    //   id: "contact",
    //   title: "contact",
    //   icon: <MessageIcon className="h-full w-full" />,
    //   active: activeTab === "contact",
    //   onClick: () => handleTabClick("contact"),
    // },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 max-w-full -translate-x-1/2">
      <motion.nav
        onMouseMove={(event) => {
          mouseX.set(event.pageX);
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
        }}
        className="
  mx-auto
  inline-flex
  h-11
  items-end
  gap-2
  px-2.5
  pb-2
  overflow-visible
"
        style={{
          borderRadius: "16px",
          border: isDark
            ? "0.5px solid rgba(255, 255, 255, 0.10)"
            : "0.5px solid rgba(0, 0, 0, 0.07)",
          background: isDark
            ? "rgba(18, 18, 18, 0.80)"
            : "rgba(255, 255, 255, 0.85)",
          boxShadow: isDark
            ? "0 12px 36px rgba(0, 0, 0, 0.65), 0 1px 0 rgba(255, 255, 255, 0.08) inset"
            : "0 6px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {items.map((item) => (
          <DockItem
            key={item.id}
            mouseX={mouseX}
            isDark={isDark}
            {...item}
          />
        ))}
      </motion.nav>
    </div>
  );
}