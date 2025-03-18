"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Panel de Administrador</h1>
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Cerrar sesión
                </button>
                <button
                    onClick={() => router.push("/admin/horarios")}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Administrar Horarios
                </button>
                <button
                    onClick={() => router.push("/admin/reservas")}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Administrar Reservas
                </button>
            </div>
        </div>
    );
}
