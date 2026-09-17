"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/components/theme-provider";

// Normalize keyboard event to our key IDs
export function getNormalizedKeyId(e: KeyboardEvent): string {
  const code = e.code;
  const key = e.key;

  // Function keys
  if (/^F([1-9]|1[0-2])$/.test(code)) {
    return code.toLowerCase();
  }

  switch (code) {
    case "Escape":
      return "escape";
    case "Backspace":
      return "backspace";
    case "Tab":
      return "tab";
    case "CapsLock":
      return "capslock";
    case "Enter":
      case "NumpadEnter":
      return "enter";
    case "Space":
      return "space";
    case "ShiftLeft":
      return "shift";
    case "ShiftRight":
      return "shift-r";
    case "ControlLeft":
    case "ControlRight":
      return "control";
    case "AltLeft":
      return "alt";
    case "AltRight":
      return "alt-r";
    case "MetaLeft":
      return "meta";
    case "MetaRight":
      return "meta-r";
    case "ArrowUp":
      return "arrow-up";
    case "ArrowLeft":
      return "arrow-left";
    case "ArrowDown":
      return "arrow-down";
    case "ArrowRight":
      return "arrow-right";
    case "Backquote":
      return "`";
    case "Minus":
      return "-";
    case "Equal":
      return "=";
    case "BracketLeft":
      return "[";
    case "BracketRight":
      return "]";
    case "Backslash":
      return "\\";
    case "Semicolon":
      return ";";
    case "Quote":
      return "'";
    case "Comma":
      return ",";
    case "Period":
      return ".";
    case "Slash":
      return "/";
  }

  // Letters (KeyA -> a, etc.)
  if (code && code.startsWith("Key")) {
    return code.slice(3).toLowerCase();
  }

  // Digits (Digit1 -> 1, etc.)
  if (code && code.startsWith("Digit")) {
    return code.slice(5);
  }

  return (key || "").toLowerCase();
}

interface AppleKeyboardProps {
  onKeyPress?: (char: string, keyId: string) => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  scale?: number;
}

