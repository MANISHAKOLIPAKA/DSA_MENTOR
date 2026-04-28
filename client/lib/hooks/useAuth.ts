"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export function useAuth() {
  const { user, appUser, setUser, setAppUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Unblock the UI immediately — don't wait for the backend sync
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Sync with backend in the background — creates the MongoDB document on first login
        api
          .post("/api/auth/sync", {
            name: firebaseUser.displayName ?? "Anonymous",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          })
          .then(({ data }) => setAppUser(data))
          .catch(() => setAppUser(null));
      } else {
        setAppUser(null);
      }
    });

    return unsubscribe;
  }, [setUser, setAppUser, setLoading]);

  return { user, appUser };
}
