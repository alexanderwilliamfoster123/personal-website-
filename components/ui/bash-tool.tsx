"use client";

import { memo, type ReactNode } from "react";
import { ArrowUpRight, LoaderCircle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export type BashToolApproval = {
  pending?: boolean;
  onSkip?: () => void;
  onRun?: () => void;
  skipLabel?: string;
  runLabel?: string;
  disabled?: boolean;
  hint?: ReactNode;
};

export type BashToolProps = {
  state?: "idle" | "running";
  command: string;
  label?: string;
  output?: string;
  outputId?: string;
  outputRole?: "status" | "alert";
  approval?: BashToolApproval;
  children?: ReactNode;
  className?: string;
};

// The terminal is a presentation surface. Commands are text, never executed.
// Approval stays controlled so an unsuccessful send can be retried.
export const BashTool = memo(function BashTool({
  state = "idle",
  command,
  label = "terminal",
  output,
  outputId,
  outputRole = "status",
  approval,
  children,
  className,
}: BashToolProps) {
  const isRunning = state === "running";
  const pending = isRunning || Boolean(approval?.pending);

  return <div className={cn("bash-tool", className)}>
    <div className="bash-tool-header">
      <div className="bash-tool-title">
        <Terminal size={12} strokeWidth={1.25} aria-hidden="true" />
        <span className={isRunning ? "bash-tool-shimmer" : undefined}>{isRunning ? "sending" : label}</span>
      </div>
      {isRunning && <LoaderCircle className="bash-tool-spinner" size={12} strokeWidth={1.25} aria-hidden="true" />}
      <span className="sr-only" role="status">{isRunning ? "Sending your message to Alex." : ""}</span>
    </div>
    <div className="bash-tool-body">
      <div className="bash-tool-command"><span aria-hidden="true">$</span> {command}</div>
      {children}
      {!isRunning && output && <div id={outputId} className="bash-tool-output" role={outputRole} aria-atomic="true">{output}</div>}
    </div>
    {approval && <div className="bash-tool-footer">
      <div className="bash-tool-hint">{approval.hint}</div>
      <div className="bash-tool-actions">
        {approval.onSkip && <button type="button" className="bash-tool-button" onClick={approval.onSkip} disabled={pending}>{approval.skipLabel ?? "close"}</button>}
        {approval.onRun && <button type="button" className="bash-tool-button bash-tool-run" onClick={approval.onRun} disabled={pending || approval.disabled}>
          {pending ? "sending…" : (approval.runLabel ?? "run")}
          {!pending && <ArrowUpRight size={12} strokeWidth={1.25} aria-hidden="true" />}
        </button>}
      </div>
    </div>}
  </div>;
});
