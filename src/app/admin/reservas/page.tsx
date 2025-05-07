"use client";

import Loader from "@/components/Loader";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const deportes = ["padel", "futbol", "basquet", "voley"];

export default function AdminReservas() {
    const [reservasPendientes, setReservasPendientes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [deporteSeleccionado, setDeporteSeleccionado] = useState<string>("padel");

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
                await Swal.fire("Aprobada", "La reserva fue aprobada exitosamente.", "success");
                fetchReservasPendientes();
            } else {
                Swal.fire("Error", data.error || "No se pudo aprobar la reserva.", "error");
            }
        } catch (error) {
            console.error("Error al aprobar la reserva:", error);
            Swal.fire("Error", "Ocurrió un problema al aprobar la reserva.", "error");
        }
    }

    async function rechazarReserva(reservaId: string) {
        try {
            const confirm = await Swal.fire({
                title: "¿Rechazar reserva?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, rechazar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#dc2626",
            });

            if (!confirm.isConfirmed) return;

            const res = await fetch(`/api/reservas/${reservaId}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok) {
                await Swal.fire("Rechazada", "La reserva fue rechazada correctamente.", "success");
                fetchReservasPendientes();
            } else {
                Swal.fire("Error", data.error || "No se pudo rechazar la reserva.", "error");
            }
        } catch (error) {
            console.error("Error al rechazar la reserva:", error);
            Swal.fire("Error", "Ocurrió un problema al rechazar la reserva.", "error");
        }
    }

    function formatearFecha(fechaIso: string): string {
        const fecha = new Date(fechaIso);
        const formateada = new Intl.DateTimeFormat("es-AR", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(fecha);

        return formateada.charAt(0).toUpperCase() + formateada.slice(1);
    }

    useEffect(() => {
        fetchReservasPendientes();
    }, []);

    const cantidadPorDeporte = (nombre: string) =>
        reservasPendientes.filter((r) => r.horario.deporte?.nombre?.toLowerCase() === nombre).length;

    const reservasFiltradas = reservasPendientes.filter(
        (r) => r.horario.deporte?.nombre?.toLowerCase() === deporteSeleccionado
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center mt-20">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-extrabold mb-4 text-center">Reservas Pendientes</h2>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {deportes.map((deporte) => (
                        <button
                            key={deporte}
                            onClick={() => setDeporteSeleccionado(deporte)}
                            className={`relative px-4 py-2 rounded-full text-sm font-medium transition ${deporteSeleccionado === deporte
                                ? "bg-green-600 text-white"
                                : "bg-white border border-green-600 text-green-600"
                                }`}
                        >
                            {deporte.charAt(0).toUpperCase() + deporte.slice(1)}
                            {cantidadPorDeporte(deporte) > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
                                    {cantidadPorDeporte(deporte)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader />
                    </div>
                ) : reservasFiltradas.length > 0 ? (
                    <ul className="space-y-4">
                        {reservasFiltradas.map((reserva) => (
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
                                    <p className="font-medium">{formatearFecha(reserva.fechaTurno)}</p>
                                    <p>{reserva.horario.horaInicio} - {reserva.horario.horaFin} ⏰</p>
                                    <p>${reserva.precioHora}</p>
                                </div>

                                <div className="border-t pt-2 text-gray-600">
                                    <p className="text-xs">Cliente</p>
                                    <span className="font-semibold">{reserva.nombreCliente}</span>
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
                    <p className="text-center text-sm mt-4">No hay reservas
                        {/* de {deporteSeleccionado} */}
                    </p>
                )}
            </div>
        </div>
    );
}
