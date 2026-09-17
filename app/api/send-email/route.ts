import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const fromEmail = process.env.RESEND_FROM_EMAIL;


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      subject,
      message,
    } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 }
      );
    }

    const senderName = name || "Visitor";

    const emailSubject =
      subject || `Hello from ${senderName.toLowerCase()}`;

    const destination = process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL;

    if (!destination) {
      throw new Error("TO_EMAIL is not configured");
    }
    if (!fromEmail) {
      throw new Error("FROM_EMAIL is not configured");
    }
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: fromEmail,

      // Fixed portfolio/company email
      to: [destination],

      // When you click Reply, it replies to the visitor
      replyTo: email,

      subject: emailSubject,

      html: `
  <div
    style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Helvetica, Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 28px;
      color: #1d1d1f;
      font-size: 15px;
      line-height: 1.65;
    "
  >
    <div style="
      white-space: pre-wrap;
    ">
      ${message.trim()}
    </div>

    <!-- Reply metadata -->
    <div
      style="
        margin-top: 28px;
        padding-top: 14px;
        border-top: 1px solid #e5e5e7;
        font-size: 12px;
        line-height: 1.5;
        color: #86868b;
      "
    >
      <span style="font-weight: 500;">
        Reply-to:
      </span>

      <a
        href="mailto:${email}"
        style="
          color:#757575 ;
          text-decoration: none;
          margin-left: 4px;
        "
      >
        ${email}
      </a>
    </div>
  </div>
`,

      text: `${message.trim()}

Reply-to: ${email}`,



    });

    if (error) {
      console.error("Resend API error:", error);

      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to send email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: unknown) {
    console.error("Error in /api/send-email:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}