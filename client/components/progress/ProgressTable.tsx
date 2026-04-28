"use client";
import { useState, useCallback } from "react";
import type { ProgressRow, ProgressStatus } from "@/types";
import { cn, STATUS_BADGE } from "@/lib/utils";

interface Props {
  rows: ProgressRow[];
  onSave: (patternId: string, changes: Partial<ProgressRow>) => Promise<void>;
}

const STATUS_OPTIONS: ProgressStatus[] = ["not_started", "in_progress", "completed"];
const STATUS_LABELS: Record<ProgressStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

export function ProgressTable({ rows, onSave }: Props) {
  const [saving, setSaving] = useState<string | null>(null);

  const handleChange = useCallback(
    async (patternId: string, field: keyof ProgressRow, value: unknown) => {
      setSaving(patternId);
      try {
        await onSave(patternId, { [field]: value });
      } finally {
        setSaving(null);
      }
    },
    [onSave]
  );

  if (rows.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-500">No progress records yet.</p>
        <p className="text-sm text-gray-600 mt-1">
          Visit the Roadmap page and start a pattern to create your first entry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Pattern</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Solved / Total</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Time (min)</th>
              <th className="px-4 py-3 text-gray-400 font-medium text-left">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map((row) => (
              <tr
                key={row.patternId}
                className={cn(
                  "hover:bg-gray-800/30 transition",
                  saving === row.patternId && "opacity-60"
                )}
              >
                <td className="px-4 py-3 text-white font-medium">{row.patternName}</td>

                <td className="px-4 py-3 text-center">
                  <select
                    value={row.status}
                    onChange={(e) =>
                      handleChange(row.patternId, "status", e.target.value)
                    }
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none",
                      STATUS_BADGE[row.status]
                    )}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={row.totalProblems || 999}
                      value={row.problemsSolved}
                      onChange={(e) =>
                        handleChange(row.patternId, "problemsSolved", Number(e.target.value))
                      }
                      className="w-12 text-center bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-white focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-400 w-8 text-center">{row.totalProblems || "—"}</span>
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min={0}
                    value={row.timeSpentMinutes}
                    onChange={(e) =>
                      handleChange(row.patternId, "timeSpentMinutes", Number(e.target.value))
                    }
                    className="w-16 text-center bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-white focus:outline-none focus:border-brand-500"
                  />
                </td>

                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(e) =>
                      handleChange(row.patternId, "notes", e.target.value)
                    }
                    placeholder="Add notes…"
                    className="w-full bg-transparent border-b border-gray-700 focus:border-brand-500 text-gray-300 text-xs py-0.5 focus:outline-none transition placeholder-gray-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
