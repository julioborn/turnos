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
        <div className="p-8 flex flex-col items-center gap-6">
            <h1 className="text-3xl font-bold mb-4">Reservar Turno</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                {actividades.map((actividad) => (
                    <button
                        key={actividad.path}
                        onClick={() => router.push(`/client/reservas/${actividad.path}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded text-lg shadow transition-colors"
                    >
                        {actividad.nombre}
                    </button>
                ))}
            </div>
        </div>
    );
}
