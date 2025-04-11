"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AdminReservas() {
    const [reservasPendientes, setReservasPendientes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<string>("");

    async function fetchReservasPendientes() {
        setLoading(true);
        try {
            const res = await fetch("/api/reservas?estado=pendiente");
            const data = await res.json();
            setReservasPendientes(data.reservas || []);
        } catch (error) {
            console.error("Error al cargar reservas pendientes:", error);
        }
        setLoading(false);
    }

    async function aprobarReserva(reservaId: string) {
        try {
            const res = await fetch(`/api/reservas/${reservaId}`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setMensaje("Reserva aprobada.");
                fetchReservasPendientes();
            } else {
                setMensaje("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error al aprobar la reserva:", error);
            setMensaje("Error al aprobar la reserva.");
        }
    }

    async function rechazarReserva(reservaId: string) {
        try {
            const res = await fetch(`/api/reservas/${reservaId}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                setMensaje("Reserva rechazada.");
                fetchReservasPendientes();
            } else {
                setMensaje("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error al rechazar la reserva:", error);
            setMensaje("Error al rechazar la reserva.");
        }
    }

    function formatearFecha(fechaIso: string): string {
        const fecha = new Date(fechaIso);
        return new Intl.DateTimeFormat("es-AR", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(fecha);
    }

    useEffect(() => {
        fetchReservasPendientes();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-4">Administrar Reservas</h1>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-center">Reservas Pendientes</h2>

                    {loading && <p className="text-center text-sm mb-2">Cargando reservas...</p>}

                    {reservasPendientes.length > 0 ? (
                        <ul className="space-y-4">
                        {reservasPendientes.map((reserva) => (
                            <li
                                key={reserva._id}
                                className="border-l-4 border-green-500 rounded-md bg-white shadow-md p-4 text-sm transition hover:shadow-lg"
                            >
                                <div className="mb-2 flex justify-between items-center">
                                    <span className="text-green-600 font-bold uppercase tracking-wide">
                                        {reserva.horario.deporte?.nombre || "Sin actividad"}
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Cancha {reserva.cancha}
                                    </span>
                                </div>
                    
                                <div className="mb-2 text-gray-700">
                                    <p className="text-sm font-medium">
                                        {formatearFecha(reserva.fechaTurno)}
                                    </p>
                                    <p className="text-sm">
                                        ⏰ {reserva.horario.horaInicio} - {reserva.horario.horaFin}
                                    </p>
                                </div>
                    
                                <div className="mt-2 border-t pt-2 text-gray-600 text-sm">
                                    <p>
                                        👤 <span className="font-semibold">{reserva.nombreCliente}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 break-all">{reserva.correoCliente}</p>
                                </div>
                    
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => aprobarReserva(reserva._id)}
                                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm font-semibold"
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => rechazarReserva(reserva._id)}
                                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm font-semibold"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    ) : (
                        <p className="text-center text-sm mt-4">No hay reservas pendientes</p>
                    )}
                </section>

                {mensaje && (
                    <p className="mt-6 text-center text-green-600 font-medium">{mensaje}</p>
                )}
            </div>
        </div>
    );
}
