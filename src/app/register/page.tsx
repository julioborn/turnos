"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [documento, setDocumento] = useState("");
    const [telefono, setTelefono] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nombre, email, password, documento, telefono }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Error en el registro");
            setLoading(false);
            return;
        }

        // Redirigir a la página de login o a donde prefieras después del registro
        router.push("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-6 max-w-md w-full bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Registrarse</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Nombre y Apellido</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded p-2"
                            placeholder="Nombre completo"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Documento</label>
                        <input
                            type="text"
                            value={documento}
                            onChange={(e) => setDocumento(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded p-2"
                            placeholder="Documento de identidad"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Teléfono</label>
                        <input
                            type="text"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded p-2"
                            placeholder="Número de teléfono"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Correo electrónico <span className="text-red-600">(Opcional)</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded p-2"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded p-2"
                            required
                        />
                    </div>
                    {error && <div className="text-red-500">{error}</div>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded"
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
            </div>
        </div>
    );
}
