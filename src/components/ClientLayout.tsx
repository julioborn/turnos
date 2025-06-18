"use client";

import { useEffect, useState } from "react";
import ClientProviders from "./ClientProviders";
import Header from "./Header";
import SplashScreen from "./SplashScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const splashShown = sessionStorage.getItem("splashShown");

        if (splashShown) {
            setShowSplash(false);
            return;
        }

        const timeout = setTimeout(() => {
            sessionStorage.setItem("splashShown", "true");
            setShowSplash(false);
        }, 2000); // tiempo del splash

        return () => clearTimeout(timeout);
    }, []);

    return (
        <ClientProviders>
            <Header />
            <main className="pt-20 relative z-0">{children}</main>

            {/* Splash como overlay */}
            {showSplash && (
                <div className="fixed inset-0 z-50 transition-opacity duration-700 bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
                    <img
                        src="/crc-old-nobg.png"
                        alt="Logo CRC"
                        className="w-40 h-40 animate-pulse"
                    />
                </div>
            )}
        </ClientProviders>
    );
}