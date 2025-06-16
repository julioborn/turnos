"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaClock, FaHistory, FaDollarSign, FaChartBar, FaUser } from "react-icons/fa";

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session } = useSession();

    const cards = [
        {
            label: "Reservas",
            icon: <FaCalendarAlt size={28} />,
            route: "/admin/reservas",
        },
        {
            label: "Horarios",
            icon: <FaClock size={28} />,
            route: "/admin/horarios",
        },
        {
            label: "Historial",
            icon: <FaHistory size={28} />,
            route: "/admin/historial",
        },
        {
            label: "Precios",
            icon: <FaDollarSign size={28} />,
            route: "/admin/precios",
        },
        {
            label: "Perfil",
            icon: <FaUser size={28} />,
            route: "/perfil",
        },
    ];

    if (session?.user?.rol === "superusuario") {
        cards.push({
            label: "Balance",
            icon: <FaChartBar size={28} />,
            route: "/admin/balance",
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-100 py-10 px-4">
            <h1 className="text-5xl font-black p-4 text-center text-green-700 mb-2">Inicio</h1>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        onClick={() => router.push(card.route)}
                        className="cursor-pointer bg-white hover:bg-green-50 border-2 border-green-400 hover:border-green-600 rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center transition-all duration-200"
                    >
                        <div className="text-green-600 mb-4">{card.icon}</div>
                        <h3 className="text-lg font-bold text-gray-700">{card.label}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
