"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HistorialReservasAdmin() {
    const [reservasAprobadas, setReservasAprobadas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center mt-20">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-extrabold mb-4 text-center">Historial</h2>

                {loading && <p className="text-center text-sm">Cargando reservas...</p>}

                {reservasAprobadas.length > 0 ? (
                    <ul className="space-y-4">
                        {reservasAprobadas.map((reserva) => (
                            <li
                                key={reserva._id}
                                className="border-l-4 border-green-500 rounded-md bg-white shadow-md p-4 text-sm transition hover:shadow-lg"
                            >
                                <div className="mb-2 flex justify-between items-center">
                                    <span className="text-green-600 font-bold uppercase">
                                        {reserva.horario.deporte?.nombre || "Sin actividad"}
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Cancha {reserva.cancha}
                                    </span>
                                </div>

                                <div className="mb-2 text-gray-700">
                                    <p>{formatearFechaConDia(reserva.fechaTurno)}</p>
                                    <p>{reserva.horario.horaInicio} - {reserva.horario.horaFin} ⏰</p>
                                </div>

                                <div className="border-t pt-2 text-gray-600">
                                    <p className="text-xs">Cliente</p>
                                    <strong>{reserva.nombreCliente}</strong>
                                    <p className="text-xs text-gray-500 break-all">{reserva.correoCliente}</p>
                                </div>

                                <button
                                    onClick={() => rechazarReserva(reserva._id)}
                                    className="mt-3 w-full bg-red-500 text-white py-1.5 rounded hover:bg-red-600 transition text-sm"
                                >
                                    Rechazar
                                </button>
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
