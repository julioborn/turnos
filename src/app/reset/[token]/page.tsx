"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
    const router = useRouter();
    const { token } = params;
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire("Error", "Las contraseñas no coinciden", "error");
            return;
        }

        setLoading(true);
        const res = await fetch("/api/reset-password/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            Swal.fire("Éxito", "Contraseña actualizada correctamente", "success").then(() => {
                router.push("/login");
            });
        } else {
            Swal.fire("Error", data.error || "No se pudo cambiar la contraseña", "error");
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-100 mt-10">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
                <h1 className="text-xl font-bold mb-4 text-center">Cambiar Contraseña</h1>

                <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
                <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />

                <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
                <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                    {loading ? "Actualizando..." : "Cambiar contraseña"}
                </button>
            </form>
        </div>
    );
}
