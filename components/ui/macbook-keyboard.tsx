"use client";

// Visit https://kaif-ui.vercel.app/ for components like this
 
import React, { useEffect, useState } from "react";
 
interface MacBookKeyboardProps {
  onKeyPress?: (character: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
}

type KeySpec = [code: string, label: string, shifted?: string];

const MacBookKeyboard = ({ onKeyPress, onBackspace, onEnter }: MacBookKeyboardProps) => {
    const [pressedCodes, setPressedCodes] = useState<Set<string>>(new Set());
    const [capsLock, setCapsLock] = useState(false);
    const [virtualShift, setVirtualShift] = useState(false);

    useEffect(() => {
        // Native typing remains owned by the input; these listeners only light up keys.
        const keyDown = (event: KeyboardEvent) => {
            if (!event.repeat) setPressedCodes((previous) => new Set(previous).add(event.code));
            setCapsLock(event.getModifierState("CapsLock"));
        };
        const keyUp = (event: KeyboardEvent) => {
            setPressedCodes((previous) => {
                const next = new Set(previous);
                next.delete(event.code);
                return next;
            });
        };
        const reset = () => { setPressedCodes(new Set()); setVirtualShift(false); };
        window.addEventListener("keydown", keyDown);
        window.addEventListener("keyup", keyUp);
        window.addEventListener("blur", reset);
        return () => {
            window.removeEventListener("keydown", keyDown);
            window.removeEventListener("keyup", keyUp);
            window.removeEventListener("blur", reset);
        };
    }, []);

    const getKeyProps = ([code, label, shifted]: KeySpec) => {
        const isShift = code === "ShiftLeft" || code === "ShiftRight";
        const latched = isShift ? virtualShift : code === "CapsLock" && capsLock;
        return {
            type: "button" as const,
            className: "macbook-key",
            "aria-label": label,
            "aria-pressed": isShift || code === "CapsLock" ? !!latched : undefined,
            "data-pressed": pressedCodes.has(code) || latched ? "true" : undefined,
            onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault(),
            onClick: () => {
                if (isShift) { setVirtualShift((value) => !value); return; }
                if (code === "CapsLock") { setCapsLock((value) => !value); return; }
                if (code === "Enter") { onEnter?.(); return; }
                if (code === "Backspace") { onBackspace?.(); return; }
                if (code === "Space") { onKeyPress?.(" "); return; }
                if (label.length !== 1) return;
                const shiftHeld = virtualShift || pressedCodes.has("ShiftLeft") || pressedCodes.has("ShiftRight");
                const uppercase = code.startsWith("Key") ? shiftHeld !== capsLock : shiftHeld;
                onKeyPress?.(uppercase && shifted ? shifted : label);
                setVirtualShift(false);
            },
        };
    };

    return (
        <div className="macbook-keyboard" role="group" aria-label="Interactive keyboard">
            <div className="macbook-keyboard-frame">
                <div className="macbook-keyboard-chassis rounded-md p-1 w-fit h-fit">
                    <div className="flex gap-[2px] mb-[2px] w-full flex-shrink-0">
                        <button {...getKeyProps(["Escape","Escape"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex w-10 items-end justify-start pl-[4px] pb-[2px]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center flex-col items-start text-[var(--mk-legend)]">
                                    esc
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F1","F1"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                        <path d="M12 5l0 .01" />
                                        <path d="M17 7l0 .01" />
                                        <path d="M19 12l0 .01" />
                                        <path d="M17 17l0 .01" />
                                        <path d="M12 19l0 .01" />
                                        <path d="M7 17l0 .01" />
                                        <path d="M5 12l0 .01" />
                                        <path d="M7 7l0 .01" />
                                    </svg>
                                    <span className="inline-block mt-1">F1</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F2","F2"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                        <path d="M12 5l0 -2" />
                                        <path d="M17 7l1.4 -1.4" />
                                        <path d="M19 12l2 0" />
                                        <path d="M17 17l1.4 1.4" />
                                        <path d="M12 19l0 2" />
                                        <path d="M7 17l-1.4 1.4" />
                                        <path d="M6 12l-2 0" />
                                        <path d="M7 7l-1.4 -1.4" />
                                    </svg>
                                    <span className="inline-block mt-1">F2</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F3","F3"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
                                        <path d="M3 10h18" />
                                        <path d="M10 3v18" />
                                    </svg>
                                    <span className="inline-block mt-1">F3</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F4","F4"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                        <path d="M21 21l-6 -6" />
                                    </svg>
                                    <span className="inline-block mt-1">F4</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F5","F5"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
                                        <path d="M5 10a7 7 0 0 0 14 0" />
                                        <path d="M8 21l8 0" />
                                        <path d="M12 17l0 4" />
                                    </svg>
                                    <span className="inline-block mt-1">F5</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F6","F6"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                                    </svg>
                                    <span className="inline-block mt-1">F6</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F7","F7"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M21 5v14l-8 -7z" />
                                        <path d="M10 5v14l-8 -7z" />
                                    </svg>
                                    <span className="inline-block mt-1">F7</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F8","F8"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M4 5v14l12 -7z" />
                                        <path d="M20 5l0 14" />
                                    </svg>
                                    <span className="inline-block mt-1">F8</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F9","F9"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M3 5v14l8 -7z" />
                                        <path d="M14 5v14l8 -7z" />
                                    </svg>
                                    <span className="inline-block mt-1">F9</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F10","F10"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                                        <path d="M16 10l4 4m0 -4l-4 4" />
                                    </svg>
                                    <span className="inline-block mt-1">F10</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F11","F11"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M15 8a5 5 0 0 1 0 8" />
                                        <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                                    </svg>
                                    <span className="inline-block mt-1">F11</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["F12","F12"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-[6px] w-[6px]"
                                    >
                                        <path d="M15 8a5 5 0 0 1 0 8" />
                                        <path d="M17.7 5a9 9 0 0 1 0 14" />
                                        <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                                    </svg>
                                    <span className="inline-block mt-1">F12</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Power","Touch ID"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="macbook-touch-ring h-4 w-4 rounded-full p-px">
                                        <span className="macbook-touch-center block h-full w-full rounded-full" />
                                    </span>
                                </span>
                            </span>
                        </button>
                    </div>
                    <div className="flex gap-[2px] mb-[2px] w-full flex-shrink-0">
                        <button {...getKeyProps(["Backquote","`","~"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">~</span>
                                    <span className="block mt-1">`</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit1","1","!"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block ">!</span>
                                    <span className="block">1</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit2","2","@"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">@</span>
                                    <span className="block">2</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit3","3","#"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">#</span>
                                    <span className="block">3</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit4","4","$"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">$</span>
                                    <span className="block">4</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit5","5","%"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">%</span>
                                    <span className="block">5</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit6","6","^"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">^</span>
                                    <span className="block">6</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit7","7","&"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">&amp;</span>
                                    <span className="block">7</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit8","8","*"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">*</span>
                                    <span className="block">8</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit9","9","("])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">(</span>
                                    <span className="block">9</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Digit0","0",")"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">)</span>
                                    <span className="block">0</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Minus","-","_"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">_</span>
                                    <span className="block">-</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Equal","=","+"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">+</span>
                                    <span className="block"> = </span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Backspace","Delete"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex w-10 items-end justify-end pr-[4px] pb-[2px]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center flex-col items-end text-[var(--mk-legend)]">
                                    delete
                                </span>
                            </span>
                        </button>
                    </div>
                    <div className="flex gap-[2px] mb-[2px] w-full flex-shrink-0">
                        <button {...getKeyProps(["Tab","Tab"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex w-10 items-end justify-start pl-[4px] pb-[2px]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center flex-col items-start text-[var(--mk-legend)]">
                                    tab
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyQ","q","Q"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">Q</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyW","w","W"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">W</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyE","e","E"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">E</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyR","r","R"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">R</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyT","t","T"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">T</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyY","y","Y"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">Y</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyU","u","U"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">U</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyI","i","I"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">I</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyO","o","O"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">O</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyP","p","P"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">P</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["BracketLeft","[","{"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">{"{"}</span>
                                    <span className="block">[</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["BracketRight","]","}"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">{"}"}</span>
                                    <span className="block">]</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Backslash","\\","|"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">|</span>
                                    <span className="block">\</span>
                                </span>
                            </span>
                        </button>
                    </div>
                    <div className="flex gap-[2px] mb-[2px] w-full flex-shrink-0">
                        <button {...getKeyProps(["CapsLock","Caps lock"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex w-[2.8rem] items-end justify-start pl-[4px] pb-[2px]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center flex-col items-start text-[var(--mk-legend)]">
                                    caps lock
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyA","a","A"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">A</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyS","s","S"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">S</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyD","d","D"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">D</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyF","f","F"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">F</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyG","g","G"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">G</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyH","h","H"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">H</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyJ","j","J"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">J</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyK","k","K"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">K</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyL","l","L"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">L</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Semicolon",";",":"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">:</span>
                                    <span className="block">;</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Quote","'","\""])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">"</span>
                                    <span className="block">'</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Enter","Return"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex w-[2.85rem] items-end justify-end pr-[4px] pb-[2px]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center flex-col items-end text-[var(--mk-legend)]">
                                    return
                                </span>
                            </span>
                        </button>
                    </div>
                    <div className="flex gap-[2px] mb-[2px] w-full flex-shrink-0">
                        <button {...getKeyProps(["ShiftLeft","Left shift"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex w-[3.65rem] items-end justify-start pl-[4px] pb-[2px]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center flex-col items-start text-[var(--mk-legend)]">
                                    shift
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyZ","z","Z"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">Z</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyX","x","X"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">X</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyC","c","C"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">C</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyV","v","V"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">V</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyB","b","B"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">B</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyN","n","N"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">N</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["KeyM","m","M"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">M</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Comma",",","<"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">&lt;</span>
                                    <span className="block">,</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Period",".",">"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">&gt;</span>
                                    <span className="block">.</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Slash","/","?"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                    <span className="block">?</span>
                                    <span className="block">/</span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["ShiftRight","Right shift"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex w-[3.65rem] items-end justify-end pr-[4px] pb-[2px]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center flex-col items-end text-[var(--mk-legend)]">
                                    shift
                                </span>
                            </span>
                        </button>
                    </div>
                    <div className="flex gap-[2px] mb-[2px] w-full flex-shrink-0">
                        <button {...getKeyProps(["Fn","Function"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex items-center flex-col h-full justify-between py-[4px] text-[var(--mk-legend)]">
                                    <span className="flex justify-end w-full pr-1">
                                        <span className="block">fn</span>
                                    </span>
                                    <span className="flex justify-start w-full pl-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-[6px] w-[6px]"
                                        >
                                            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                                            <path d="M3.6 9h16.8" />
                                            <path d="M3.6 15h16.8" />
                                            <path d="M11.5 3a17 17 0 0 0 0 18" />
                                            <path d="M12.5 3a17 17 0 0 1 0 18" />
                                        </svg>
                                    </span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["ControlLeft","Control"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex items-center flex-col h-full justify-between py-[4px] text-[var(--mk-legend)]">
                                    <span className="flex justify-end w-full pr-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-[6px] w-[6px]"
                                        >
                                            <path d="M6 15l6 -6l6 6" />
                                        </svg>
                                    </span>
                                    <span className="flex justify-start w-full pl-1">
                                        <span className="block">control</span>
                                    </span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["AltLeft","Left option"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex items-center flex-col h-full justify-between py-[4px] text-[var(--mk-legend)]">
                                    <span className="flex justify-end w-full pr-1">
                                        <svg
                                            fill="none"
                                            version="1.1"
                                            id="icon"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 32 32"
                                            className="h-[6px] w-[6px]"
                                        >
                                            <rect
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                x={18}
                                                y={5}
                                                width={10}
                                                height={2}
                                            />
                                            <polygon
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
                                            />
                                            <rect
                                                id="_Transparent_Rectangle_"
                                                className="st0"
                                                width={32}
                                                height={32}
                                                stroke="none"
                                            />
                                        </svg>
                                    </span>
                                    <span className="flex justify-start w-full pl-1">
                                        <span className="block">option</span>
                                    </span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["MetaLeft","Left command"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex items-center justify-center w-8"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex items-center flex-col h-full justify-between py-[4px] text-[var(--mk-legend)]">
                                    <span className="flex justify-end w-full pr-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-[6px] w-[6px]"
                                        >
                                            <path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10" />
                                        </svg>
                                    </span>
                                    <span className="flex justify-start w-full pl-1">
                                        <span className="block">command</span>
                                    </span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["Space","Space"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex items-center justify-center w-[8.2rem]"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]" />
                            </span>
                        </button>
                        <button {...getKeyProps(["MetaRight","Right command"])}>
                            <span
                                className="h-6 macbook-key-face rounded-[3.5px] flex items-center justify-center w-8"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex items-center flex-col h-full justify-between py-[4px] text-[var(--mk-legend)]">
                                    <span className="flex justify-start w-full pl-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-[6px] w-[6px]"
                                        >
                                            <path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10" />
                                        </svg>
                                    </span>
                                    <span className="flex justify-start w-full pl-1">
                                        <span className="block">command</span>
                                    </span>
                                </span>
                            </span>
                        </button>
                        <button {...getKeyProps(["AltRight","Right option"])}>
                            <span
                                className="h-6 w-6 macbook-key-face rounded-[3.5px] flex items-center justify-center"
                                style={{
                                    boxShadow:
                                        "var(--mk-key-inset)"
                                }}
                            >
                                <span className="text-[5px] w-full flex items-center flex-col h-full justify-between py-[4px] text-[var(--mk-legend)]">
                                    <span className="flex justify-start w-full pl-1">
                                        <svg
                                            fill="none"
                                            version="1.1"
                                            id="icon"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 32 32"
                                            className="h-[6px] w-[6px]"
                                        >
                                            <rect
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                x={18}
                                                y={5}
                                                width={10}
                                                height={2}
                                            />
                                            <polygon
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
                                            />
                                            <rect
                                                id="_Transparent_Rectangle_"
                                                className="st0"
                                                width={32}
                                                height={32}
                                                stroke="none"
                                            />
                                        </svg>
                                    </span>
                                    <span className="flex justify-start w-full pl-1">
                                        <span className="block">option</span>
                                    </span>
                                </span>
                            </span>
                        </button>
                        <div className="w-[4.9rem] mt-[2px] h-6 p-[0.5px] rounded-[4px] flex flex-col justify-end items-center">
                            <button {...getKeyProps(["ArrowUp","Up arrow"])}>
                                <span
                                    className="macbook-key-face rounded-[3.5px] flex items-center justify-center w-6 h-3"
                                    style={{
                                        boxShadow:
                                            "var(--mk-key-inset)"
                                    }}
                                >
                                    <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-[6px] w-[6px]"
                                        >
                                            <path
                                                d="M11.293 7.293a1 1 0 0 1 1.32 -.083l.094 .083l6 6l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059l-.002 .059l-.005 .058l-.009 .06l-.01 .052l-.032 .108l-.027 .067l-.07 .132l-.065 .09l-.073 .081l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002h-12c-.852 0 -1.297 -.986 -.783 -1.623l.076 -.084l6 -6z"
                                                fill="currentColor"
                                                strokeWidth={0}
                                            />
                                        </svg>
                                    </span>
                                </span>
                            </button>
                            <div className="flex">
                                <button {...getKeyProps(["ArrowLeft","Left arrow"])}>
                                    <span
                                        className="macbook-key-face rounded-[3.5px] flex items-center justify-center w-6 h-3"
                                        style={{
                                            boxShadow:
                                                "var(--mk-key-inset)"
                                        }}
                                    >
                                        <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-[6px] w-[6px]"
                                            >
                                                <path
                                                    d="M13.883 5.007l.058 -.005h.118l.058 .005l.06 .009l.052 .01l.108 .032l.067 .027l.132 .07l.09 .065l.081 .073l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059v12c0 .852 -.986 1.297 -1.623 .783l-.084 -.076l-6 -6a1 1 0 0 1 -.083 -1.32l.083 -.094l6 -6l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01z"
                                                    fill="currentColor"
                                                    strokeWidth={0}
                                                />
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                                <button {...getKeyProps(["ArrowDown","Down arrow"])}>
                                    <span
                                        className="macbook-key-face rounded-[3.5px] flex items-center justify-center w-6 h-3"
                                        style={{
                                            boxShadow:
                                                "var(--mk-key-inset)"
                                        }}
                                    >
                                        <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-[6px] w-[6px]"
                                            >
                                                <path
                                                    d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z"
                                                    fill="currentColor"
                                                    strokeWidth={0}
                                                />
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                                <button {...getKeyProps(["ArrowRight","Right arrow"])}>
                                    <span
                                        className="macbook-key-face rounded-[3.5px] flex items-center justify-center w-6 h-3"
                                        style={{
                                            boxShadow:
                                                "var(--mk-key-inset)"
                                        }}
                                    >
                                        <span className="text-[5px] w-full flex justify-center items-center flex-col text-[var(--mk-legend)]">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-[6px] w-[6px]"
                                            >
                                                <path
                                                    d="M9 6c0 -.852 .986 -1.297 1.623 -.783l.084 .076l6 6a1 1 0 0 1 .083 1.32l-.083 .094l-6 6l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002l-.059 -.002l-.058 -.005l-.06 -.009l-.052 -.01l-.108 -.032l-.067 -.027l-.132 -.07l-.09 -.065l-.081 -.073l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057l-.002 -12.059z"
                                                    fill="currentColor"
                                                    strokeWidth={0}
                                                />
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
 
export default MacBookKeyboard
