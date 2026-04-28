import type { DigestData } from "./templates";

// Client-side helper — calls the Next.js API route
export async function sendWelcomeEmail(to: string, name: string) {
  return fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "welcome", to, name }),
  });
}

export async function sendDigestEmail(to: string, name: string, digestData: DigestData) {
  return fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "digest", to, name, digestData }),
  });
}

export async function sendReminderEmail(to: string, name: string, daysSince: number) {
  return fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "reminder", to, name, daysSince }),
  });
}
