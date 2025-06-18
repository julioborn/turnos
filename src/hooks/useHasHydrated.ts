import { useEffect, useState } from "react";

export function useHasHydrated() {
    const [hasHydrated, setHasHydrated] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const splashShown = sessionStorage.getItem("splashShown");

        // Si ya se mostró antes, no mostrarlo
        if (splashShown) {
            setShowSplash(false);
            setHasHydrated(true);
        } else {
            // Mostrar splash solo si es la primera carga real
            const timer = setTimeout(() => {
                sessionStorage.setItem("splashShown", "true");
                setShowSplash(false);
                setHasHydrated(true);
            }, 2000); // duración deseada del splash

            return () => clearTimeout(timer);
        }
    }, []);

    return { hasHydrated, showSplash };
}
