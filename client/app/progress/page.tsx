"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { SpreadsheetTable, SheetRow } from "@/components/progress/SpreadsheetTable";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { StatCard } from "@/components/progress/StatCard";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import patterns from "../../../shared/dsa-patterns.json";
import { sendDigestEmail } from "@/lib/emails/sendEmail";

const STORAGE_KEY = "dsa_progress_sheet";

// ── Seed rows from the 28 patterns JSON ───────────────────────────────────────
function seedRows(): SheetRow[] {
  return (patterns as { id: string; pattern: string; difficulty: string; problems: { name: string }[] }[]).map((p) => ({
    id: p.id,
    patternName: p.pattern,
    difficulty: p.difficulty,
    status: "not_started" as const,
    problemsCovered: "",
    notes: "",
    solved: 0,
    totalProblems: p.problems.length,
    timeSpentMinutes: 0,
  }));
}

function loadFromStorage(): SheetRow[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(rows: SheetRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [digestSending, setDigestSending] = useState(false);
  const [digestStatus, setDigestStatus] = useState<"" | "sent" | "error">("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load: localStorage first, then backend if available
  useEffect(() => {
    const local = loadFromStorage();
    if (local && local.length > 0) {
      setRows(local);
    } else {
      setRows(seedRows());
    }
  }, []);

  // Auto-save to localStorage + debounced backend sync
  const handleChange = useCallback((updated: SheetRow[]) => {
    setRows(updated);
    saveToStorage(updated);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!user) return;
      setSyncing(true);
      try {
        await Promise.all(
          updated.map((row) =>
            api.put(`/api/progress/${row.id}`, {
              patternName: row.patternName,
              status: row.status,
              problemsSolved: row.solved,
              totalProblems: row.totalProblems,
              notes: `${row.notes}\n\nProblems covered:\n${row.problemsCovered}`.trim(),
              timeSpentMinutes: row.timeSpentMinutes,
            }).catch(() => null) // Backend offline — no-op
          )
        );
        setLastSaved(new Date());
      } finally {
        setSyncing(false);
      }
    }, 1500);
  }, [user]);

  const resetToDefaults = () => {
    if (!confirm("Reset to the default 28 patterns? Your custom rows will be removed but data on the default patterns is kept.")) return;
    const fresh = seedRows();
    const existing = rows.reduce<Record<string, SheetRow>>((acc, r) => { acc[r.id] = r; return acc; }, {});
    const merged = fresh.map((r) => existing[r.id] ? { ...r, ...existing[r.id], patternName: r.patternName, difficulty: r.difficulty } : r);
    handleChange(merged);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSolved = rows.reduce((s, r) => s + r.solved, 0);
  const completed = rows.filter((r) => r.status === "completed").length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const totalMinutes = rows.reduce((s, r) => s + r.timeSpentMinutes, 0);

  const sendDigest = async () => {
    if (!user?.email) return;
    setDigestSending(true);
    setDigestStatus("");
    try {
      await sendDigestEmail(user.email, user.displayName ?? "there", {
        name: user.displayName ?? "there",
        totalSolved,
        completed,
        inProgress,
        totalPatterns: rows.length,
        timeSpentMinutes: totalMinutes,
        topPatterns: rows
          .filter((r) => r.solved > 0)
          .sort((a, b) => b.solved - a.solved)
          .slice(0, 5)
          .map((r) => ({ name: r.patternName, solved: r.solved, status: r.status })),
      });
      setDigestStatus("sent");
    } catch {
      setDigestStatus("error");
    } finally {
      setDigestSending(false);
      setTimeout(() => setDigestStatus(""), 4000);
    }
  };

  // Simple weekly chart data from localStorage timestamps — fake a sparkline
  const chartData = rows
    .filter((r) => r.solved > 0)
    .slice(-8)
    .map((r, i) => ({ week: `W${i + 1}`, solved: r.solved }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Click any cell to edit · Tab to move · Click status badge to cycle
            </p>
          </div>
          <div className="flex items-center gap-3">
            {syncing && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            )}
            {!syncing && lastSaved && (
              <span className="text-xs text-gray-600">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => setShowChart(!showChart)}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"
            >
              {showChart ? "Hide Chart" : "Show Chart"}
            </button>
            {user && (
              <button
                onClick={sendDigest}
                disabled={digestSending}
                className="text-sm bg-indigo-700 hover:bg-indigo-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition"
              >
                {digestSending ? "Sending…" : "📧 Email Digest"}
              </button>
            )}
            {digestStatus === "sent" && (
              <span className="text-xs text-green-400">✓ Digest sent!</span>
            )}
            {digestStatus === "error" && (
              <span className="text-xs text-red-400">Failed to send</span>
            )}
            <button
              onClick={resetToDefaults}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded-lg transition"
            >
              Reset Patterns
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Problems Solved" value={totalSolved} color="indigo" />
          <StatCard label="Patterns Completed" value={completed} color="green" />
          <StatCard label="In Progress" value={inProgress} color="yellow" />
          <StatCard label="Time Invested" value={totalMinutes >= 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes}m`} color="purple" />
        </div>

        {/* Chart */}
        {showChart && chartData.length > 0 && <ProgressChart data={chartData} />}

        {/* Spreadsheet */}
        <SpreadsheetTable rows={rows} onChange={handleChange} />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2">
          <span>💾 Auto-saved to browser storage</span>
          <span>⌨️ Tab = next cell · Esc = deselect</span>
          <span>📝 Problems Covered = type anything (name, URL, notes)</span>
          <span>🔄 Status badge = click to cycle</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
