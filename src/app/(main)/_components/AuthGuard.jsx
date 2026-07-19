"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authTokenStorage } from "@/api/httpClient";
import { useAuthStore } from "@/stores/authStore";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const validateAuth = useAuthStore((state) => state.validateAuth);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!validateAuth()) {
      authTokenStorage.clear();
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
  }, [isHydrated, router, validateAuth]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
