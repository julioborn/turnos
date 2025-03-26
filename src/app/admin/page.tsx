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
                    onClick={() => router.push("/admin/horarios")}
                    className="w-fit bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Horarios
                </button>
                <button
                    onClick={() => router.push("/admin/reservas")}
                    className="w-fit bg-green-500 text-white px-4 py-2 rounded"
                >
                    Reservas
                </button>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-fit bg-red-500 text-white px-4 py-2 rounded"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
