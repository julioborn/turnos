"use client";

import { useRouter } from "next/navigation";
import { GiTennisBall } from "react-icons/gi";
import { FaFutbol, FaVolleyballBall, FaBasketballBall } from "react-icons/fa";

export default function ClientHome() {
    const router = useRouter();

    const actividades = [
        {
            nombre: "Pádel",
            path: "padel",
            icon: <GiTennisBall size={36} className="text-green-600" />,
        },
        {
            nombre: "Fútbol",
            path: "futbol",
            icon: <FaFutbol size={36} className="text-green-600" />,
        },
        {
            nombre: "Básquet",
            path: "basquet",
            icon: <FaBasketballBall size={36} className="text-green-600" />,
        },
        {
            nombre: "Vóley",
            path: "voley",
            icon: <FaVolleyballBall size={36} className="text-green-600" />,
        },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-green-50 via-white to-gray-100 py-10 px-4">
            <h1 className="text-4xl font-extrabold mb-2 text-center text-green-800">Reservar Turno</h1>
            <p className="text-lg text-gray-700 text-center">Elegí un deporte</p>

            <div className="grid p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 w-full max-w-2xl">
                {actividades.map((actividad) => (
                    <div
                        key={actividad.path}
                        onClick={() => router.push(`/client/reservas/${actividad.path}`)}
                        className="cursor-pointer group p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition border-l-4 border-green-600"
                    >
                        <div className="flex items-center gap-4">
                            {actividad.icon}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition">
                                    {actividad.nombre}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
