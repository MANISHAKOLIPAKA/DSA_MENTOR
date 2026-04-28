// ── Shared styles ──────────────────────────────────────────────────────────────
const base = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #030712;
  color: #f3f4f6;
  margin: 0; padding: 0;
`;
const card = `
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 24px;
  margin: 0 auto;
  max-width: 560px;
`;
const btn = `
  display: inline-block;
  background: #4f46e5;
  color: #ffffff !important;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
`;
const muted = `color: #6b7280; font-size: 13px;`;
const h1 = `color: #f9fafb; font-size: 22px; font-weight: 700; margin: 0 0 8px;`;
const h2 = `color: #e5e7eb; font-size: 16px; font-weight: 600; margin: 20px 0 8px;`;
const tag = (color: string) =>
  `display:inline-block; background:${color}22; color:${color}; border:1px solid ${color}44; border-radius:99px; padding:2px 10px; font-size:12px; font-weight:500;`;

// ── Welcome email ──────────────────────────────────────────────────────────────
export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to DSA Teacher 🎯",
    html: `
<html><body style="${base}">
<div style="padding: 32px 16px;">
  <div style="${card}">
    <div style="text-align:center; margin-bottom:24px;">
      <div style="font-size:40px;">🎯</div>
      <h1 style="${h1}">Welcome, ${name}!</h1>
      <p style="color:#9ca3af; margin:0; font-size:15px;">Your DSA journey starts now.</p>
    </div>

    <p style="color:#d1d5db; font-size:15px; line-height:1.6;">
      DSA Teacher is your personal companion for mastering Data Structures & Algorithms —
      whether you're targeting FAANG interviews, competitive programming, or college placements.
    </p>

    <h2 style="${h2}">What you can do:</h2>
    <table style="width:100%; border-collapse:collapse;">
      ${[
        ["✨", "AI Roadmap", "Generate a personalized week-by-week study plan"],
        ["🗺️", "Roadmap",    "Explore all 28 DSA patterns in order"],
        ["📊", "Progress",   "Track problems solved in an Excel-like sheet"],
        ["🧩", "Patterns",   "Deep-dive into each pattern with curated problems"],
        ["🏆", "Competitive","Link your LeetCode, Codeforces & more profiles"],
      ].map(([icon, label, desc]) => `
        <tr>
          <td style="padding:8px 0; width:32px; font-size:20px; vertical-align:top;">${icon}</td>
          <td style="padding:8px 12px 8px 8px; vertical-align:top;">
            <strong style="color:#f3f4f6;">${label}</strong>
            <p style="${muted} margin:2px 0 0;">${desc}</p>
          </td>
        </tr>
      `).join("")}
    </table>

    <div style="text-align:center; margin-top:28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/generate" style="${btn}">
        Generate My Roadmap →
      </a>
    </div>

    <p style="${muted} text-align:center; margin-top:24px;">
      Happy coding! The DSA Teacher team.
    </p>
  </div>
</div>
</body></html>`,
  };
}

// ── Weekly digest ──────────────────────────────────────────────────────────────
export interface DigestData {
  name: string;
  totalSolved: number;
  completed: number;
  inProgress: number;
  totalPatterns: number;
  timeSpentMinutes: number;
  topPatterns: { name: string; solved: number; status: string }[];
  streak?: number;
}

