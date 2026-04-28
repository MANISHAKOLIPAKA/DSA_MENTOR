import nodemailer from "nodemailer";
import { NextRequest } from "next/server";
import {
  welcomeEmail,
  weeklyDigestEmail,
  reminderEmail,
  type DigestData,
} from "@/lib/emails/templates";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_SENDER_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, to, name } = body as {
    type: "welcome" | "digest" | "reminder";
    to: string;
    name: string;
    digestData?: DigestData;
    daysSince?: number;
  };

  if (!type || !to || !name) {
    return Response.json({ error: "type, to, and name are required" }, { status: 400 });
  }

  let subject = "";
  let html = "";

  if (type === "welcome") {
    ({ subject, html } = welcomeEmail(name));
  } else if (type === "digest") {
    if (!body.digestData) {
      return Response.json({ error: "digestData is required for digest emails" }, { status: 400 });
    }
    ({ subject, html } = weeklyDigestEmail(body.digestData));
  } else if (type === "reminder") {
    ({ subject, html } = reminderEmail(name, body.daysSince ?? 3));
  } else {
    return Response.json({ error: `Unknown email type: ${type}` }, { status: 400 });
  }

  try {
    const info = await transporter.sendMail({
      from: `"DSA Teacher" <${process.env.GMAIL_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    return Response.json({ id: info.messageId, ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
