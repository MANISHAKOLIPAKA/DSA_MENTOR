import { Router, Request, Response } from "express";
import { Progress } from "../models/Progress";
import { WeeklySnapshot } from "../models/WeeklySnapshot";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";

const router = Router();

// GET /api/progress — get all progress rows for current user
router.get("/", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  try {
    const rows = await Progress.find({ userId: uid }).sort({ patternName: 1 });
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// PUT /api/progress/:patternId — upsert a single pattern row
router.put("/:patternId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  const { patternId } = req.params;
  const { patternName, status, problemsSolved, totalProblems, notes, timeSpentMinutes } = req.body;

  try {
    const row = await Progress.findOneAndUpdate(
      { userId: uid, patternId },
      {
        $set: {
          patternName,
          ...(status !== undefined && { status }),
          ...(problemsSolved !== undefined && { problemsSolved }),
          ...(totalProblems !== undefined && { totalProblems }),
          ...(notes !== undefined && { notes }),
          ...(timeSpentMinutes !== undefined && { timeSpentMinutes }),
        },
      },
      { upsert: true, new: true }
    );

    // Update weekly snapshot when problems are solved
    if (problemsSolved !== undefined) {
      await upsertWeeklySnapshot(uid, problemsSolved);
    }

    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// POST /api/progress/:patternId/problems — mark a specific problem solved
router.post("/:patternId/problems", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  const { patternId } = req.params;
  const { name, url, platform, notes } = req.body;

  if (!name || !url || !platform) {
    res.status(400).json({ error: "name, url, and platform are required" });
    return;
  }

  try {
    const row = await Progress.findOneAndUpdate(
      { userId: uid, patternId },
      {
        $push: { solvedProblems: { name, url, platform, notes, solvedAt: new Date() } },
        $inc: { problemsSolved: 1 },
      },
      { new: true }
    );

    if (!row) {
      res.status(404).json({ error: "Progress row not found — create it first via PUT" });
      return;
    }

    await upsertWeeklySnapshot(uid, 1);
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to add solved problem" });
  }
});

// GET /api/progress/chart/weekly — last 12 weeks for chart
router.get("/chart/weekly", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  try {
    const snapshots = await WeeklySnapshot.find({
      userId: uid,
      weekStart: { $gte: twelveWeeksAgo },
    }).sort({ weekStart: 1 });

    res.json(snapshots);
  } catch {
    res.status(500).json({ error: "Failed to fetch weekly chart data" });
  }
});

// GET /api/progress/stats/summary
router.get("/stats/summary", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  try {
    const [result] = await Progress.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id: null,
          totalSolved: { $sum: "$problemsSolved" },
          totalPatterns: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
          totalMinutes: { $sum: "$timeSpentMinutes" },
        },
      },
    ]);

    res.json(
      result ?? {
        totalSolved: 0,
        totalPatterns: 0,
        completed: 0,
        inProgress: 0,
        totalMinutes: 0,
      }
    );
  } catch {
    res.status(500).json({ error: "Failed to fetch summary stats" });
  }
});

// Upsert today's weekly snapshot, incrementing by delta
async function upsertWeeklySnapshot(userId: string, delta: number): Promise<void> {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  await WeeklySnapshot.findOneAndUpdate(
    { userId, weekStart },
    { $inc: { problemsSolved: delta } },
    { upsert: true }
  );
}

export default router;
