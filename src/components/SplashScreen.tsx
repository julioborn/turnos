"use client";

export default function SplashScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-green-600">
            <div className="animate-fadeIn flex flex-col items-center gap-4">
                <img
                    src="/crc-old-nobg.png"
                    alt="Logo CRC"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain"
                />
            </div>
        </div>
    );
}
