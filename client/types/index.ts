// ── Auth / User ───────────────────────────────────────────────────────────────

export type Language = "java" | "python" | "cpp" | "javascript" | "go" | "rust";

export interface CPAccounts {
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  hackerrank?: string;
  hackerearth?: string;
  gfg?: string;
  interviewbit?: string;
}

export interface AppUser {
  _id: string;
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  preferredLanguage: Language;
  cpAccounts: CPAccounts;
  googleSheetId?: string;
  createdAt: string;
}

// ── DSA Patterns ─────────────────────────────────────────────────────────────

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Problem {
  name: string;
  url: string;
  platform: string;
  difficulty?: string;
}

export interface Resource {
  type: "video" | "article" | "visualizer" | "repo" | "pdf";
  title: string;
  url: string;
  languages?: string[];
}

export interface Pattern {
  id: string;
  pattern: string;
  difficulty: Difficulty;
  order: number;
  description: string;
  prerequisites: string[];
  problems: Problem[];
  resources: Resource[];
}

// ── Progress ──────────────────────────────────────────────────────────────────

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface SolvedProblem {
  name: string;
  url: string;
  platform: string;
  solvedAt: string;
  notes?: string;
}

export interface ProgressRow {
  _id: string;
  userId: string;
  patternId: string;
  patternName: string;
  status: ProgressStatus;
  problemsSolved: number;
  totalProblems: number;
  solvedProblems: SolvedProblem[];
  notes: string;
  timeSpentMinutes: number;
  updatedAt: string;
}

export interface ProgressSummary {
  totalSolved: number;
  totalPatterns: number;
  completed: number;
  inProgress: number;
  totalMinutes: number;
}

export interface WeeklySnapshot {
  weekStart: string;
  problemsSolved: number;
  patternsCompleted: number;
  timeSpentMinutes: number;
}

// ── CP Stats ──────────────────────────────────────────────────────────────────

export interface LeetCodeStats {
  username: string;
  ranking: number;
  solved: { easy: number; medium: number; hard: number; total: number };
  badges: string[];
}

export interface CodeforcesStats {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  avatar: string;
  country?: string;
  organization?: string;
}