export function weeklyDigestEmail(data: DigestData): { subject: string; html: string } {
  const pct = Math.round((data.completed / data.totalPatterns) * 100);
  const barFill = `width:${pct}%; background:#4f46e5; height:8px; border-radius:4px;`;
  const barBg   = `background:#1f2937; border-radius:4px; height:8px; margin:6px 0 2px;`;

  const statusTag: Record<string, string> = {
    completed:    tag("#22c55e"),
    in_progress:  tag("#eab308"),
    not_started:  tag("#6b7280"),
  };

  return {
    subject: `📊 Your weekly DSA digest — ${data.completed}/${data.totalPatterns} patterns done`,
    html: `
<html><body style="${base}">
<div style="padding: 32px 16px;">
  <div style="${card}">
    <h1 style="${h1}">Weekly Progress Report</h1>
    <p style="${muted} margin:0 0 20px;">Hey ${data.name}, here's how your week looked 👇</p>

    <!-- Stats row -->
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
      <tr>
        ${[
          { v: data.totalSolved,  l: "Problems Solved",  c: "#818cf8" },
          { v: data.completed,    l: "Patterns Done",    c: "#22c55e" },
          { v: data.inProgress,   l: "In Progress",      c: "#eab308" },
          { v: `${Math.round(data.timeSpentMinutes / 60)}h`, l: "Time Invested", c: "#a78bfa" },
        ].map(({ v, l, c }) => `
          <td style="text-align:center; padding:12px 8px; background:#1f2937; border-radius:8px; margin:4px;">
            <div style="font-size:26px; font-weight:700; color:${c};">${v}</div>
            <div style="${muted}">${l}</div>
          </td>
        `).join('<td style="width:8px;"></td>')}
      </tr>
    </table>

    <!-- Progress bar -->
    <div>
      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
        <span style="color:#d1d5db; font-size:13px; font-weight:600;">Overall Completion</span>
        <span style="color:#818cf8; font-size:13px; font-weight:700;">${pct}%</span>
      </div>
      <div style="${barBg}"><div style="${barFill}"></div></div>
      <div style="${muted}">${data.completed} of ${data.totalPatterns} patterns completed</div>
    </div>

    <!-- Top patterns -->
    ${data.topPatterns.length > 0 ? `
      <h2 style="${h2}">Recent Activity</h2>
      <table style="width:100%; border-collapse:collapse;">
        ${data.topPatterns.map((p) => `
          <tr style="border-bottom:1px solid #1f2937;">
            <td style="padding:8px 0; color:#e5e7eb; font-size:14px;">${p.name}</td>
            <td style="padding:8px 0; text-align:center; color:#9ca3af; font-size:13px;">${p.solved} solved</td>
            <td style="padding:8px 0; text-align:right;">
              <span style="${statusTag[p.status] ?? tag("#6b7280")}">${p.status.replace("_", " ")}</span>
            </td>
          </tr>
        `).join("")}
      </table>
    ` : ""}

    <div style="text-align:center; margin-top:28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/progress" style="${btn}">
        Open Progress Tracker →
      </a>
    </div>

    <p style="${muted} text-align:center; margin-top:20px;">
      Keep it up — consistency beats intensity every time. 💪
    </p>
  </div>
</div>
</body></html>`,
  };
}

// ── Study reminder ─────────────────────────────────────────────────────────────
export function reminderEmail(name: string, daysSince: number): { subject: string; html: string } {
  const messages = [
    "Even 20 minutes today keeps the momentum going.",
    "A problem a day keeps the interview fear away.",
    "Top coders didn't get there in a day — but they showed up every day.",
    "Your future self will thank you for studying today.",
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  return {
    subject: `⏰ Time to get back to DSA, ${name}!`,
    html: `
<html><body style="${base}">
<div style="padding: 32px 16px;">
  <div style="${card}">
    <div style="text-align:center; margin-bottom:20px;">
      <div style="font-size:48px;">⏰</div>
      <h1 style="${h1}">Miss you, ${name}!</h1>
      <p style="color:#9ca3af; font-size:15px; margin:0;">
        You haven't practiced in <strong style="color:#f59e0b;">${daysSince} day${daysSince !== 1 ? "s" : ""}</strong>.
      </p>
    </div>

    <div style="background:#1f2937; border-left:3px solid #4f46e5; padding:14px 16px; border-radius:0 8px 8px 0; margin:20px 0;">
      <p style="color:#d1d5db; font-size:15px; margin:0; font-style:italic;">"${msg}"</p>
    </div>

    <p style="color:#d1d5db; font-size:14px; line-height:1.6;">
      Pick up where you left off — your progress is saved and waiting for you.
      Even solving one problem today will keep your streak alive.
    </p>

    <h2 style="${h2}">Quick start suggestions:</h2>
    <ul style="color:#9ca3af; font-size:14px; line-height:1.8; padding-left:20px;">
      <li>Revisit a pattern you found tricky last time</li>
      <li>Try one medium LeetCode problem (30–45 min)</li>
      <li>Use ✨ AI Roadmap to re-plan if your goals changed</li>
    </ul>

    <div style="text-align:center; margin-top:28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/roadmap" style="${btn}">
        Resume Studying →
      </a>
    </div>

    <p style="${muted} text-align:center; margin-top:20px;">
      To stop these reminders, update your notification preferences in the app.
    </p>
  </div>
</div>
</body></html>`,
  };
}
