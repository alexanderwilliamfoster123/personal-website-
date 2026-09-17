"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Terminal } from "lucide-react";
import { BashTool } from "@/components/ui/bash-tool";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

const DRAFT_KEY = "alex_foster_contact_draft";
type Draft = { email: string; message: string; requestId: string };
type Phase = "writing" | "sending" | "sent" | "error";

function loadDraft(email: string): Draft {
  const empty = { email, message: "", requestId: "" };
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
    if (saved && typeof saved.email === "string" && saved.email.toLowerCase() === email.toLowerCase() && typeof saved.message === "string") {
      return {
        email,
        message: saved.message.slice(0, 10000),
        // An old form's subject changes its payload, so start a new request for it.
        requestId: !saved.subject && typeof saved.requestId === "string" && /^[a-f0-9]{32}$/.test(saved.requestId) ? saved.requestId : "",
      };
    }
  } catch { /* The terminal also works without browser storage. */ }
  return empty;
}

function saveDraft(draft: Draft) {
  try {
    if (draft.message) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch { /* Keep the current draft when storage is unavailable. */ }
}

function clearSentDraft(submission: Draft) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
    // A response can arrive after navigating away. Keep any newer draft.
    if (saved?.email === submission.email && saved?.message === submission.message && saved?.requestId === submission.requestId) {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  } catch { /* Browser storage is optional. */ }
}

export default function ContactPanel({ email }: { email: string }) {
  const [draft, setDraft] = useState<Draft>(() => loadDraft(email));
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("writing");
  const [error, setError] = useState("");
  const sending = useRef(false);
  const launchRef = useRef<HTMLButtonElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 64, maxHeight: 180 });
  const pending = phase === "sending";
  const sent = phase === "sent";

  useEffect(() => { saveDraft(draft); }, [draft]);
  useEffect(() => { if (open) adjustHeight(); }, [draft.message, open, adjustHeight]);
  useEffect(() => {
    if (!open) return;
    if (sent) terminalRef.current?.focus({ preventScroll: true });
    else textareaRef.current?.focus({ preventScroll: true });
  }, [open, sent, textareaRef]);

  function edit(message: string) {
    if (sending.current) return;
    setDraft((current) => ({ ...current, email, message, requestId: "" }));
    setPhase("writing");
    setError("");
  }

  function close() {
    if (sending.current) return;
    setOpen(false);
    window.requestAnimationFrame(() => launchRef.current?.focus({ preventScroll: true }));
  }

  function writeAnother() {
    setPhase("writing");
    setError("");
  }

  async function submit() {
    if (sending.current || !draft.message.trim()) return;
    if (!email) {
      setError("Please enter your email at the entrance first.");
      setPhase("error");
      return;
    }

    sending.current = true;
    const requestId = draft.requestId || Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const submission = { email, message: draft.message, requestId };
    saveDraft(submission);
    setDraft(submission);
    setError("");
    setPhase("sending");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...submission, website: websiteRef.current?.value ?? "" }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      const result = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      if (!response.ok || result.success !== true) {
        setError(typeof result.error === "string" ? result.error : "Sending couldn’t be confirmed. Please try again.");
        setPhase("error");
        return;
      }
      const empty = { email, message: "", requestId: "" };
      clearSentDraft(submission);
      setDraft(empty);
      setPhase("sent");
    } catch {
      setError("Sending couldn’t be confirmed. Please try again.");
      setPhase("error");
    } finally {
      window.clearTimeout(timeout);
      sending.current = false;
    }
  }

  return <main className="contact-screen screen-centered">
    <div className="contact-content animate-fade-up">
      <h1 className="contact-heading">say hello</h1>
      {!open ? <button ref={launchRef} type="button" className="terminal-launch" onClick={() => setOpen(true)} aria-expanded={false} aria-controls="contact-terminal">
        <Terminal size={13} strokeWidth={1.25} aria-hidden="true" />
        <span>email alex via the terminal</span>
        <ArrowUpRight size={12} strokeWidth={1.25} aria-hidden="true" />
      </button> : <div id="contact-terminal" ref={terminalRef} className="contact-terminal" role="region" aria-label="Email Alex via the terminal" tabIndex={-1} onKeyDown={(event) => {
        if (event.key === "Escape" && !event.nativeEvent.isComposing) { event.stopPropagation(); close(); }
      }}>
        <BashTool
          state={pending ? "running" : "idle"}
          command="mail alex"
          label="mail / alex"
          output={sent ? "message sent.\nthank you for saying hello." : error || undefined}
          outputId="contact-result"
          outputRole={error ? "alert" : "status"}
          approval={{
            onSkip: close,
            onRun: sent ? writeAnother : () => void submit(),
            skipLabel: "close",
            runLabel: sent ? "write another" : error ? "retry" : "send",
            disabled: !sent && !draft.message.trim(),
            hint: !sent && <span id="contact-help">shift + enter ↵</span>,
          }}
        >
          {!sent && <>
            <p className="terminal-from"><span>from</span> <span>{email || "email needed at the entrance"}</span></p>
            <label htmlFor="contact-message" className="sr-only">Your message to Alex</label>
            <div className="terminal-editor" aria-busy={pending}>
              <span className="terminal-prompt" aria-hidden="true">›</span>
              <div className="terminal-input-frame">
                <Textarea
                  id="contact-message"
                  ref={textareaRef}
                  name="message"
                  className="terminal-textarea"
                  placeholder="write your message…"
                  value={draft.message}
                  readOnly={pending}
                  maxLength={10000}
                  rows={2}
                  enterKeyHint="enter"
                  style={{ minHeight: 64, maxHeight: 180 }}
                  aria-describedby={error ? "contact-result" : "contact-help"}
                  onChange={(event) => edit(event.target.value)}
                  onKeyDown={(event) => {
                    // The phone keyboard's Return key adds a line; the visible Send
                    // button sends. Preserve the existing desktop keyboard shortcut.
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229 && !window.matchMedia("(pointer: coarse)").matches) {
                      event.preventDefault();
                      void submit();
                    }
                  }}
                />
              </div>
            </div>
            {draft.message.length >= 9500 && <p className="terminal-count">{10000 - draft.message.length} characters left</p>}
          </>}
        </BashTool>
        {error && <p className="terminal-draft-note">your draft is still here.</p>}
        {!email && <button type="button" className="terminal-entry" onClick={() => window.location.assign("/?entry=1")}>enter your email ↗</button>}
      </div>}
      <div className="contact-trap" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" ref={websiteRef} type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </div>
  </main>;
}
