import { SUPPORT_EMAIL } from "@shared/plans";

/** Email goes out through Resend when RESEND_API_KEY is set. */
export const emailEnabled = () => !!process.env.RESEND_API_KEY;

/** Public address of the app, for links in emails. Never taken from a request's Host header. */
export function appUrl(devFallback?: string) {
  return (
    process.env.APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://profitpadapp.com" : devFallback || "http://localhost:5000")
  );
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "ProfitPad <no-reply@profitpadapp.com>",
      to: [opts.to],
      reply_to: SUPPORT_EMAIL,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      headers: opts.headers,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
