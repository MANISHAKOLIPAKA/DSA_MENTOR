"use client";
import { useEffect } from "react";
import api from "@/lib/api";
import { useProgressStore } from "@/store/progressStore";
import type { ProgressRow } from "@/types";

export function useProgress() {
  const { rows, setRows, updateRow, summary, setSummary, weeklyData, setWeeklyData } =
    useProgressStore();

  useEffect(() => {
    if (rows.length > 0) return; // Already loaded this session
    api.get<ProgressRow[]>("/api/progress").then(({ data }) => setRows(data));
    api.get("/api/progress/stats/summary").then(({ data }) => setSummary(data));
    api.get("/api/progress/chart/weekly").then(({ data }) => setWeeklyData(data));
  }, [rows.length, setRows, setSummary, setWeeklyData]);

  const save = async (patternId: string, changes: Partial<ProgressRow>) => {
    const { data } = await api.put<ProgressRow>(`/api/progress/${patternId}`, changes);
    updateRow(data);
    // Refresh summary after any save
    api.get("/api/progress/stats/summary").then(({ data }) => setSummary(data));
  };

  return { rows, summary, weeklyData, save };
}
