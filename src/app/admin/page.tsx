"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session } = useSession();

    return (
        <div className="min-h-screen flex flex-col items-center mt-20 p-4 bg-gray-100">
            <h1 className="text-2xl font-extrabold  text-center">Administración</h1>

            <div className="w-full max-w-sm flex flex-col gap-4">
                <button
                    onClick={() => router.push("/admin/reservas")}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-full font-semibold shadow hover:bg-green-600 transition"
                >
                    Reservas
                </button>
                <button
                    onClick={() => router.push("/admin/horarios")}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-full font-semibold shadow hover:bg-green-600 transition"
                >
                    Horarios
                </button>
                <button
                    onClick={() => router.push("/admin/historial")}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-full font-semibold shadow hover:bg-green-600 transition"
                >
                    Historial
                </button>
                <button
                    onClick={() => router.push("/admin/precios")}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-full font-semibold shadow hover:bg-green-600 transition"
                >
                    Precios
                </button>

                {/* ✅ Botón visible solo si el usuario es superusuario */}
                {session?.user?.rol === "superusuario" && (
                    <button
                        onClick={() => router.push("/admin/balance")}
                        className="w-full bg-green-500 text-white px-4 py-3 rounded-full font-semibold shadow hover:bg-green-600 transition"
                    >
                        Balance
                    </button>
                )}
            </div>
        </div>
    );
}
