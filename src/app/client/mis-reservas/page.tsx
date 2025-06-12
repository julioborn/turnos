"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format, isBefore, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";
import Loader from "@/components/Loader";

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
    precioHora: number
}

export default function MisReservas() {
    const { data: session, status } = useSession();
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);


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
        setInitialized(true);
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
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center mt-4">
            <div className="w-full max-w-xl">
                <h1 className="text-2xl font-extrabold text-center tracking-tight mb-4">Mis Reservas</h1>

                {loading || !initialized ? (
                    <div className="flex justify-center items-center py-6">
                        <Loader />
                    </div>
                ) : reservas.length > 0 ? (
                    <ul className="space-y-4">
                        {reservas.map((reserva) => (
                            <li
                                key={reserva._id}
                                className="rounded-xl shadow-lg bg-white border-l-4 border-green-500 transition p-4 text-sm space-y-3"
                            >
                                {/* Actividad y estado */}
                                <div className="flex justify-between items-center">
                                    <span className="text-green-700 font-bold uppercase tracking-wider text-sm">
                                        {reserva.horario?.deporte?.nombre || "Sin actividad"}
                                    </span>
                                    <span
                                        className={`text-xs px-3 py-1 rounded-full font-semibold ${reserva.estado === "aprobada"
                                                ? "bg-green-100 text-green-700"
                                                : reserva.estado === "pendiente"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                    </span>
                                </div>

                                {/* Fecha y horario */}
                                <div className="flex items-center gap-2 text-gray-700">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 19h14a2 2 0 002-2V7H3v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">{formatearFechaConDia(reserva.fechaTurno)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{reserva.horario.horaInicio} - {reserva.horario.horaFin}</span>
                                </div>
                                {reserva.horario?.deporte?.nombre?.toLowerCase() === "pádel" && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                        <span>Cancha {reserva.cancha}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-700">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.5 0-4.5 2-4.5 4.5S9.5 17 12 17s4.5-2 4.5-4.5S14.5 8 12 8z" />
                                    </svg>
                                    <span>${reserva.precioHora}</span>
                                </div>
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
