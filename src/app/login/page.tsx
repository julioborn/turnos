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
            if (session.user.rol === "admin") {
                router.push("/admin");
            } else if (session.user.rol === "superusuario") {
                router.push("/admin");
            } else if (session.user.rol === "cliente") {
                router.push("/client");
            } else {
                router.push("/");
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
            documento,
            password,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            router.push("/");
        }
        setLoading(false);
    };

    return (
        <div className="mt-20 flex items-center justify-center px-3">
            <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Documento</label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={documento}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ""); // elimina todo lo que no sea número
                                setDocumento(value);
                            }}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Número de documento"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 bg-red-100 px-3 py-2 rounded">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className={`w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Cargando..." : "Ingresar"}
                    </button>
                    <div className="text-center mt-4 text-sm">
                        <span className="text-gray-600">¿No tenés cuenta?</span>{" "}
                        <Link href="/register" className="text-green-500 hover:underline font-medium">
                            Registrate
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
