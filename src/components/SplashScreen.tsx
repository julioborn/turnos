"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setFadeOut(true), 2000);
        const timer2 = setTimeout(() => {
            sessionStorage.setItem("splashShown", "true");
            onFinish();
        }, 2800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-50 bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center transition-opacity duration-700 ${fadeOut ? "opacity-0" : "opacity-100"
                }`}
        >
            <img
                src="/crc-old-nobg.png"
                alt="Logo CRC"
                className="w-40 h-40 animate-pulse"
            />
        </div>
    );
}
