import { create } from "zustand";
import type { ProgressRow, ProgressSummary, WeeklySnapshot } from "@/types";

interface ProgressState {
  rows: ProgressRow[];
  summary: ProgressSummary | null;
  weeklyData: WeeklySnapshot[];
  setRows: (rows: ProgressRow[]) => void;
  updateRow: (updated: ProgressRow) => void;
  setSummary: (s: ProgressSummary) => void;
  setWeeklyData: (data: WeeklySnapshot[]) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  rows: [],
  summary: null,
  weeklyData: [],
  setRows: (rows) => set({ rows }),
  updateRow: (updated) =>
    set((state) => ({
      rows: state.rows.map((r) => (r.patternId === updated.patternId ? updated : r)),
    })),
  setSummary: (summary) => set({ summary }),
  setWeeklyData: (weeklyData) => set({ weeklyData }),
}));
