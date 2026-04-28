"use client";
import { useAuth } from "@/lib/hooks/useAuth";

// Mounts the Firebase auth listener for the entire app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}
