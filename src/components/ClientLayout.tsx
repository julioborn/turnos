"use client";

import { useEffect, useState } from "react";
import ClientProviders from "./ClientProviders";
import Header from "./Header";
import SplashScreen from "./SplashScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        // Esperar a que se hidrate React y luego mostrar contenido
        const handleHydration = () => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setIsAppReady(true);
                }, 2500); // ⏱️ Le damos un pequeño delay para que todo se monte bien
            });
        };

        if (document.readyState === "complete") {
            handleHydration();
        } else {
            window.addEventListener("load", handleHydration);
            return () => window.removeEventListener("load", handleHydration);
        }
    }, []);

    return isAppReady ? (
        <ClientProviders>
            <Header />
            <main className="pt-20">{children}</main>
        </ClientProviders>
    ) : (
        <SplashScreen />
    );
}
