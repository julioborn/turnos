export default function SplashScreen() {
    return (
        <div className="h-screen w-screen bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center transition-opacity duration-500 opacity-100 animate-fadeOut">
            <img src="/crc-old-nobg.png" alt="Logo CRC" className="w-40 h-40 animate-pulse" />
        </div>
    );
}
