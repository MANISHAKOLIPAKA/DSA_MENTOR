const LEETCODE_API = "https://leetcode.com/graphql";

const STATS_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
        starRating
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
        totalSubmissionNum {
          difficulty
          count
        }
      }
      badges { name }
      activeBadge { name }
    }
  }
`;

export interface LeetCodeStats {
  username: string;
  ranking: number;
  solved: { easy: number; medium: number; hard: number; total: number };
  badges: string[];
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats> {
  const res = await fetch(LEETCODE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // LeetCode requires a referer
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query: STATS_QUERY, variables: { username } }),
  });

  if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);

  const json = (await res.json()) as {
    data: {
      matchedUser: {
        username: string;
        profile: { ranking: number };
        submitStats: {
          acSubmissionNum: { difficulty: string; count: number }[];
        };
        badges: { name: string }[];
      } | null;
    };
  };

  const user = json.data.matchedUser;
  if (!user) throw new Error(`User "${username}" not found on LeetCode`);

  const ac = user.submitStats.acSubmissionNum;
  const byDiff = (d: string) => ac.find((x) => x.difficulty === d)?.count ?? 0;

  return {
    username: user.username,
    ranking: user.profile.ranking,
    solved: {
      easy: byDiff("Easy"),
      medium: byDiff("Medium"),
      hard: byDiff("Hard"),
      total: byDiff("All"),
    },
    badges: user.badges.map((b) => b.name),
  };
}
