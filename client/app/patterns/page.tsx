"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { PatternCard } from "@/components/patterns/PatternCard";
import rawPatterns from "../../../shared/dsa-patterns.json";
import type { Pattern } from "@/types";

const ALL_PATTERNS = rawPatterns as Pattern[];

export default function PatternsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      ALL_PATTERNS.filter((p) =>
        p.pattern.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Problem Patterns</h1>
            <p className="text-gray-400 mt-1">
              28 curated patterns with problems and resources
            </p>
          </div>
          <input
            type="text"
            placeholder="Search patterns…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500 w-56"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PatternCard key={p.id} pattern={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-16">
            No patterns match &quot;{search}&quot;
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
