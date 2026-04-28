"use client";
import type { Pattern } from "@/types";
import { cn } from "@/lib/utils";

const DIFF_COLORS: Record<string, string> = {
  beginner: "text-green-400 bg-green-950 border-green-800",
  intermediate: "text-yellow-400 bg-yellow-950 border-yellow-800",
  advanced: "text-red-400 bg-red-950 border-red-800",
};

interface Props {
  pattern: Pattern;
  compact?: boolean;
}

export function PatternCard({ pattern, compact }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-xs text-gray-500 font-mono">#{pattern.order}</span>
          <h3 className="text-white font-semibold mt-0.5">{pattern.pattern}</h3>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full border shrink-0",
            DIFF_COLORS[pattern.difficulty]
          )}
        >
          {pattern.difficulty}
        </span>
      </div>

      {!compact && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{pattern.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{pattern.problems.length} problems</span>
        <span>{pattern.resources.length} resources</span>
      </div>

      {pattern.prerequisites.length > 0 && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Prereqs:{" "}
            <span className="text-gray-400">{pattern.prerequisites.join(", ")}</span>
          </p>
        </div>
      )}

      {/* Problems list */}
      {!compact && pattern.problems.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {pattern.problems.slice(0, 3).map((prob) => (
            <a
              key={prob.url}
              href={prob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition"
            >
              <span className="truncate">{prob.name}</span>
              <span
                className={cn(
                  "shrink-0 ml-2",
                  prob.difficulty === "easy"
                    ? "text-green-400"
                    : prob.difficulty === "medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                )}
              >
                {prob.difficulty}
              </span>
            </a>
          ))}
          {pattern.problems.length > 3 && (
            <p className="text-xs text-gray-600">+{pattern.problems.length - 3} more</p>
          )}
        </div>
      )}

      {/* Resources */}
      {!compact && pattern.resources.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {pattern.resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-md transition"
            >
              {r.type === "video" ? "▶ " : r.type === "visualizer" ? "👁 " : "📄 "}
              {r.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
