"use client";

import { useEffect, useState } from "react";
import ClientProviders from "./ClientProviders";
import Header from "./Header";
import SplashScreen from "./SplashScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return showSplash ? (
        <SplashScreen />
    ) : (
        <ClientProviders>
            <Header />
            <main className="pt-20">{children}</main>
        </ClientProviders>
    );
}
