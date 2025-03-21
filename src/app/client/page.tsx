"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isBefore, format } from "date-fns";
import { signOut, useSession } from "next-auth/react";

// Mapeo de actividades (nos enfocamos en "padel")
const actividadIds: { [key: string]: string } = {
    padel: "67d1cefbbd7067375f6b33ac",
};

// Función auxiliar para extraer el ID en forma de cadena, ya sea que venga como objeto con $oid o como string
function getId(id: any): string {
    if (typeof id === "object" && id !== null && "$oid" in id) {
        return id.$oid;
    }
    return id.toString();
}

export default function ClientHorarios() {
    const { data: session } = useSession();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [horariosPlantilla, setHorariosPlantilla] = useState<any[]>([]);
    const [reservasDelDia, setReservasDelDia] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<string>("");
    const deporteId = actividadIds["padel"];

    // Obtener la plantilla de horarios para el deporte
    async function fetchHorariosPlantilla() {
        try {
            const res = await fetch(`/api/horarios?deporte=${deporteId}`);
            const data = await res.json();
            setHorariosPlantilla(data.horarios || []);
        } catch (error) {
            console.error("Error al cargar plantilla de horarios:", error);
        }
    }

    // Obtener reservas para la fecha seleccionada
    async function fetchReservas(fecha: string) {
        try {
            const res = await fetch(
                `/api/reservas?deporte=${deporteId}&fecha=${fecha}`,
                { credentials: "include" }
            );
            const data = await res.json();
            console.log("Reservas recibidas:", data.reservas);
            setReservasDelDia(data.reservas || []);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
        }
    }

    useEffect(() => {
        const fechaStr = format(selectedDate, "yyyy-MM-dd");
        fetchReservas(fechaStr);
    }, [selectedDate]);

    useEffect(() => {
        fetchHorariosPlantilla();
    }, []);

    async function reservarHorario(horarioId: string) {
        const fechaStr = format(selectedDate, "yyyy-MM-dd");
        try {
            const res = await fetch("/api/reservas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ horario: horarioId, fechaTurno: fechaStr }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Reserva realizada. Queda pendiente para aprobación.");
                fetchReservas(fechaStr);
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error en la reserva:", error);
            setMensaje("Error en la reserva.");
        }
    }

    // Función para verificar si un horario ya pasó para la fecha seleccionada
    function estaEnElPasado(horaInicio: string, fecha: Date): boolean {
        const [horas, minutos] = horaInicio.split(":").map(Number);
        const fechaHorario = new Date(fecha);
        fechaHorario.setHours(horas, minutos, 0, 0);
        return isBefore(fechaHorario, new Date());
    }

    // Extraer el ID del turno de la reserva
    function obtenerIdReserva(r: any): string {
        return r.horario?._id?.toString() || "";
    }

    // Determinar si un turno ya está reservado (con estado distinto a "rechazada")
    function estaReservado(horarioId: string): boolean {
        return reservasDelDia.some(
            (reserva) =>
                obtenerIdReserva(reserva) === horarioId && reserva.estado !== "rechazada"
        );
    }

    // Obtener la reserva del turno (para comparar si pertenece al usuario)
    function obtenerReserva(horarioId: string): any {
        return reservasDelDia.find(
            (r) => obtenerIdReserva(r) === horarioId && r.estado !== "rechazada"
        );
    }

    const esHoy =
        format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Reserva de Turnos para Padel</h1>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Cerrar sesión
                </button>
            </div>
            <div className="mb-4">
                <label className="block mb-2">Seleccione una fecha:</label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => date && setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    className="cursor-pointer"
                />
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">
                    Horarios para {format(selectedDate, "yyyy-MM-dd")}
                </h2>
                {horariosPlantilla.length > 0 ? (
                    <ul>
                        {horariosPlantilla.map((h) => {
                            const idPlantilla = getId(h._id);
                            const reserva = obtenerReserva(idPlantilla);
                            console.log("Comparando turno:", idPlantilla, "con reservas:",
                                reservasDelDia.map((r) => obtenerIdReserva(r))
                            );
                            const pasado = esHoy && estaEnElPasado(h.horaInicio, selectedDate);
                            let disabled = false;
                            let botonTexto = "Reservar";

                            if (reserva) {
                                disabled = true;
                                console.log("Usuario:", session?.user.documento, "Reserva:", reserva.correoCliente);
                                if (
                                    reserva.estado === "pendiente" &&
                                    session &&
                                    session.user.documento === reserva.correoCliente
                                ) {
                                    botonTexto = "Pendiente";
                                } else {
                                    botonTexto = "Reservado";
                                }
                            } else if (pasado) {
                                disabled = true;
                                botonTexto = "Pasado";
                            }

                            return (
                                <li key={idPlantilla} className="mb-2 border p-2">
                                    {h.horaInicio} - {h.horaFin}{" "}
                                    <button
                                        onClick={() => reservarHorario(idPlantilla)}
                                        disabled={disabled}
                                        className={`px-2 py-1 rounded ${disabled
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-blue-500 text-white"
                                            }`}
                                    >
                                        {botonTexto}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No hay turnos configurados.</p>
                )}
            </div>
            {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
        </div>
    );
}
