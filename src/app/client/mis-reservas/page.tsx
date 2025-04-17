"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format, isBefore, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";

interface Reserva {
    _id: string;
    fechaTurno: string;
    cancha: number;
    estado: string;
    correoCliente: string; // 👉 esta línea faltaba
    horario: {
        horaInicio: string;
        horaFin: string;
        deporte: {
            nombre: string;
        };
    };
}

export default function MisReservas() {
    const { data: session, status } = useSession();
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            fetchReservas();
        }
    }, [status]);

    async function fetchReservas() {
        setLoading(true);
        try {
            const res = await fetch("/api/reservas", { credentials: "include" });
            const data = await res.json();
            if (data.ok) {
                const soloMias = data.reservas
                    .filter((r: Reserva) => r.correoCliente === session?.user.documento)
                    .sort((a: Reserva, b: Reserva) => {
                        const fechaA = new Date(a.fechaTurno).getTime();
                        const fechaB = new Date(b.fechaTurno).getTime();
                        return fechaB - fechaA;
                    });

                setReservas(soloMias);
            } else {
                Swal.fire("Error", data.error || "No se pudieron cargar las reservas", "error");
            }
        } catch (error) {
            console.error("Error al obtener reservas:", error);
            Swal.fire("Error", "Ocurrió un problema al cargar las reservas", "error");
        }
        setLoading(false);
    }

    function formatearFecha(fecha: string) {
        return format(new Date(fecha), "dd-MM-yyyy");
    }

    function esPasada(fechaTurno: string) {
        return isBefore(new Date(fechaTurno), new Date());
    }

    function formatearFechaConDia(fechaISO: string) {
        const fechaFormateada = format(new Date(fechaISO), "EEEE dd-MM-yyyy", { locale: es });
        return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center mt-20">
            <div className="w-full max-w-xl">
                <h1 className="text-3xl font-extrabold text-center tracking-tight mb-4">Mis Reservas</h1>

                {loading ? (
                    <p className="text-center">Cargando...</p>
                ) : reservas.length > 0 ? (
                    <ul className="space-y-4">
                        {reservas.map((reserva) => (
                            <li
                                key={reserva._id}
                                className="border-l-4 border-green-500 rounded-md bg-white shadow-md p-4 text-sm transition hover:shadow-lg"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-green-700 font-semibold uppercase">
                                        {reserva.horario?.deporte?.nombre}
                                    </span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${reserva.estado === "aprobada"
                                            ? "bg-green-100 text-green-700"
                                            : reserva.estado === "pendiente"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                    </span>
                                </div>
                                <p className="text-gray-700 font-medium">
                                    <p className="text-sm font-medium text-gray-700">
                                        🗓️ {formatearFechaConDia(reserva.fechaTurno)}
                                    </p>
                                </p>
                                <p>⏰ {reserva.horario.horaInicio} - {reserva.horario.horaFin}</p>
                                <p>📍 Cancha {reserva.cancha}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-600">No tenés reservas registradas.</p>
                )}
            </div>
        </div>
    );
}
