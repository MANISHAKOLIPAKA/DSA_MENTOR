import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
}

export const PLATFORM_URLS: Record<string, string> = {
  leetcode: "https://leetcode.com/u/",
  codeforces: "https://codeforces.com/profile/",
  codechef: "https://www.codechef.com/users/",
  hackerrank: "https://www.hackerrank.com/profile/",
  hackerearth: "https://www.hackerearth.com/@",
  gfg: "https://www.geeksforgeeks.org/user/",
  interviewbit: "https://www.interviewbit.com/profile/",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

export const STATUS_BADGE: Record<string, string> = {
  not_started: "bg-gray-700 text-gray-300",
  in_progress: "bg-yellow-900 text-yellow-300",
  completed: "bg-green-900 text-green-300",
};