export default function AppleKeyboard({
  onKeyPress,
  onEnter,
  onBackspace,
}: AppleKeyboardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Global physical keyboard listener for animation & visual key lighting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyId = getNormalizedKeyId(e);

      setPressedKeys((prev) => {
        if (prev.has(keyId)) return prev;
        const next = new Set(prev);
        next.add(keyId);
        return next;
      });

      if (e.getModifierState) {
        setIsCapsLockOn(e.getModifierState("CapsLock"));
      }

      if (keyId === "enter") {
        if (onEnter) onEnter();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyId = getNormalizedKeyId(e);
      setPressedKeys((prev) => {
        if (!prev.has(keyId)) return prev;
        const next = new Set(prev);
        next.delete(keyId);
        return next;
      });
    };

    const handleWindowBlur = () => {
      setPressedKeys(new Set());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [onKeyPress, onEnter, onBackspace]);

  const handleVirtualKeyClick = useCallback(
    (keyId: string, char?: string) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(keyId);
        return next;
      });

      if (keyId === "capslock") {
        setIsCapsLockOn((prev) => !prev);
      }

      setTimeout(() => {
        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.delete(keyId);
          return next;
        });
      }, 130);

      if (keyId === "enter") {
        if (onEnter) onEnter();
      } else if (keyId === "backspace") {
        if (onBackspace) onBackspace();
      } else if (keyId === "space") {
        if (onKeyPress) onKeyPress(" ", keyId);
      } else if (char) {
        const outputChar = isCapsLockOn ? char.toUpperCase() : char;
        if (onKeyPress) onKeyPress(outputChar, keyId);
      }
    },
    [onKeyPress, onEnter, onBackspace, isCapsLockOn]
  );

  const isKeyActive = (keyId: string) => pressedKeys.has(keyId);

  // Exact Keycap CSS with concentrated top-right highlight border matching Figma
  const getKeyStyle = (
    keyId: string,
    customRadiusOrSmall: string | boolean = "8px"
  ) => {
    const active = isKeyActive(keyId);
    const borderRadius =
      typeof customRadiusOrSmall === "boolean"
        ? customRadiusOrSmall
          ? "5px"
          : "8px"
        : customRadiusOrSmall;

    const keyBg = active
      ? "var(--keyboard-key-active)"
      : "var(--keyboard-Keys-fill)";

    const borderGradient = isDark
      ? `linear-gradient(
          225deg,
          rgba(255, 255, 255, 0.45) 0%,
          rgba(255, 255, 255, 0.20) 12%,
          rgba(255, 255, 255, 0.04) 22%,
          transparent 32%,
          transparent 100%
        )`
      : `linear-gradient(
          225deg,
          rgba(0, 0, 0, 0.22) 0%,
          rgba(0, 0, 0, 0.10) 14%,
          rgba(0, 0, 0, 0.02) 24%,
          transparent 34%,
          transparent 100%
        )`;

    return {
      borderRadius,
      border: "0.5px solid transparent",
      background: `
        linear-gradient(${keyBg}, ${keyBg}) padding-box,
        ${borderGradient} border-box
      `,
      boxShadow: active
        ? "0 2px 10px 0 var(--keyboard-inner-shadow) inset, 0 0 0 1px var(--keyboard-drop-all)"
        : `0 4px 23px 0 var(--keyboard-inner-shadow) inset,
           0 0 0 1px var(--keyboard-drop-all),
           4px 0 4px 0 var(--keyboard-drop-right),
           -4px 0 4px 0 var(--keyboard-drop-left),
           0 4px 4px 0 var(--keyboard-drop-down),
           0 -4px 4px 0 var(--keyboard-drop-up)`,
    };
  };

  const actionTextClass = "transition-colors duration-150";
  const letterTextClass = "transition-colors duration-150";
  const mainSymbolTextClass = "transition-colors duration-150";
  const subSymbolTextClass = "transition-colors duration-150";

  return (
    <div className="flex flex-row items-center justify-center select-none" style={{ color: "var(--keyboard-text-icon)" }}>
      {/* Outer Keyboard Chassis */}
      <div
        className="w-fit h-fit mx-auto p-[14px] transition-all duration-300 mt-4"
        style={{
          borderRadius: "40px",
          border: isDark
            ? "1px solid var(--keyboard-stroke, #272727)"
            : "1px solid var(--keyboard-stroke, #DDD)",
          background: isDark
            ? "var(--keyboard-Fill, #1A1A1A)"
            : "var(--keyboard-Fill, #F7F7F7)",
          boxShadow: isDark
            ? "0 4px 23px 0 var(--keyboard-main-inner, rgba(0, 0, 0, 0.20)) inset, 4px 0 4px 0 var(--keyboard-main-drop-right, rgba(0, 0, 0, 0.40)), -4px 0 4px 0 var(--keyboard-main-drop-left, rgba(0, 0, 0, 0.40)), 0 4px 4px 0 var(--keyboard-main-drop-down, rgba(0, 0, 0, 0.40))"
            : "0 4px 23px 0 var(--keyboard-main-inner, rgba(0, 0, 0, 0.03)) inset, 4px 0 4px 0 var(--keyboard-main-drop-right, rgba(0, 0, 0, 0.10)), -4px 0 4px 0 var(--keyboard-main-drop-left, rgba(0, 0, 0, 0.10)), 0 4px 4px 0 var(--keyboard-main-drop-down, rgba(0, 0, 0, 0.10))",
        }}
      >
        {/* Row 1: Function Keys (Total Row Width: 746.482px) */}
        <div className="flex gap-[6px] mb-[6px]" style={{ width: "746.482px" }}>
          {/* Escape (Top-Left: 22px 8px 8px 8px) */}
          <button
            type="button"
            aria-label="escape"
            onClick={() => handleVirtualKeyClick("escape")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("escape")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "67.463px",
              height: "36.449px",
              flexShrink: 0,
              ...getKeyStyle("escape", "22px 8px 8px 8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>esc</div>
          </button>

          {/* F1 - F12 */}
          {[
            {
              id: "f1",
              label: "F1",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ),
            },
            {
              id: "f2",
              label: "F2",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <path d="M12 3v1" />
                  <path d="M12 20v1" />
                  <path d="M3 12h1" />
                  <path d="M20 12h1" />
                  <path d="m18.364 5.636-.707.707" />
                  <path d="m6.343 17.657-.707.707" />
                  <path d="m5.636 5.636.707.707" />
                  <path d="m17.657 17.657.707.707" />
                </svg>
              ),
            },
            {
              id: "f3",
              label: "F3",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              ),
            },
            {
              id: "f4",
              label: "F4",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              ),
            },
            {
              id: "f5",
              label: "F5",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              ),
            },
            {
              id: "f6",
              label: "F6",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ),
            },
            {
              id: "f7",
              label: "F7",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <polygon points="11 19 2 12 11 5 11 19" />
                  <polygon points="22 19 13 12 22 5 22 19" />
                </svg>
              ),
            },
            {
              id: "f8",
              label: "F8",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              ),
            },
            {
              id: "f9",
              label: "F9",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <polygon points="13 19 22 12 13 5 13 19" />
                  <polygon points="2 19 11 12 2 5 2 19" />
                </svg>
              ),
            },
            {
              id: "f10",
              label: "F10",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                  <line x1="22" x2="16" y1="9" y2="15" />
                  <line x1="16" x2="22" y1="9" y2="15" />
                </svg>
              ),
            },
            {
              id: "f11",
              label: "F11",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                  <path d="M16 9a5 5 0 0 1 0 6" />
                </svg>
              ),
            },
            {
              id: "f12",
              label: "F12",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-75"
                >
                  <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                  <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                </svg>
              ),
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => handleVirtualKeyClick(item.id)}
              className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
                isKeyActive(item.id)
                  ? "scale-[0.94] translate-y-[1px]"
                  : "hover:scale-[0.98] active:scale-[0.94]"
              }`}
              style={{
                width: "44.463px",
                height: "36.449px",
                flexShrink: 0,
                ...getKeyStyle(item.id, "8px"),
              }}
            >
              <div className={`flex flex-col items-center justify-center ${isDark ? "text-white" : "text-[#1d1d1f]"}`}>
                {item.icon}
                <span className={`text-[8.5px] font-normal mt-[1.5px] leading-none ${isDark ? "text-[#8e8e93]" : "text-[#86868b]"}`}>
                  {item.label}
                </span>
              </div>
            </button>
          ))}

          {/* Top-Right Key: Del (Top-Right: 8px 22px 8px 8px) */}
          <button
            type="button"
            aria-label="del"
            onClick={() => handleVirtualKeyClick("touch-id")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("touch-id")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "67.463px",
              height: "36.449px",
              flexShrink: 0,
              ...getKeyStyle("touch-id", "8px 22px 8px 8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>del</div>
          </button>
        </div>

        {/* Row 2: Number Row (Total Row Width: 746.482px) */}
        <div className="flex gap-[6px] mb-[6px]" style={{ width: "746.482px" }}>
          {/* Tilde ` */}
          <button
            type="button"
            aria-label="`"
            onClick={() => handleVirtualKeyClick("`", "`")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("`")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("`", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>~</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>`</span>
          </button>

          {/* Digits 1 to 0, -, = */}
          {[
            { id: "1", sub: "!", main: "1" },
            { id: "2", sub: "@", main: "2" },
            { id: "3", sub: "#", main: "3" },
            { id: "4", sub: "$", main: "4" },
            { id: "5", sub: "%", main: "5" },
            { id: "6", sub: "^", main: "6" },
            { id: "7", sub: "&", main: "7" },
            { id: "8", sub: "*", main: "8" },
            { id: "9", sub: "(", main: "9" },
            { id: "0", sub: ")", main: "0" },
            { id: "-", sub: "—", main: "_" },
            { id: "=", sub: "+", main: "=" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.main}
              onClick={() =>
                handleVirtualKeyClick(
                  item.id,
                  item.id === "-" ? "-" : item.id === "=" ? "=" : item.main
                )
              }
              className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
                isKeyActive(item.id)
                  ? "scale-[0.94] translate-y-[1px]"
                  : "hover:scale-[0.98] active:scale-[0.94]"
              }`}
              style={{
                width: "44.463px",
                height: "44.549px",
                flexShrink: 0,
                ...getKeyStyle(item.id, "8px"),
              }}
            >
              <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>
                {item.sub}
              </span>
              <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>
                {item.main}
              </span>
            </button>
          ))}

          {/* Backspace / Delete (Width: 90.463px) */}
          <button
            type="button"
            aria-label="backspace"
            onClick={() => handleVirtualKeyClick("backspace")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("backspace")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "90.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("backspace", "8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>backspace</div>
          </button>
        </div>

        {/* Row 3: QWERTY (Total Row Width: 746.482px) */}
        <div className="flex gap-[6px] mb-[6px]" style={{ width: "746.482px" }}>
          {/* Tab */}
          <button
            type="button"
            aria-label="tab"
            onClick={() => handleVirtualKeyClick("tab")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("tab")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "90.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("tab", "8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>tab</div>
          </button>

          {/* Q-P */}
          {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((char) => (
            <button
              key={char}
              type="button"
              aria-label={char}
              onClick={() => handleVirtualKeyClick(char, char)}
              className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
                isKeyActive(char)
                  ? "scale-[0.94] translate-y-[1px]"
                  : "hover:scale-[0.98] active:scale-[0.94]"
              }`}
              style={{
                width: "44.463px",
                height: "44.549px",
                flexShrink: 0,
                ...getKeyStyle(char, "8px"),
              }}
            >
              <span
                className={`text-[16px] font-normal ${letterTextClass}`}
                style={{ fontFamily: '"Neue Montreal", sans-serif' }}
              >
                {char.toUpperCase()}
              </span>
            </button>
          ))}

          {/* [ { */}
          <button
            type="button"
            aria-label="["
            onClick={() => handleVirtualKeyClick("[", "[")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("[")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("[", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>{"{"}</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>[</span>
          </button>

          {/* ] } */}
          <button
            type="button"
            aria-label="]"
            onClick={() => handleVirtualKeyClick("]", "]")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("]")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("]", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>{"}"}</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>]</span>
          </button>

          {/* \ | */}
          <button
            type="button"
            aria-label="\"
            onClick={() => handleVirtualKeyClick("\\", "\\")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("\\")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("\\", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>|</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>{"\\"}</span>
          </button>
        </div>

        {/* Row 4: ASDF (Total Row Width: 746.482px) */}
        <div className="flex gap-[6px] mb-[6px]" style={{ width: "746.482px" }}>
          {/* Caps Lock */}
          <button
            type="button"
            aria-label="capslock"
            onClick={() => handleVirtualKeyClick("capslock")}
            className={`flex items-center justify-center gap-2 px-2.5 cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("capslock")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "82.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("capslock", "8px"),
            }}
          >
            <div
              className={`w-[4.5px] h-[4.5px] rounded-full transition-all duration-200 shrink-0 ${
                isCapsLockOn
                  ? "bg-[#22c55e] shadow-[0_0_4px_#22c55e]"
                  : isDark
                  ? "bg-[#27272a]"
                  : "bg-[#d1d1d6]"
              }`}
            />
            <span className={`text-[11px] ${actionTextClass}`}>caps lock</span>
          </button>

          {/* A-L */}
          {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((char) => (
            <button
              key={char}
              type="button"
              aria-label={char}
              onClick={() => handleVirtualKeyClick(char, char)}
              className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
                isKeyActive(char)
                  ? "scale-[0.94] translate-y-[1px]"
                  : "hover:scale-[0.98] active:scale-[0.94]"
              }`}
              style={{
                width: "44.463px",
                height: "44.549px",
                flexShrink: 0,
                ...getKeyStyle(char, "8px"),
              }}
            >
              <span
                className={`text-[16px] font-normal ${letterTextClass}`}
                style={{ fontFamily: '"Neue Montreal", sans-serif' }}
              >
                {char.toUpperCase()}
              </span>
            </button>
          ))}

          {/* ; : */}
          <button
            type="button"
            aria-label=";"
            onClick={() => handleVirtualKeyClick(";", ";")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive(";")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle(";", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>:</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>;</span>
          </button>

          {/* ' " */}
          <button
            type="button"
            aria-label="'"
            onClick={() => handleVirtualKeyClick("'", "'")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("'")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("'", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>&quot;</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>&apos;</span>
          </button>

          {/* Enter / Return */}
          <button
            type="button"
            aria-label="enter"
            onClick={() => handleVirtualKeyClick("enter")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("enter")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "102.926px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("enter", "8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>return</div>
          </button>
        </div>

        {/* Row 5: ZXCV (Shift Row - Total Row Width: 746.482px) */}
        <div className="flex gap-[6px] mb-[6px]" style={{ width: "746.482px" }}>
          {/* Left Shift */}
          <button
            type="button"
            aria-label="shift"
            onClick={() => handleVirtualKeyClick("shift")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("shift")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "117.926px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("shift", "8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>shift</div>
          </button>

          {/* Z-M */}
          {["z", "x", "c", "v", "b", "n", "m"].map((char) => (
            <button
              key={char}
              type="button"
              aria-label={char}
              onClick={() => handleVirtualKeyClick(char, char)}
              className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
                isKeyActive(char)
                  ? "scale-[0.94] translate-y-[1px]"
                  : "hover:scale-[0.98] active:scale-[0.94]"
              }`}
              style={{
                width: "44.463px",
                height: "44.549px",
                flexShrink: 0,
                ...getKeyStyle(char, "8px"),
              }}
            >
              <span
                className={`text-[16px] font-normal ${letterTextClass}`}
                style={{ fontFamily: '"Neue Montreal", sans-serif' }}
              >
                {char.toUpperCase()}
              </span>
            </button>
          ))}

          {/* , < */}
          <button
            type="button"
            aria-label=","
            onClick={() => handleVirtualKeyClick(",", ",")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive(",")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle(",", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>&lt;</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>,</span>
          </button>

          {/* . > */}
          <button
            type="button"
            aria-label="."
            onClick={() => handleVirtualKeyClick(".", ".")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive(".")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle(".", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>&gt;</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>.</span>
          </button>

          {/* / ? */}
          <button
            type="button"
            aria-label="/"
            onClick={() => handleVirtualKeyClick("/", "/")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("/")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("/", "8px"),
            }}
          >
            <span className={`text-[10px] leading-none ${subSymbolTextClass}`}>?</span>
            <span className={`text-[13px] leading-none mt-1 ${mainSymbolTextClass}`}>/</span>
          </button>

          {/* Right Shift */}
          <button
            type="button"
            aria-label="shift-r"
            onClick={() => handleVirtualKeyClick("shift-r")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("shift-r")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "117.926px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("shift-r", "8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>shift</div>
          </button>
        </div>

        {/* Row 6: Bottom Controls & Arrows (Total Row Width: 746.482px) */}
        <div className="flex gap-[6px]" style={{ width: "746.482px" }}>
          {/* Control / ctrl */}
          <button
            type="button"
            aria-label="control"
            onClick={() => handleVirtualKeyClick("control")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("control")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("control", "8px 8px 8px 22px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>ctrl</div>
          </button>

          {/* Fn */}
          <button
            type="button"
            aria-label="fn"
            onClick={() => handleVirtualKeyClick("fn")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("fn")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("fn", "8px"),
            }}
          >
            <div className={`text-[11px] ${actionTextClass}`}>fn</div>
          </button>

          {/* Option Left (⌥ opt) */}
          <button
            type="button"
            aria-label="alt"
            onClick={() => handleVirtualKeyClick("alt")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("alt")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("alt", "8px"),
            }}
          >
            <span className={`opacity-75 text-[10px] leading-none ${isDark ? "text-[#a1a1aa]" : "text-[#86868b]"}`}>
              ⌥
            </span>
            <span className={`text-[10px] mt-[2px] leading-none ${actionTextClass}`}>
              opt
            </span>
          </button>

          {/* Command Left (⌘ cmd) */}
          <button
            type="button"
            aria-label="meta"
            onClick={() => handleVirtualKeyClick("meta")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("meta")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "58.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("meta", "8px"),
            }}
          >
            <span className={`opacity-75 text-[11px] leading-none ${isDark ? "text-[#a1a1aa]" : "text-[#86868b]"}`}>
              ⌘
            </span>
            <span className={`text-[10px] mt-[2px] leading-none ${actionTextClass}`}>
              cmd
            </span>
          </button>

          {/* Space Bar */}
          <button
            type="button"
            aria-label="space"
            onClick={() => handleVirtualKeyClick("space", " ")}
            className={`cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("space")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "258.315px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("space", "8px"),
            }}
          >
            <div></div>
          </button>

          {/* Command Right (⌘ cmd) */}
          <button
            type="button"
            aria-label="meta-r"
            onClick={() => handleVirtualKeyClick("meta-r")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("meta-r")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "58.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("meta-r", "8px"),
            }}
          >
            <span className={`opacity-75 text-[11px] leading-none ${isDark ? "text-[#a1a1aa]" : "text-[#86868b]"}`}>
              ⌘
            </span>
            <span className={`text-[10px] mt-[2px] leading-none ${actionTextClass}`}>
              cmd
            </span>
          </button>

          {/* Option Right (⌥ opt) */}
          <button
            type="button"
            aria-label="alt-r"
            onClick={() => handleVirtualKeyClick("alt-r")}
            className={`flex flex-col justify-center items-center cursor-pointer transition-all duration-75 select-none ${
              isKeyActive("alt-r")
                ? "scale-[0.94] translate-y-[1px]"
                : "hover:scale-[0.98] active:scale-[0.94]"
            }`}
            style={{
              width: "44.463px",
              height: "44.549px",
              flexShrink: 0,
              ...getKeyStyle("alt-r", "8px"),
            }}
          >
            <span className={`opacity-75 text-[10px] leading-none ${isDark ? "text-[#a1a1aa]" : "text-[#86868b]"}`}>
              ⌥
            </span>
            <span className={`text-[10px] mt-[2px] leading-none ${actionTextClass}`}>
              opt
            </span>
          </button>

          {/* Arrow Keys Cluster (Width: 145.389px) */}
          <div
            className="flex flex-col justify-between items-center"
            style={{
              width: "145.389px",
              height: "44.549px",
              flexShrink: 0,
            }}
          >
            {/* Arrow Up (Capsule pill) */}
            <button
              type="button"
              aria-label="arrow-up"
              onClick={() => handleVirtualKeyClick("arrow-up")}
              className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
                isKeyActive("arrow-up")
                  ? "scale-[0.94] translate-y-[0.5px]"
                  : "hover:scale-[0.98] active:scale-[0.94]"
              }`}
              style={{
                width: "44.463px",
                height: "19px",
                ...getKeyStyle("arrow-up", "12px"),
              }}
            >
              <span className={`text-[9px] ${letterTextClass}`}>▲</span>
            </button>

            {/* Bottom row arrows: Left, Down, Right */}
            <div className="flex gap-[6px]">
              {/* Arrow Left */}
              <button
                type="button"
                aria-label="arrow-left"
                onClick={() => handleVirtualKeyClick("arrow-left")}
                className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
                  isKeyActive("arrow-left")
                    ? "scale-[0.94] translate-y-[0.5px]"
                    : "hover:scale-[0.98] active:scale-[0.94]"
                }`}
                style={{
                  width: "44.463px",
                  height: "19px",
                  ...getKeyStyle("arrow-left", "12px"),
                }}
              >
                <span className={`text-[9px] ${letterTextClass}`}>◀</span>
              </button>

              {/* Arrow Down */}
              <button
                type="button"
                aria-label="arrow-down"
                onClick={() => handleVirtualKeyClick("arrow-down")}
                className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
                  isKeyActive("arrow-down")
                    ? "scale-[0.94] translate-y-[0.5px]"
                    : "hover:scale-[0.98] active:scale-[0.94]"
                }`}
                style={{
                  width: "44.463px",
                  height: "19px",
                  ...getKeyStyle("arrow-down", "12px"),
                }}
              >
                <span className={`text-[9px] ${letterTextClass}`}>▼</span>
              </button>

              {/* Arrow Right */}
              <button
                type="button"
                aria-label="arrow-right"
                onClick={() => handleVirtualKeyClick("arrow-right")}
                className={`flex items-center justify-center cursor-pointer transition-all duration-75 select-none ${
                  isKeyActive("arrow-right")
                    ? "scale-[0.94] translate-y-[0.5px]"
                    : "hover:scale-[0.98] active:scale-[0.94]"
                }`}
                style={{
                  width: "44.463px",
                  height: "19px",
                  ...getKeyStyle("arrow-right", "8px 8px 22px 8px"),
                }}
              >
                <span className={`text-[9px] ${letterTextClass}`}>▶</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
