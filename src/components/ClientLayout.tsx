"use client";

import { useHasHydrated } from "@/hooks/useHasHydrated";
import SplashScreen from "./SplashScreen";
import ClientProviders from "./ClientProviders";
import Header from "./Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { hasHydrated, showSplash } = useHasHydrated();

    if (showSplash) return <SplashScreen />;

    return (
        <ClientProviders>
            <Header />
            <main className="pt-20">{hasHydrated ? children : null}</main>
        </ClientProviders>
    );
}
