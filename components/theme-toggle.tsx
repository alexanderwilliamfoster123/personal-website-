"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="theme-toggle opacity-0">
        <div className="w-3.5 h-3.5 opacity-0" />
        <div className="w-3.5 h-3.5 opacity-0" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="theme-toggle cursor-pointer select-none transition-colors duration-300"
    >
      <FiSun
        size={14}
        className={`transition-all duration-300 ${
          !isDark 
            ? "text-foreground opacity-100" 
            : "text-faint opacity-40 hover:opacity-80 hover:text-foreground"
        }`}
      />
      <FiMoon
        size={14}
        className={`transition-all duration-300 ${
          isDark 
            ? "text-foreground opacity-100" 
            : "text-faint opacity-40 hover:opacity-80 hover:text-foreground"
        }`}
      />
    </button>
  );
}
