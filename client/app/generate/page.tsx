"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/ui/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface KeyProblem {
  name: string;
  url: string;
  difficulty: "easy" | "medium" | "hard";
  why: string;
}

interface Resource {
  title: string;
  url: string;
  type: "video" | "article" | "visualizer";
}

interface Phase {
  week: string;
  theme: string;
  goal: string;
  patterns: string[];
  dailyFocus: string;
  keyProblems: KeyProblem[];
  resources: Resource[];
  milestone: string;
}

interface GeneratedRoadmap {
  title: string;
  summary: string;
  totalProblems: number;
  phases: Phase[];
  tips: string[];
  warningAreas: string[];
}

// ── Form options ───────────────────────────────────────────────────────────────

const LEVELS = ["Absolute Beginner", "Beginner", "Intermediate", "Advanced"];
const GOALS = [
  "Crack FAANG / Top tech interviews",
  "Get into product-based companies",
  "Competitive programming (Codeforces, ICPC)",
  "Improve LeetCode rating",
  "Learn DSA from scratch",
  "Prepare for college placements",
];
const WEEKS_OPTIONS = [4, 6, 8, 12, 16, 24];
const HOURS_OPTIONS = [1, 2, 3, 4, 5, 6];
const LANGUAGES = ["Python", "Java", "C++", "JavaScript", "Go"];

const DIFF_COLORS: Record<string, string> = {
  easy: "text-green-400 bg-green-950/50 border-green-800/50",
  medium: "text-yellow-400 bg-yellow-950/50 border-yellow-800/50",
  hard: "text-red-400 bg-red-950/50 border-red-800/50",
};

const RESOURCE_ICON: Record<string, string> = {
  video: "▶",
  article: "📄",
  visualizer: "👁",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const { appUser } = useAuthStore();

  const [level, setLevel] = useState("Beginner");
  const [goal, setGoal] = useState(GOALS[0]);
  const [weeks, setWeeks] = useState(8);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [language, setLanguage] = useState(appUser?.preferredLanguage ?? "Python");
  const [weakAreas, setWeakAreas] = useState("");

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(null);
  const [error, setError] = useState("");
  const [openPhase, setOpenPhase] = useState<number>(0);

  const generate = async () => {
    setError("");
    setRoadmap(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, goal, weeks, hoursPerDay, language, weakAreas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
      setRoadmap(data);
      setOpenPhase(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>✨</span> AI Roadmap Generator
          </h1>
          <p className="text-gray-400 mt-1">
            Describe your situation — get a personalized week-by-week DSA plan
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Current level */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Level</label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition border",
                      level === l
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Preferred Language</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition border",
                      language === l
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Your Goal</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={cn(
                      "text-left px-3 py-2.5 rounded-lg text-sm transition border",
                      goal === g
                        ? "bg-brand-600/20 border-brand-500 text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Weeks */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Time Available — <span className="text-white">{weeks} weeks</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {WEEKS_OPTIONS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeeks(w)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition border",
                      weeks === w
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    )}
                  >
                    {w}w
                  </button>
                ))}
              </div>
            </div>

            {/* Hours per day */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Hours per Day — <span className="text-white">{hoursPerDay}h</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {HOURS_OPTIONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHoursPerDay(h)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition border",
                      hoursPerDay === h
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    )}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Weak areas */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Weak Areas / Specific Focus{" "}
                <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={weakAreas}
                onChange={(e) => setWeakAreas(e.target.value)}
                placeholder="e.g. I struggle with dynamic programming and graphs. I'm okay with arrays but want to get better at trees."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none transition"
              />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading}
            className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating your roadmap…
              </>
            ) : (
              <>✨ Generate My Roadmap</>
            )}
          </button>

          {error && (
            <div className="mt-4 bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Generated roadmap */}
        {roadmap && <RoadmapResult roadmap={roadmap} openPhase={openPhase} setOpenPhase={setOpenPhase} />}
      </div>
    </DashboardLayout>
  );
}

// ── Roadmap result ─────────────────────────────────────────────────────────────

function RoadmapResult({
  roadmap,
  openPhase,
  setOpenPhase,
}: {
  roadmap: GeneratedRoadmap;
  openPhase: number;
  setOpenPhase: (i: number) => void;
}) {
  return (
    <div className="space-y-6">

      {/* Overview */}
      <div className="bg-gradient-to-r from-brand-600/20 to-purple-900/20 border border-brand-700/40 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">{roadmap.title}</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{roadmap.summary}</p>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="text-gray-400">
            <span className="text-white font-semibold">{roadmap.phases.length}</span> phases
          </span>
          <span className="text-gray-400">
            <span className="text-white font-semibold">~{roadmap.totalProblems}</span> problems
          </span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-lg">Week-by-Week Plan</h3>
        {roadmap.phases.map((phase, i) => (
          <PhaseCard
            key={i}
            phase={phase}
            index={i}
            isOpen={openPhase === i}
            onToggle={() => setOpenPhase(openPhase === i ? -1 : i)}
          />
        ))}
      </div>

      {/* Tips + Warnings side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-green-800/40 rounded-xl p-5">
          <h4 className="text-green-400 font-semibold mb-3">💡 Tips for Success</h4>
          <ul className="space-y-2">
            {roadmap.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2">
                <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-900 border border-red-800/40 rounded-xl p-5">
          <h4 className="text-red-400 font-semibold mb-3">⚠️ Common Pitfalls</h4>
          <ul className="space-y-2">
            {roadmap.warningAreas.map((w, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2">
                <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  isOpen,
  onToggle,
}: {
  phase: Phase;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header — always visible, click to expand */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-600/50 flex items-center justify-center text-xs font-bold text-brand-400">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">{phase.week}</span>
              <span className="text-white font-semibold">{phase.theme}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{phase.goal}</p>
          </div>
        </div>
        <span className={cn("text-gray-500 transition-transform", isOpen && "rotate-180")}>▼</span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-gray-800 px-5 py-5 space-y-5">

          {/* Daily focus */}
          <div className="bg-brand-600/10 border border-brand-700/30 rounded-lg px-4 py-3">
            <p className="text-xs text-brand-400 font-medium mb-1">Daily Focus</p>
            <p className="text-sm text-gray-300">{phase.dailyFocus}</p>
          </div>

          {/* Patterns to study */}
          {phase.patterns.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Patterns</p>
              <div className="flex flex-wrap gap-2">
                {phase.patterns.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key problems */}
          {phase.keyProblems.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Key Problems</p>
              <div className="space-y-2">
                {phase.keyProblems.map((prob) => (
                  <a
                    key={prob.url}
                    href={prob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg px-3 py-2.5 transition group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white group-hover:text-brand-400 transition truncate">
                        {prob.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{prob.why}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium",
                        DIFF_COLORS[prob.difficulty]
                      )}
                    >
                      {prob.difficulty}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {phase.resources.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Resources</p>
              <div className="flex flex-wrap gap-2">
                {phase.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"
                  >
                    {RESOURCE_ICON[r.type]} {r.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Milestone */}
          <div className="flex items-start gap-2 text-sm text-gray-400 border-t border-gray-800 pt-4">
            <span className="text-yellow-400 shrink-0">🎯</span>
            <p>
              <span className="text-yellow-400 font-medium">Milestone: </span>
              {phase.milestone}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
