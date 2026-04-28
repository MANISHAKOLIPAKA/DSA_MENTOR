import { Router, Request, Response } from "express";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import { User } from "../models/User";
import patterns from "../../../shared/dsa-patterns.json";

const router = Router();

// GET /api/roadmap — full pattern list, optionally filtered by language
router.get("/", verifyToken, async (req: Request, res: Response): Promise<void> => {
  const { uid } = req as AuthRequest;
  const { difficulty, language } = req.query as { difficulty?: string; language?: string };

  try {
    // If language not provided in query, fall back to user's preference
    let lang = language;
    if (!lang) {
      const user = await User.findOne({ uid });
      lang = user?.preferredLanguage;
    }

    let result = patterns as Pattern[];

    if (difficulty) {
      result = result.filter((p) => p.difficulty === difficulty);
    }

    // Attach language-specific resources if available
    if (lang) {
      result = result.map((p) => ({
        ...p,
        resources: p.resources.filter(
          (r) => !r.languages || r.languages.includes(lang as string)
        ),
      }));
    }

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to load roadmap" });
  }
});

// GET /api/roadmap/:patternId
router.get("/:patternId", verifyToken, async (_req: Request, res: Response): Promise<void> => {
  const { patternId } = _req.params;
  const pattern = (patterns as Pattern[]).find((p) => p.id === patternId);

  if (!pattern) {
    res.status(404).json({ error: "Pattern not found" });
    return;
  }
  res.json(pattern);
});

interface Resource {
  type: string;
  title: string;
  url: string;
  languages?: string[];
}

interface Problem {
  name: string;
  url: string;
  platform: string;
  difficulty?: string;
}

interface Pattern {
  id: string;
  pattern: string;
  difficulty: string;
  order: number;
  description: string;
  prerequisites: string[];
  problems: Problem[];
  resources: Resource[];
}

export default router;
