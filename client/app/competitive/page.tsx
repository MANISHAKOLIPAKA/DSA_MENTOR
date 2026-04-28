"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { CPAccounts, LeetCodeStats, CodeforcesStats } from "@/types";
import { PLATFORM_URLS } from "@/lib/utils";

// ── Platform config ────────────────────────────────────────────────────────────

const PLATFORMS: {
  key: keyof CPAccounts;
  label: string;
  placeholder: string;
  accent: string;
  logo: string;
  // Extracts username from a full profile URL, or returns the raw string if it's already a username
  parseUrl: (input: string) => string;
}[] = [
  {
    key: "leetcode",
    label: "LeetCode",
    placeholder: "Paste URL or username — e.g. leetcode.com/yourname",
    accent: "border-orange-700/50 bg-orange-950/10",
    logo: "🟡",
    parseUrl: (s) => {
      // https://leetcode.com/u/username/ or https://leetcode.com/username/
      const m = s.match(/leetcode\.com\/(?:u\/)?([^/?#\s]+)/i);
      return m ? m[1].replace(/\/$/, "") : s.trim();
    },
  },
  {
    key: "codeforces",
    label: "Codeforces",
    placeholder: "Paste URL or handle — e.g. codeforces.com/profile/handle",
    accent: "border-blue-700/50 bg-blue-950/10",
    logo: "🔵",
    parseUrl: (s) => {
      const m = s.match(/codeforces\.com\/profile\/([^/?#\s]+)/i);
      return m ? m[1].replace(/\/$/, "") : s.trim();
    },
  },
  {
    key: "codechef",
    label: "CodeChef",
    placeholder: "Paste URL or username — e.g. codechef.com/users/name",
    accent: "border-amber-700/50 bg-amber-950/10",
    logo: "🍴",
    parseUrl: (s) => {
      const m = s.match(/codechef\.com\/users\/([^/?#\s]+)/i);
      return m ? m[1].replace(/\/$/, "") : s.trim();
    },
  },
  {
    key: "hackerrank",
    label: "HackerRank",
    placeholder: "Paste URL or username — e.g. hackerrank.com/profile/name",
    accent: "border-green-700/50 bg-green-950/10",
    logo: "🟢",
    parseUrl: (s) => {
      // /profile/username or /username
      const m = s.match(/hackerrank\.com\/(?:profile\/)?([^/?#\s]+)/i);
      return m ? m[1].replace(/\/$/, "") : s.trim();
    },
  },
  {
    key: "hackerearth",
    label: "HackerEarth",
    placeholder: "Paste URL or username — e.g. hackerearth.com/@name",
    accent: "border-purple-700/50 bg-purple-950/10",
    logo: "🟣",
    parseUrl: (s) => {
      const m = s.match(/hackerearth\.com\/@([^/?#\s]+)/i);
      return m ? m[1].replace(/\/$/, "") : s.trim().replace(/^@/, "");
    },
  },
  {
    key: "gfg",
    label: "GeeksforGeeks",
    placeholder: "Paste URL or username — e.g. geeksforgeeks.org/user/name",
    accent: "border-lime-700/50 bg-lime-950/10",
    logo: "🌿",
    parseUrl: (s) => {
      const m = s.match(/geeksforgeeks\.org\/user\/([^/?#\s]+)/i);
      return m ? m[1].replace(/\/$/, "") : s.trim();
    },
  },
  {
    key: "interviewbit",
    label: "InterviewBit",
    placeholder: "Paste URL or username — e.g. interviewbit.com/profile/name",
    accent: "border-teal-700/50 bg-teal-950/10",
    logo: "💼",
    parseUrl: (s) => {
      const m = s.match(/interviewbit\.com\/profile\/([^/?#\s]+)/i);
      return m ? m[1].replace(/\/$/, "") : s.trim();
    },
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function CompetitivePage() {
  const { appUser } = useAuthStore();
  const [accounts, setAccounts] = useState<CPAccounts>({});
  const [draft, setDraft] = useState<CPAccounts>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<{ leetcode?: LeetCodeStats; codeforces?: CodeforcesStats }>({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (appUser) {
      setAccounts(appUser.cpAccounts ?? {});
      setDraft(appUser.cpAccounts ?? {});
    }
  }, [appUser]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get("/api/integrations/all");
      setStats(data);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleInput = (key: keyof CPAccounts, raw: string) => {
    const platform = PLATFORMS.find((p) => p.key === key)!;
    const parsed = raw ? platform.parseUrl(raw) : "";
    setDraft((d) => ({ ...d, [key]: parsed || undefined }));
  };

  const saveAccounts = async () => {
    setSaving(true);
    try {
      await api.patch("/api/auth/profile", { cpAccounts: draft });
      setAccounts({ ...draft });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const linkedCount = PLATFORMS.filter((p) => accounts[p.key]).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Competitive Programming</h1>
            <p className="text-gray-400 mt-1">
              {linkedCount === 0
                ? "Paste your profile URLs below to link your accounts"
                : `${linkedCount} of ${PLATFORMS.length} platforms linked`}
            </p>
          </div>
          <div className="flex gap-3">
            {linkedCount > 0 && (
              <button
                onClick={fetchStats}
                disabled={loadingStats}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {loadingStats ? "Fetching…" : "Refresh Stats"}
              </button>
            )}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition"
              >
                {linkedCount === 0 ? "Add Profiles" : "Edit Profiles"}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setDraft(accounts); setEditing(false); }}
                  className="text-sm text-gray-400 hover:text-white px-4 py-2 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAccounts}
                  disabled={saving}
                  className="text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg transition"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {saved && (
          <div className="mb-6 bg-green-950 border border-green-800 text-green-300 text-sm px-4 py-3 rounded-lg">
            ✓ Profiles saved successfully
          </div>
        )}

        {/* Live stats */}
        {(stats.leetcode || stats.codeforces) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {stats.leetcode && <LeetCodeCard stats={stats.leetcode} username={accounts.leetcode} />}
            {stats.codeforces && <CodeforcesCard stats={stats.codeforces} handle={accounts.codeforces} />}
          </div>
        )}

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLATFORMS.map((platform) => {
            const username = accounts[platform.key];
            const profileUrl = username ? `${PLATFORM_URLS[platform.key]}${username}` : null;

            return (
              <div
                key={platform.key}
                className={`rounded-xl border p-4 transition ${platform.accent}`}
              >
                {/* Card header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{platform.logo}</span>
                  <span className="font-medium text-white">{platform.label}</span>
                  {username && !editing && (
                    <span className="ml-auto text-xs bg-green-900/50 text-green-400 border border-green-800/50 px-2 py-0.5 rounded-full">
                      linked
                    </span>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder={platform.placeholder}
                      defaultValue={username ?? ""}
                      onChange={(e) => handleInput(platform.key, e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition"
                    />
                    {/* Show parsed username preview */}
                    {draft[platform.key] && (
                      <p className="text-xs text-gray-500 pl-1">
                        Username: <span className="text-gray-300">{draft[platform.key]}</span>
                      </p>
                    )}
                  </div>
                ) : profileUrl ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 font-mono">{username}</span>
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 border border-brand-700/50 hover:border-brand-500 px-3 py-1.5 rounded-lg transition"
                    >
                      View Profile ↗
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Not linked</span>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-xs text-gray-500 hover:text-brand-400 transition"
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help text when editing */}
        {editing && (
          <p className="text-xs text-gray-600 mt-4 text-center">
            Tip: paste your full profile URL (e.g. <span className="text-gray-500">https://leetcode.com/yourname/</span>) — the username is extracted automatically.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Stat sub-components ────────────────────────────────────────────────────────

function LeetCodeCard({ stats, username }: { stats: LeetCodeStats; username?: string }) {
  return (
    <div className="bg-gray-900 border border-orange-700/40 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🟡</span>
          <h3 className="font-semibold text-white">LeetCode</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Global rank</p>
          <p className="text-sm font-mono text-orange-400">#{stats.ranking.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        {[
          { label: "Easy", value: stats.solved.easy, color: "text-green-400" },
          { label: "Medium", value: stats.solved.medium, color: "text-yellow-400" },
          { label: "Hard", value: stats.solved.hard, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800/60 rounded-lg py-2">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-white">{stats.solved.total}</span>
          <span className="text-xs text-gray-500 ml-1">solved</span>
        </div>
        {username && (
          <a
            href={`${PLATFORM_URLS.leetcode}${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-500 hover:underline"
          >
            @{username} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function CodeforcesCard({ stats, handle }: { stats: CodeforcesStats; handle?: string }) {
  const rankColor: Record<string, string> = {
    newbie: "text-gray-400",
    pupil: "text-green-400",
    specialist: "text-cyan-400",
    expert: "text-blue-400",
    "candidate master": "text-purple-400",
    master: "text-orange-400",
    "international master": "text-orange-300",
    grandmaster: "text-red-400",
    "international grandmaster": "text-red-300",
    "legendary grandmaster": "text-red-200",
  };
  const color = rankColor[stats.rank?.toLowerCase()] ?? "text-gray-300";

  return (
    <div className="bg-gray-900 border border-blue-700/40 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔵</span>
          <h3 className="font-semibold text-white">Codeforces</h3>
        </div>
        <span className={`text-xs font-medium capitalize ${color}`}>{stats.rank}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/60 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.rating}</p>
          <p className="text-xs text-gray-500 mt-0.5">Current</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-300">{stats.maxRating}</p>
          <p className="text-xs text-gray-500 mt-0.5">Peak</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 capitalize">
          Max rank: <span className="text-gray-300">{stats.maxRank}</span>
        </p>
        {handle && (
          <a
            href={`${PLATFORM_URLS.codeforces}${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-500 hover:underline"
          >
            @{handle} ↗
          </a>
        )}
      </div>
    </div>
  );
}
