"use client";
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RowStatus = "not_started" | "in_progress" | "completed" | "skipped";

export interface SheetRow {
  id: string;
  patternName: string;
  difficulty: string;
  status: RowStatus;
  problemsCovered: string;   // free-text — newline separated list the user types
  notes: string;
  solved: number;
  totalProblems: number;
  timeSpentMinutes: number;
}

interface Props {
  rows: SheetRow[];
  onChange: (rows: SheetRow[]) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<RowStatus, { label: string; bg: string; dot: string }> = {
  not_started: { label: "Not Started", bg: "bg-gray-700 text-gray-300", dot: "bg-gray-500" },
  in_progress:  { label: "In Progress", bg: "bg-yellow-900/60 text-yellow-300", dot: "bg-yellow-400" },
  completed:    { label: "Completed",   bg: "bg-green-900/60 text-green-300",  dot: "bg-green-400" },
  skipped:      { label: "Skipped",     bg: "bg-gray-800 text-gray-500",       dot: "bg-gray-600" },
};

const STATUS_CYCLE: RowStatus[] = ["not_started", "in_progress", "completed", "skipped"];

const DIFF_COLOR: Record<string, string> = {
  beginner:     "text-green-400",
  intermediate: "text-yellow-400",
  advanced:     "text-red-400",
};

// ── Spreadsheet Table ─────────────────────────────────────────────────────────

export function SpreadsheetTable({ rows, onChange }: Props) {
  const [activeCell, setActiveCell] = useState<{ row: number; col: string } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  const updateRow = useCallback(
    (id: string, patch: Partial<SheetRow>) => {
      onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [rows, onChange]
  );

  const cycleStatus = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id)!;
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(row.status) + 1) % STATUS_CYCLE.length];
      updateRow(id, { status: next });
    },
    [rows, updateRow]
  );

  const addRow = () => {
    const newRow: SheetRow = {
      id: `custom-${Date.now()}`,
      patternName: "New Topic",
      difficulty: "intermediate",
      status: "not_started",
      problemsCovered: "",
      notes: "",
      solved: 0,
      totalProblems: 0,
      timeSpentMinutes: 0,
    };
    onChange([...rows, newRow]);
    setActiveCell({ row: rows.length, col: "patternName" });
  };

  const deleteRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // Click outside → deselect
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setActiveCell(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const completedCount = rows.filter((r) => r.status === "completed").length;
  const inProgressCount = rows.filter((r) => r.status === "in_progress").length;

  return (
    <div ref={tableRef} className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm text-gray-400">
          <span>
            <span className="text-green-400 font-semibold">{completedCount}</span> done
          </span>
          <span>
            <span className="text-yellow-400 font-semibold">{inProgressCount}</span> in progress
          </span>
          <span>
            <span className="text-gray-300 font-semibold">{rows.length}</span> total topics
          </span>
        </div>
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 border border-brand-700/50 hover:border-brand-500 px-3 py-1.5 rounded-lg transition"
        >
          + Add Row
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="grid bg-gray-800/80 border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wide font-medium"
          style={{ gridTemplateColumns: "2rem 1fr 7rem 8rem 5.5rem 5.5rem 5.5rem 2rem" }}
        >
          <div className="px-2 py-2.5 text-center">#</div>
          <div className="px-3 py-2.5">Pattern / Topic</div>
          <div className="px-3 py-2.5">Status</div>
          <div className="px-3 py-2.5">Problems Covered</div>
          <div className="px-3 py-2.5 text-center">Solved</div>
          <div className="px-3 py-2.5 text-center">Time (m)</div>
          <div className="px-3 py-2.5">Notes</div>
          <div />
        </div>

        {/* Rows */}
        {rows.map((row, idx) => (
          <TableRow
            key={row.id}
            row={row}
            index={idx}
            isExpanded={expandedRows.has(row.id)}
            activeCol={activeCell?.row === idx ? activeCell.col : null}
            onActivate={(col) => setActiveCell({ row: idx, col })}
            onUpdate={(patch) => updateRow(row.id, patch)}
            onCycleStatus={() => cycleStatus(row.id)}
            onToggleExpand={() => toggleExpand(row.id)}
            onDelete={() => deleteRow(row.id)}
          />
        ))}

        {rows.length === 0 && (
          <div className="py-12 text-center text-gray-600 text-sm">
            No rows yet — click <span className="text-brand-400">+ Add Row</span> or load the default patterns above.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Single row ────────────────────────────────────────────────────────────────

interface RowProps {
  row: SheetRow;
  index: number;
  isExpanded: boolean;
  activeCol: string | null;
  onActivate: (col: string) => void;
  onUpdate: (patch: Partial<SheetRow>) => void;
  onCycleStatus: () => void;
  onToggleExpand: () => void;
  onDelete: () => void;
}

function TableRow({
  row, index, isExpanded, activeCol,
  onActivate, onUpdate, onCycleStatus, onToggleExpand, onDelete,
}: RowProps) {
  const isActive = activeCol !== null;
  const meta = STATUS_META[row.status];

  const handleKeyDown = (e: KeyboardEvent, col: string) => {
    if (e.key === "Escape") onActivate("__none__");
    if (e.key === "Tab") {
      e.preventDefault();
      const cols = ["patternName", "problemsCovered", "solved", "timeSpentMinutes", "notes"];
      const next = cols[(cols.indexOf(col) + 1) % cols.length];
      onActivate(next);
    }
  };

  return (
    <div
      className={cn(
        "border-b border-gray-800 last:border-b-0 transition-colors",
        isActive ? "bg-gray-800/60" : index % 2 === 0 ? "bg-gray-900" : "bg-gray-900/50",
        "hover:bg-gray-800/40"
      )}
    >
      {/* Main row */}
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: "2rem 1fr 7rem 8rem 5.5rem 5.5rem 5.5rem 2rem" }}
      >
        {/* Row number */}
        <div className="px-2 py-2 text-center text-xs text-gray-600 font-mono">
          {index + 1}
        </div>

        {/* Pattern name */}
        <div
          className="px-3 py-2 cursor-text"
          onClick={() => onActivate("patternName")}
        >
          {activeCol === "patternName" ? (
            <input
              autoFocus
              value={row.patternName}
              onChange={(e) => onUpdate({ patternName: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "patternName")}
              className="w-full bg-transparent outline-none text-white text-sm"
            />
          ) : (
            <div>
              <span className="text-sm text-white">{row.patternName}</span>
              {row.difficulty && (
                <span className={cn("text-xs ml-2", DIFF_COLOR[row.difficulty] ?? "text-gray-500")}>
                  {row.difficulty}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status — click to cycle */}
        <div className="px-3 py-2">
          <button
            onClick={onCycleStatus}
            className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition hover:opacity-80", meta.bg)}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", meta.dot)} />
            {meta.label}
          </button>
        </div>

        {/* Problems covered — expand to textarea */}
        <div
          className="px-3 py-2 cursor-pointer"
          onClick={() => { onActivate("problemsCovered"); onToggleExpand(); }}
        >
          {activeCol === "problemsCovered" || isExpanded ? (
            <textarea
              autoFocus={activeCol === "problemsCovered"}
              rows={3}
              value={row.problemsCovered}
              onChange={(e) => onUpdate({ problemsCovered: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Escape") onActivate("__none__"); }}
              placeholder={"Two Sum\nValid Palindrome\nhttps://leetcode.com/..."}
              className="w-full bg-gray-800 border border-brand-600/50 rounded-md px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 resize-none focus:outline-none font-mono leading-relaxed"
            />
          ) : (
            <div className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {row.problemsCovered
                ? row.problemsCovered.split("\n").filter(Boolean).map((p, i) => (
                    <span key={i} className="inline-block bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded mr-1 mb-0.5 truncate max-w-[6rem]">
                      {p.replace(/https?:\/\/[^\s]+\/problems\/([^/?]+).*/, "$1").replace(/^https?:\/\/.*/, "link")}
                    </span>
                  ))
                : <span className="text-gray-700 italic">click to add…</span>
              }
            </div>
          )}
        </div>

        {/* Solved count */}
        <div
          className="px-3 py-2 text-center cursor-text"
          onClick={() => onActivate("solved")}
        >
          {activeCol === "solved" ? (
            <input
              autoFocus
              type="number"
              min={0}
              value={row.solved}
              onChange={(e) => onUpdate({ solved: Math.max(0, Number(e.target.value)) })}
              onKeyDown={(e) => handleKeyDown(e, "solved")}
              className="w-12 text-center bg-gray-800 border border-brand-600/50 rounded px-1 py-0.5 text-sm text-white focus:outline-none"
            />
          ) : (
            <span className={cn("text-sm font-mono", row.solved > 0 ? "text-white" : "text-gray-600")}>
              {row.solved}{row.totalProblems > 0 ? `/${row.totalProblems}` : ""}
            </span>
          )}
        </div>

        {/* Time */}
        <div
          className="px-3 py-2 text-center cursor-text"
          onClick={() => onActivate("timeSpentMinutes")}
        >
          {activeCol === "timeSpentMinutes" ? (
            <input
              autoFocus
              type="number"
              min={0}
              value={row.timeSpentMinutes}
              onChange={(e) => onUpdate({ timeSpentMinutes: Math.max(0, Number(e.target.value)) })}
              onKeyDown={(e) => handleKeyDown(e, "timeSpentMinutes")}
              className="w-14 text-center bg-gray-800 border border-brand-600/50 rounded px-1 py-0.5 text-sm text-white focus:outline-none"
            />
          ) : (
            <span className={cn("text-sm font-mono", row.timeSpentMinutes > 0 ? "text-white" : "text-gray-600")}>
              {row.timeSpentMinutes > 0 ? `${row.timeSpentMinutes}m` : "—"}
            </span>
          )}
        </div>

        {/* Notes */}
        <div
          className="px-3 py-2 cursor-text"
          onClick={() => onActivate("notes")}
        >
          {activeCol === "notes" ? (
            <input
              autoFocus
              value={row.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "notes")}
              placeholder="Add notes…"
              className="w-full bg-transparent border-b border-brand-600/50 outline-none text-sm text-white placeholder-gray-600 pb-0.5"
            />
          ) : (
            <span className={cn("text-xs line-clamp-1", row.notes ? "text-gray-300" : "text-gray-700 italic")}>
              {row.notes || "—"}
            </span>
          )}
        </div>

        {/* Delete */}
        <div className="flex items-center justify-center">
          <button
            onClick={onDelete}
            className="text-gray-700 hover:text-red-500 transition text-xs px-1 py-1 rounded"
            title="Delete row"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
