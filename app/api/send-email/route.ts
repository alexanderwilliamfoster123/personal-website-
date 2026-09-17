import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const messageSchema = z.object({
  email: z.string().trim().max(254).email(),
  subject: z.string().trim().max(160).refine((value) => !/[\r\n]/.test(value)).optional().default(""),
  message: z.string().trim().min(1).max(10000),
  requestId: z.string().regex(/^[a-f0-9]{32}$/),
  website: z.string().max(0).optional().default(""),
});

function failure(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (req.headers.get("sec-fetch-site") === "cross-site") {
    return failure("Please send your message from the contact page.", 403);
  }
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return failure("Please send your message from the contact page.", 415);
  }
  if (Number(req.headers.get("content-length")) > 64000) return failure("Your message is too long.", 413);

  let body: unknown;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 64000) return failure("Your message is too long.", 413);
    body = JSON.parse(raw);
  } catch {
    return failure("Please check your message and try again.", 400);
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return failure("Please enter a valid email and a message of up to 10,000 characters.", 400);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim() || process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !from || !to) {
    return failure("Email delivery isn’t connected yet. Your message hasn’t been sent.", 503);
  }

  const { email, subject, message, requestId } = parsed.data;
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: subject || "A message from your website",
      text: `${message}\n\nReply-to: ${email}`,
    }, { idempotencyKey: `contact-${requestId}` });

    if (error || !data?.id) return failure("Sending couldn’t be confirmed. Please try again.", 502);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return failure("Sending couldn’t be confirmed. Please try again.", 502);
  }
}
