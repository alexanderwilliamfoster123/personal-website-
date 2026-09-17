"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserSession, clearUserSession, UserSession } from "./auth";

export function useAuthGuard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const activeSession = getUserSession();
    if (!activeSession) {
      router.replace("/");
    } else {
      setSession(activeSession);
      setIsLoading(false);
    }
  }, [router]);

  const signOut = () => {
    clearUserSession();
    router.replace("/");
  };

  return {
    session,
    isLoading,
    signOut,
  };
}
