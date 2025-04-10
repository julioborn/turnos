"use client";

import { useRouter } from "next/navigation";

export default function ClientHome() {
    const router = useRouter();

    const actividades = [
        { nombre: "Padel", path: "padel" },
        { nombre: "Fútbol", path: "futbol" },
        { nombre: "Básquet", path: "basquet" },
        { nombre: "Vóley", path: "voley" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Reservar Turno</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {actividades.map((actividad) => (
                        <button
                            key={actividad.path}
                            onClick={() => router.push(`/client/reservas/${actividad.path}`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded text-lg shadow-sm transition"
                        >
                            {actividad.nombre}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
