"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAuth,
  getAuthToken,
  getStoredUser,
  type AuthUser,
} from "@/lib/auth/authStorage";
import { getCurrentUser } from "@/lib/api/authApi";

export function useRequireAuth() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const storedUser = getStoredUser();

      if (storedUser && !cancelled) {
        setUser(storedUser);
      }

      const currentUser = await getCurrentUser();

      if (cancelled) return;

      if (!currentUser) {
        clearAuth();
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setCheckingAuth(false);
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  return {
    user,
    checkingAuth,
    logout,
  };
}