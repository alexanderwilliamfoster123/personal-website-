"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReceiptScreen from "./receipt-screen";
import AppleKeyboard from "./apple-keyboard";
import ThemeToggle from "./theme-toggle";
import { useTheme } from "./theme-provider";
import { FiArrowRight } from "react-icons/fi";
import { setUserSession, findRegisteredUser, saveRegisteredUser, UserSession } from "@/lib/auth";

interface KeyboardGateProps {
  onComplete?: (name: string, email: string) => void;
  onReturningUser?: (user: UserSession) => void;
}

export default function KeyboardGate({ onComplete, onReturningUser }: KeyboardGateProps = {}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState<"email" | "name" | "complete">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount and step changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleStepSubmit = useCallback(() => {
    if (step === "email") {
      const cleanEmail = email.trim();
      if (isValidEmail(cleanEmail)) {
        setError(null);
        // Check if email already exists in registered users list
        const existingUser = findRegisteredUser(cleanEmail);
        if (existingUser) {
          // Returning user: set session and bypass name and receipt screen
          setUserSession({ name: existingUser.name, email: cleanEmail });
          if (onReturningUser) {
            onReturningUser({ name: existingUser.name, email: cleanEmail });
          } else if (onComplete) {
            onComplete(existingUser.name, cleanEmail);
          } else {
            setStep("complete");
          }
        } else {
          // New user: proceed to name input step
          setStep("name");
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      } else {
        setError("that doesn't look right.");
      }
    } else if (step === "name") {
      if (name.trim().length > 0) {
        setError(null);
        const cleanName = name.trim();
        const cleanEmail = email.trim();
        setUserSession({ name: cleanName, email: cleanEmail });
        saveRegisteredUser({ name: cleanName, email: cleanEmail });
        if (onComplete) {
          onComplete(cleanName, cleanEmail);
        } else {
          setStep("complete");
        }
      }
    }
  }, [step, email, name, onComplete, onReturningUser]);

  if (step === "complete" && !onComplete) {
    return <ReceiptScreen name={name} email={email} />;
  }

  return (
    <main
      className="gate-screen flex min-h-dvh flex-col justify-between items-center px-4 py-6 sm:py-8 transition-colors duration-500 ease-out select-none"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top Header Bar with Theme Toggle */}
      <div className="fixed top-4 right-5 z-[80]">
        <ThemeToggle />
      </div>

      {/* Center Section: Title, Subtitle, Form, and Keyboard */}
      <div className="flex w-full flex-col items-center text-center max-w-4xl my-auto py-4">
        {/* Header / Email / Name Input Section */}
        <div
          className="animate-fade-up w-full flex flex-col items-center"
          style={{ animationDuration: "0.5s" }}
        >
          <h1
            className="text-[13px] font-medium tracking-tight transition-colors duration-300 lowercase"
            style={{
              fontFamily: '"Neue Montreal", sans-serif',
              color: "var(--foreground)",
            }}
          >
            every world has a key.
          </h1>
          <p
            className="mt-2 text-[13px] font-normal leading-[24px] transition-all duration-300 lowercase"
            style={{
              color: "var(--Text-secondary, #8F8F8F)",
              fontFamily: '"Neue Montreal", sans-serif',
            }}
          >
            {step === "email"
              ? "yours is an email."
              : step === "name"
              ? "and your name."
              : `welcome ${name}`}
          </p>

          {/* Form & Underline Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStepSubmit();
            }}
            className="mx-auto mt-8 sm:mt-11 w-full flex flex-col items-center"
          >
            <div
              className="relative w-full max-w-[180px] sm:max-w-[200px] pb-1.5 border-b transition-colors duration-300"
              style={{
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.15)",
              }}
            >
              <input
                ref={inputRef}
                type={step === "email" ? "email" : "text"}
                inputMode={step === "email" ? "email" : "text"}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                autoComplete={step === "email" ? "email" : "name"}
                placeholder={step === "email" ? "you@somewhere.com" : "your name"}
                className="gate-input w-full bg-transparent px-0 text-center text-[14px] sm:text-[15px] font-normal leading-[20px] tracking-[-0.01em] outline-none transition-colors duration-300"
                style={{
                  fontFamily: '"Neue Montreal", sans-serif',
                  backgroundColor: "transparent",
                  color: (step === "email" ? email : name)
                    ? isDark
                      ? "#EDEDED"
                      : "var(--input-text, #111111)"
                    : isDark
                    ? "#555555"
                    : "#888888",
                }}
                value={step === "email" ? email : name}
                onChange={(e) => {
                  if (step === "email") {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  } else {
                    setName(e.target.value);
                  }
                }}
              />
            </div>

            {/* Error Message if invalid email */}
            {error && (
              <p
                className="mt-3 text-[13px] font-normal leading-normal transition-all duration-300 text-center"
                style={{
                  color: "var(--Text-secondary, #8F8F8F)",
                  fontFamily: '"Neue Montreal", sans-serif',
                }}
              >
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Reusable Apple Magic Keyboard Component (Hidden on mobile) */}
        <div
          className="hidden sm:flex animate-fade-up mt-8 sm:mt-10 w-full items-center justify-center overflow-visible -mb-12 sm:-mb-14 md:-mb-16 lg:-mb-18"
          style={{ animationDelay: "0.45s" }}
        >
          <div className="scale-[0.65] sm:scale-[0.68] md:scale-[0.76] lg:scale-[0.80] xl:scale-[0.82] origin-top">
            <AppleKeyboard
              onKeyPress={(char) => {
                if (step === "email") {
                  setEmail((prev) => prev + char);
                  if (error) setError(null);
                } else if (step === "name") {
                  setName((prev) => prev + char);
                }
                inputRef.current?.focus();
              }}
              onBackspace={() => {
                if (step === "email") {
                  setEmail((prev) => prev.slice(0, -1));
                  if (error) setError(null);
                } else if (step === "name") {
                  setName((prev) => prev.slice(0, -1));
                }
                inputRef.current?.focus();
              }}
              onEnter={() => {
                handleStepSubmit();
                inputRef.current?.focus();
              }}
            />
          </div>
        </div>
      </div>

      {/* Empty footer spacer to balance header */}
      <footer className="w-full max-w-5xl h-6 pointer-events-none" />
    </main>
  );
}
