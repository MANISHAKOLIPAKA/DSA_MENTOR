"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { PatternCard } from "@/components/patterns/PatternCard";
import rawPatterns from "../../../shared/dsa-patterns.json";
import type { Pattern, Difficulty } from "@/types";

const ALL_PATTERNS = rawPatterns as Pattern[];

const DIFFICULTIES: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function RoadmapPage() {
  const [filter, setFilter] = useState<Difficulty | "all">("all");

  const patterns = useMemo(
    () =>
      filter === "all"
        ? ALL_PATTERNS
        : ALL_PATTERNS.filter((p) => p.difficulty === filter),
    [filter]
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">DSA Roadmap</h1>
            <p className="text-gray-400 mt-1">
              {patterns.length} patterns — sorted by prerequisite order
            </p>
          </div>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setFilter(d.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === d.value
                    ? "bg-brand-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((p) => (
            <PatternCard key={p.id} pattern={p} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
