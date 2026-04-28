import { Schema, model, Document } from "mongoose";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface ISolvedProblem {
  name: string;
  url: string;
  platform: string;
  solvedAt: Date;
  notes?: string;
}

export interface IProgress extends Document {
  userId: string;           // Firebase UID
  patternId: string;        // Matches id in dsa-patterns.json, e.g. "binary-search"
  patternName: string;
  status: ProgressStatus;
  problemsSolved: number;
  totalProblems: number;
  solvedProblems: ISolvedProblem[];
  notes: string;
  timeSpentMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const SolvedProblemSchema = new Schema<ISolvedProblem>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    platform: { type: String, required: true },
    solvedAt: { type: Date, default: Date.now },
    notes: String,
  },
  { _id: false }
);

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: String, required: true, index: true },
    patternId: { type: String, required: true },
    patternName: { type: String, required: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    problemsSolved: { type: Number, default: 0, min: 0 },
    totalProblems: { type: Number, default: 0, min: 0 },
    solvedProblems: { type: [SolvedProblemSchema], default: [] },
    notes: { type: String, default: "" },
    timeSpentMinutes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// One progress record per user per pattern
ProgressSchema.index({ userId: 1, patternId: 1 }, { unique: true });

export const Progress = model<IProgress>("Progress", ProgressSchema);
