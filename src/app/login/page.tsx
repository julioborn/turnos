"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            // Redirige según el rol del usuario
            if (session.user.rol === "admin") {
                router.push("/admin");
            } else if (session.user.rol === "cliente") {
                router.push("/reservas");
            } else {
                router.push("/dashboard"); // O alguna ruta por defecto
            }
        }
    }, [session, router]);

    const [documento, setDocumento] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await signIn("credentials", {
            redirect: false,
            documento, // Enviamos el documento
            password,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            router.push("/dashboard");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-6 max-w-md w-full bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Documento</label>
                        <input
                            type="text"
                            value={documento}
                            onChange={(e) => setDocumento(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded p-2"
                            placeholder="Número de documento"
                            required
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
                        {loading ? "Cargando..." : "Ingresar"}
                    </button>
                    {/* 👉 Botón de registro */}
                    <div className="text-center mt-4">
                        <span className="text-gray-600">¿No tenés cuenta?</span>{" "}
                        <Link href="/register" className="text-blue-500 hover:underline">
                            Registrate
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
