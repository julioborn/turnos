"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import SplashScreen from "./SplashScreen";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        // Simula carga inicial (puede ser reemplazada por lógica real como fetch de usuario, etc.)
        const timeout = setTimeout(() => {
            setIsAppReady(true);
        }, 1200); // ⏳ podés ajustar este tiempo

        return () => clearTimeout(timeout);
    }, []);

    if (!isAppReady) {
        return <SplashScreen />;
    }

    return <SessionProvider>{children}</SessionProvider>;
}
