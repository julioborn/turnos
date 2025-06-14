"use client";

import { useRouter } from "next/navigation";

export default function ClientHome() {
    const router = useRouter();

    const actividades = [
        { nombre: "Pádel", path: "padel" },
        { nombre: "Fútbol", path: "futbol" },
        { nombre: "Básquet", path: "basquet" },
        { nombre: "Vóley", path: "voley" },
    ];

    return (
        <div className="mt-10 bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-extrabold mb-3 tracking-tight">Reservar Turno</h1>
                <p className="text-lg text-gray-500 mb-2">Elegí un deporte</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {actividades.map((actividad) => (
                        <button
                            key={actividad.path}
                            onClick={() => router.push(`/client/reservas/${actividad.path}`)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-sm transition"
                        >
                            {actividad.nombre}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
