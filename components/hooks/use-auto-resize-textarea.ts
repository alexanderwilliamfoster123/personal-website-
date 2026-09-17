"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback((reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const minimum = Math.max(1, minHeight);
    const maximum = Math.max(minimum, maxHeight ?? Number.POSITIVE_INFINITY);
    const setHeight = (height: number) => {
      textarea.style.height = `${height}px`;
      textarea.style.setProperty("--textarea-height", `${height}px`);
    };
    setHeight(minimum);
    if (reset) return;
    const borderHeight = textarea.offsetHeight - textarea.clientHeight;
    setHeight(Math.max(minimum, Math.min(textarea.scrollHeight + borderHeight, maximum)));
  }, [minHeight, maxHeight]);

  useEffect(() => {
    adjustHeight();
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}
