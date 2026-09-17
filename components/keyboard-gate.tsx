"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useMediaQuery } from "@/lib/use-media-query";
import { getUserSession } from "@/lib/auth";
const MacBookKeyboard = lazy(() => import("@/components/ui/macbook-keyboard"));
import ThemeToggle from "./theme-toggle";

interface KeyboardGateProps {
  onComplete: (email: string) => Promise<void>;
}

export default function KeyboardGate({ onComplete }: KeyboardGateProps) {
  const [email, setEmail] = useState(() => getUserSession()?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);
  const showKeyboard = useMediaQuery("(min-width: 768px) and (min-height: 600px) and (pointer: fine)");

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSubmit = async () => {
    if (submitted.current) return;
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("that doesn't look right.");
      inputRef.current?.focus();
      return;
    }
    submitted.current = true;
    setPending(true);
    setError(null);
    try {
      await onComplete(cleanEmail);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Your email couldn’t be saved. Please try again.");
    } finally {
      submitted.current = false;
      setPending(false);
    }
  };

  const updateEmail = (value: string) => {
    if (submitted.current) return;
    setEmail(value);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <main
      className="gate-screen screen-centered flex-col"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <header className="site-header"><span /><ThemeToggle /></header>
      <div className="gate-content flex w-full max-w-4xl flex-col items-center py-4 text-center">
        <div className="animate-fade-up flex w-full flex-col items-center">
          <h1 className="text-[13px] font-medium tracking-tight lowercase" style={{ fontFamily: '"Neue Montreal", sans-serif' }}>
            every world has a key.
          </h1>
          <form
            noValidate
            aria-busy={pending}
            onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}
            className="mx-auto mt-8 flex w-full flex-col items-center sm:mt-11"
          >
            <div className="relative w-full max-w-[232px] border-b" style={{ borderColor: "var(--input-border)" }}>
              <input
                ref={inputRef}
                type="email"
                inputMode="email"
                enterKeyHint="go"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="email"
                maxLength={254}
                disabled={pending}
                aria-label="Email address"
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
                placeholder="you@somewhere.com"
                className="gate-input min-h-12 w-full bg-transparent pl-3 pr-11 text-center text-[16px] font-normal leading-6 tracking-[-0.01em] outline-none"
                style={{ fontFamily: '"Neue Montreal", sans-serif', color: "var(--input-text)" }}
                value={email}
                onChange={(event) => { setEmail(event.target.value); setError(null); }}
              />
              <button type="submit" disabled={pending} aria-label={pending ? "Saving your email" : "Enter site"} className="absolute right-0 top-0 flex h-12 w-11 cursor-pointer items-center justify-center opacity-50 transition-opacity hover:opacity-100 focus-visible:opacity-100 disabled:cursor-wait disabled:opacity-25">
                <FiArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
            <span className="sr-only" role="status">{pending ? "saving your email…" : ""}</span>
            {error && <p id="email-error" role="alert" className="mt-3 text-[13px]" style={{ color: "var(--Text-secondary)" }}>{error}</p>}
          </form>
        </div>
        {showKeyboard && <div className="animate-fade-up mt-12 flex w-full items-center justify-center" style={{ animationDelay: "0.25s" }}>
          <Suspense fallback={<div className="h-[232px] md:h-[272px]" />}><MacBookKeyboard
            onKeyPress={(character) => updateEmail(email + character)}
            onBackspace={() => updateEmail(email.slice(0, -1))}
            onEnter={handleSubmit}
          /></Suspense>
        </div>}
      </div>
    </main>
  );
}
