import { Router, Request, Response } from "express";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import { fetchLeetCodeStats } from "../services/leetcode.service";
import { fetchCodeforcesStats } from "../services/codeforces.service";
import { User } from "../models/User";

const router = Router();

// GET /api/integrations/leetcode/:username
router.get("/leetcode/:username", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchLeetCodeStats(req.params.username);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch LeetCode stats", detail: String(err) });
  }
});

// GET /api/integrations/codeforces/:handle
router.get("/codeforces/:handle", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchCodeforcesStats(req.params.handle);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch Codeforces stats", detail: String(err) });
  }
});

// GET /api/integrations/all — fetch stats for all linked CP accounts at once
router.get("/all", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  try {
    const user = await User.findOne({ uid });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const results: Record<string, unknown> = {};

    const tasks: Promise<void>[] = [];

    if (user.cpAccounts.leetcode) {
      tasks.push(
        fetchLeetCodeStats(user.cpAccounts.leetcode)
          .then((d) => { results.leetcode = d; })
          .catch(() => { results.leetcode = null; })
      );
    }

    if (user.cpAccounts.codeforces) {
      tasks.push(
        fetchCodeforcesStats(user.cpAccounts.codeforces)
          .then((d) => { results.codeforces = d; })
          .catch(() => { results.codeforces = null; })
      );
    }

    await Promise.all(tasks);
    res.json(results);
  } catch {
    res.status(500).json({ error: "Failed to fetch CP stats" });
  }
});

export default router;
