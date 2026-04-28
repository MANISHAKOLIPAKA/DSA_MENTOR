import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { level, goal, weeks, language, weakAreas, hoursPerDay } = await req.json();

  if (!level || !goal || !weeks) {
    return Response.json({ error: "level, goal, and weeks are required" }, { status: 400 });
  }

  const prompt = `You are an expert DSA (Data Structures & Algorithms) teacher. Generate a detailed, personalized DSA study roadmap.

Student profile:
- Current level: ${level}
- Goal: ${goal}
- Time available: ${weeks} weeks
- Hours per day: ${hoursPerDay ?? 2}
- Preferred language: ${language ?? "any"}
- Weak areas / wants to focus on: ${weakAreas || "none specified"}

Generate a week-by-week roadmap. Return ONLY valid JSON (no markdown, no explanation outside the JSON) in this exact structure:

{
  "title": "short personalized title",
  "summary": "2-3 sentence summary of the plan and why it suits this student",
  "totalProblems": number,
  "phases": [
    {
      "week": "Week 1-2",
      "theme": "theme name",
      "goal": "what the student will achieve",
      "patterns": ["array of pattern names to study, e.g. Arrays & Hashing, Two Pointers"],
      "dailyFocus": "what to do each day",
      "keyProblems": [
        { "name": "Problem Name", "url": "https://leetcode.com/problems/...", "difficulty": "easy|medium|hard", "why": "one line reason" }
      ],
      "resources": [
        { "title": "resource title", "url": "url", "type": "video|article|visualizer" }
      ],
      "milestone": "what success looks like at end of this phase"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "warningAreas": ["common mistake or pitfall 1", "pitfall 2"]
}

Rules:
- Phases should group 1-3 weeks together sensibly based on total ${weeks} weeks
- keyProblems: 3-5 per phase, all real LeetCode problems with correct URLs
- Resources: prefer visualgo.net for visualizations, NeetCode/YouTube for videos
- Tips and warningAreas: 3-4 each, specific to this student's profile
- Make the plan realistic for ${hoursPerDay ?? 2} hours/day
- For FAANG/product company goals, emphasize medium/hard problems and system design awareness
- For competitive programming goals, emphasize speed, math, advanced data structures`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const cleaned = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();

    const roadmap = JSON.parse(cleaned);
    return Response.json(roadmap);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `Generation failed: ${message}` }, { status: 500 });
  }
}
