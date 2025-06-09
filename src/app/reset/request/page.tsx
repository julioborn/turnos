"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function SolicitarResetPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/reset-password/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            Swal.fire("Enviado", "Revisá tu correo para cambiar la contraseña.", "success");
            setEmail("");
        } else {
            Swal.fire("Error", data.error || "Ocurrió un error", "error");
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
                <h1 className="text-xl font-bold mb-4 text-center">Recuperar contraseña</h1>

                <label className="block text-sm font-medium mb-1">Correo electrónico</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                    {loading ? "Enviando..." : "Solicitar cambio"}
                </button>
            </form>
        </div>
    );
}
