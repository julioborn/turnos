"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Loader from "@/components/Loader";

export default function HistorialReservasAdmin() {
    const [reservasAprobadas, setReservasAprobadas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const deportesConVariasCanchas = ["padel"];

    async function fetchReservasAprobadas() {
        setLoading(true);
        try {
            const res = await fetch("/api/reservas?estado=aprobada");
            const data = await res.json();
            setReservasAprobadas(data.reservas || []);
        } catch (error) {
            console.error("Error al cargar historial de reservas:", error);
        }
        setLoading(false);
    }

    async function rechazarReserva(reservaId: string) {
        const confirm = await Swal.fire({
            title: "¿Rechazar reserva?",
            text: "La reserva volverá a estado pendiente o será eliminada.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, rechazar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`/api/reservas/${reservaId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                await Swal.fire("Hecho", "Reserva rechazada.", "success");
                fetchReservasAprobadas();
            } else {
                Swal.fire("Error", data.error || "No se pudo rechazar", "error");
            }
        } catch (error) {
            console.error("Error al rechazar reserva:", error);
            Swal.fire("Error", "Ocurrió un error al rechazar.", "error");
        }
    }

    useEffect(() => {
        fetchReservasAprobadas();
    }, []);

    function formatearFechaConDia(fechaISO: string) {
        const fecha = new Date(fechaISO);
        const formato = format(fecha, "EEEE dd-MM-yyyy", { locale: es });
        return formato.charAt(0).toUpperCase() + formato.slice(1);
    }

    function yaPasoTurno(fechaTurno: string, horaInicio: string) {
        const [hora, minuto] = horaInicio.split(":").map(Number);
        const fecha = new Date(fechaTurno);
        fecha.setHours(hora, minuto, 0, 0);
        return fecha < new Date();
    }

    return (
        <div className="min-h-screen bg-gray-100 flex p-4 flex-col items-center mt-10">
            <div className="w-full max-w-md">
                <h2 className="text-5xl font-black mb-6 text-center">Historial</h2>

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader />
                    </div>
                ) : reservasAprobadas.length > 0 ? (
                    <ul className="space-y-4">
                        {reservasAprobadas.map((reserva) => (
                            <li
                                key={reserva._id}
                                className="rounded-xl shadow-lg bg-white border-l-4 border-green-500 transition p-4 text-sm space-y-3"
                            >
                                {/* Actividad y cancha */}
                                <div className="flex justify-between items-center">
                                    <span className="text-green-700 font-bold uppercase tracking-wider text-sm">
                                        {reserva.horario.deporte?.nombre || "Sin actividad"}
                                    </span>
                                    {reserva.horario.deporte?.nombre?.toLowerCase() === "padel" && (
                                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                                            Cancha {reserva.cancha}
                                        </span>
                                    )}
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
                                <div className="flex items-center gap-2 text-gray-700">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.5 0-4.5 2-4.5 4.5S9.5 17 12 17s4.5-2 4.5-4.5S14.5 8 12 8z" />
                                    </svg>
                                    <span>${reserva.precioHora}</span>
                                </div>

                                {/* Cliente */}
                                <div className="bg-gray-100 p-2 rounded mt-2 text-xs">
                                    <p className="text-gray-800">{reserva.nombreCliente}</p>
                                    <p className="text-gray-500 break-all">{reserva.correoCliente}</p>
                                </div>

                                {/* Acciones */}
                                {!yaPasoTurno(reserva.fechaTurno, reserva.horario.horaInicio) && (
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => rechazarReserva(reserva._id)}
                                            className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition font-semibold text-sm shadow"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm">No hay reservas aprobadas registradas.</p>
                )}
            </div>
        </div>
    );

}
