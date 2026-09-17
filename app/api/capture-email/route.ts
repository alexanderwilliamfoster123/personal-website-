import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/db";

const captureSchema = z.object({ email: z.string().trim().max(254).email() });

function failure(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (req.headers.get("sec-fetch-site") === "cross-site") return failure("Please enter your email on the website.", 403);
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("Please enter your email on the website.", 415);
  if (Number(req.headers.get("content-length")) > 4096) return failure("Please enter a valid email address.", 413);

  let body: unknown;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 4096) return failure("Please enter a valid email address.", 413);
    body = JSON.parse(raw);
  } catch {
    return failure("Please enter a valid email address.", 400);
  }

  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) return failure("That doesn’t look like a valid email address.", 400);

  try {
    const now = new Date().toISOString();
    const result = await getDatabase().prepare(
      "INSERT INTO email_captures (email, created_at, last_entered_at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET last_entered_at = excluded.last_entered_at"
    ).bind(parsed.data.email.toLowerCase(), now, now).run();
    if (!result.success) throw new Error("Email insert was not acknowledged by storage.");
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Email capture storage failed:", error instanceof Error ? error.message : "Unknown storage error");
    return failure("Your email couldn’t be saved. Please try again.", 503);
  }
}
