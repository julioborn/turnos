import { useEffect, useState } from "react";

export function useHasHydrated() {
    const [hasHydrated, setHasHydrated] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const splashShown = sessionStorage.getItem("splashShown");
        if (splashShown) {
            setShowSplash(false); // no mostrar splash
            setHasHydrated(true);
        } else {
            // mostrar splash y luego pasar a la app
            const timer = setTimeout(() => {
                sessionStorage.setItem("splashShown", "true");
                setShowSplash(false);
                setHasHydrated(true);
            }, 2500); // ⏱️ duración del splash, ajustable

            return () => clearTimeout(timer);
        }
    }, []);

    return { hasHydrated, showSplash };
}
