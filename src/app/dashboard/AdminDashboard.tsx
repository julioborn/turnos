"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
    const [reservasPendientes, setReservasPendientes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<string>("");

    // Función para obtener reservas pendientes (se espera que el endpoint soporte el filtro por estado)
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

    // Función para aprobar una reserva
    async function aprobarReserva(reservaId: string) {
        try {
            const res = await fetch(`/api/reservas/${reservaId}/aprobar`, {
                method: "POST",
            });
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

    // Función para rechazar (eliminar) una reserva
    async function rechazarReserva(reservaId: string) {
        try {
            const res = await fetch(`/api/reservas/${reservaId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                setMensaje("Reserva rechazada y eliminada.");
                fetchReservasPendientes();
            } else {
                setMensaje("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error al rechazar la reserva:", error);
            setMensaje("Error al rechazar la reserva.");
        }
    }

    useEffect(() => {
        fetchReservasPendientes();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Panel de Administrador</h1>

            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                Cerrar sesión
            </button>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Crear/Editar Horarios</h2>
                {/* Aquí puedes agregar un formulario para crear o editar actividades/horarios */}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Reservas Pendientes</h2>
                {loading && <p>Cargando reservas pendientes...</p>}
                {reservasPendientes.length > 0 ? (
                    <ul>
                        {reservasPendientes.map((reserva) => (
                            <li key={reserva._id} className="mb-2 border p-2">
                                <p>
                                    {reserva.horario.deporte.toUpperCase()} -{" "}
                                    {reserva.horario.horaInicio} a {reserva.horario.horaFin}
                                </p>
                                <p>
                                    Cliente: {reserva.nombreCliente} - {reserva.correoCliente}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => aprobarReserva(reserva._id)}
                                        className="bg-green-500 text-white px-2 py-1 rounded"
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => rechazarReserva(reserva._id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay reservas pendientes</p>
                )}
            </section>

            {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
        </div>
    );
}
