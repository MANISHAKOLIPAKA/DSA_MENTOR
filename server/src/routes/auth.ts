import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";

const router = Router();

// POST /api/auth/sync
// Called after Firebase login to upsert the user record in MongoDB
router.post("/sync", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  const { name, email, photoURL, preferredLanguage } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      {
        $setOnInsert: { uid, createdAt: new Date() },
        $set: {
          name: name ?? "Anonymous",
          email: email ?? "",
          ...(photoURL && { photoURL }),
          ...(preferredLanguage && { preferredLanguage }),
        },
      },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  try {
    const user = await User.findOne({ uid });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /api/auth/profile
router.patch("/profile", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  const allowed = ["name", "preferredLanguage", "cpAccounts", "googleSheetId"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  try {
    const user = await User.findOneAndUpdate({ uid }, { $set: updates }, { new: true });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
