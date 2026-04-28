const CF_API = "https://codeforces.com/api";

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

export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesStats> {
  const res = await fetch(`${CF_API}/user.info?handles=${encodeURIComponent(handle)}`);
  if (!res.ok) throw new Error(`Codeforces API returned ${res.status}`);

  const json = (await res.json()) as {
    status: string;
    comment?: string;
    result?: {
      handle: string;
      rating: number;
      maxRating: number;
      rank: string;
      maxRank: string;
      avatar: string;
      country?: string;
      organization?: string;
    }[];
  };

  if (json.status !== "OK" || !json.result?.length) {
    throw new Error(json.comment ?? `User "${handle}" not found on Codeforces`);
  }

  const u = json.result[0];
  return {
    handle: u.handle,
    rating: u.rating ?? 0,
    maxRating: u.maxRating ?? 0,
    rank: u.rank ?? "unrated",
    maxRank: u.maxRank ?? "unrated",
    avatar: u.avatar,
    country: u.country,
    organization: u.organization,
  };
}
