// components/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import SplashScreen from "./SplashScreen";
import { useHasHydrated } from "@/hooks/useHasHydrated";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const { hasHydrated, showSplash } = useHasHydrated();

    if (showSplash) return <SplashScreen />;

    return <SessionProvider>{hasHydrated ? children : null}</SessionProvider>;
}
