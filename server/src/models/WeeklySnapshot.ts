import { Schema, model, Document } from "mongoose";

// Stores weekly aggregates for the progress chart — avoids expensive re-aggregation on every chart load
export interface IWeeklySnapshot extends Document {
  userId: string;
  weekStart: Date;     // Monday 00:00:00 UTC of that week
  problemsSolved: number;
  patternsCompleted: number;
  timeSpentMinutes: number;
}

const WeeklySnapshotSchema = new Schema<IWeeklySnapshot>(
  {
    userId: { type: String, required: true, index: true },
    weekStart: { type: Date, required: true },
    problemsSolved: { type: Number, default: 0 },
    patternsCompleted: { type: Number, default: 0 },
    timeSpentMinutes: { type: Number, default: 0 },
  },
  { timestamps: false }
);

WeeklySnapshotSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export const WeeklySnapshot = model<IWeeklySnapshot>("WeeklySnapshot", WeeklySnapshotSchema);
