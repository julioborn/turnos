import { useEffect, useState } from "react";

export function useHasHydrated() {
    const [hasHydrated, setHasHydrated] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const splashShown = sessionStorage.getItem("splashShown");

        if (splashShown) {
            // Si ya se mostró el splash, no lo mostramos de nuevo
            setShowSplash(false);
            setHasHydrated(true);
        } else {
            // Solo en la primera carga real (no recargas)
            const timer = setTimeout(() => {
                sessionStorage.setItem("splashShown", "true");
                setShowSplash(false);
                setHasHydrated(true);
            }, 2000); // duración del splash

            return () => clearTimeout(timer);
        }
    }, []);

    return { hasHydrated, showSplash };
}
