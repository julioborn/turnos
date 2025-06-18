"use client";

import { useEffect, useState } from "react";
import ClientProviders from "./ClientProviders";
import Header from "./Header";
import SplashScreen from "./SplashScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const splashShown = sessionStorage.getItem("splashShown");
        if (!splashShown) {
            setShowSplash(true);
        } else {
            setReady(true);
        }
    }, []);

    const handleSplashFinish = () => {
        setShowSplash(false);
        setReady(true);
    };

    return (
        <>
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
            {ready && (
                <ClientProviders>
                    <Header />
                    <main className="pt-20">{children}</main>
                </ClientProviders>
            )}
        </>
    );
}
