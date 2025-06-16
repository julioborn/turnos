"use client";

import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const deportes = ["padel", "futbol", "basquet", "voley"];

const labelDeportes: Record<string, string> = {
    padel: "Pádel",
    futbol: "Fútbol",
    basquet: "Básquet",
    voley: "Vóley",
};

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
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center mt-10">
            <div className="w-full max-w-md">
                <h2 className="text-4xl font-black mb-6 text-center">Reservas</h2>

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
                            {labelDeportes[deporte]}
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
                                className="rounded-xl shadow-lg bg-white border-l-4 border-green-500 transition p-4 text-sm space-y-3"
                            >
                                {/* Actividad y cancha */}
                                <div className="flex justify-between items-center">
                                    <span className="text-green-700 font-bold uppercase tracking-wider text-sm">
                                        {reserva.horario.deporte?.nombre || "Sin actividad"}
                                    </span>
                                    {deporteSeleccionado === "padel" && (
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
                                    <span className="font-medium">{formatearFecha(reserva.fechaTurno)}</span>
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
                                    {/* <p className="text-gray-600 font-semibold">Cliente:</p> */}
                                    <p className="text-gray-800">{reserva.nombreCliente}</p>
                                    <p className="text-gray-500 break-all">{reserva.correoCliente}</p>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => aprobarReserva(reserva._id)}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold text-sm shadow"
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => rechazarReserva(reserva._id)}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition font-semibold text-sm shadow"
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
