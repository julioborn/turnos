"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-center">Administrador</h1>

            <div className="w-full max-w-sm flex flex-col gap-4">
                <button
                    onClick={() => router.push("/admin/horarios")}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded shadow hover:bg-green-600 transition"
                >
                    Horarios
                </button>
                <button
                    onClick={() => router.push("/admin/reservas")}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded shadow hover:bg-green-600 transition"
                >
                    Reservas
                </button>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full bg-red-500 text-white px-4 py-3 rounded shadow hover:bg-red-600 transition"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
