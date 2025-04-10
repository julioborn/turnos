"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isBefore, format } from "date-fns";
import { signOut, useSession } from "next-auth/react";
import { es } from "date-fns/locale";

const actividadIds: { [key: string]: string } = {
    padel: "67d1cefbbd7067375f6b33ac",
};

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
    const [mensaje, setMensaje] = useState<string>("");
    const deporteId = actividadIds["padel"];

    async function fetchHorariosPlantilla() {
        try {
            const res = await fetch(`/api/horarios?deporte=${deporteId}`);
            const data = await res.json();
            const sortedHorarios = (data.horarios || []).sort((a: any, b: any) =>
                a.horaInicio.localeCompare(b.horaInicio)
            );
            setHorariosPlantilla(sortedHorarios);
        } catch (error) {
            console.error("Error al cargar plantilla de horarios:", error);
        }
    }

    async function fetchReservas(fecha: string) {
        try {
            const res = await fetch(
                `/api/reservas?deporte=${deporteId}&fecha=${fecha}`,
                { credentials: "include" }
            );
            const data = await res.json();
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

    async function reservarHorario(horarioId: string, cancha: number) {
        const fechaStr = format(selectedDate, "yyyy-MM-dd");
        try {
            const res = await fetch("/api/reservas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ horario: horarioId, fechaTurno: fechaStr, cancha }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Reserva realizada en Cancha ${cancha}. Queda pendiente para aprobación.`);
                fetchReservas(fechaStr);
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error en la reserva:", error);
            setMensaje("Error en la reserva.");
        }
    }

    function estaEnElPasado(horaInicio: string, fecha: Date): boolean {
        const [horas, minutos] = horaInicio.split(":").map(Number);
        const fechaHorario = new Date(fecha);
        fechaHorario.setHours(horas, minutos, 0, 0);
        return isBefore(fechaHorario, new Date());
    }

    function obtenerIdReserva(r: any): string {
        return r.horario?._id?.toString() || "";
    }

    function obtenerReserva(horarioId: string, cancha: number): any {
        return reservasDelDia.find(
            (r) =>
                obtenerIdReserva(r) === horarioId &&
                r.cancha === cancha &&
                r.estado !== "rechazada"
        );
    }

    const esHoy = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-500 mb-4 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
                Cerrar sesión
            </button>
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center gap-4 mb-2">
                    <h1 className="text-2xl font-bold text-center">Reserva de Turnos para Padel</h1>
                </div>

                <div className="mb-6 flex flex-col items-center">
                    <p className="text-lg font-medium mb-2 text-gray-700 text-center">Seleccionar fecha</p>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => date && setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        locale={es}
                        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-center w-full text-base"
                        placeholderText="Seleccionar fecha"
                    />
                </div>

                {horariosPlantilla.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border text-base sm:text-lg">
                            <thead>
                                <tr className="bg-gray-200 text-sm sm:text-base">
                                    <th className="border px-3 py-2">Horario</th>
                                    <th className="border px-3 py-2">Cancha 1</th>
                                    <th className="border px-3 py-2">Cancha 2</th>
                                </tr>
                            </thead>
                            <tbody>
                                {horariosPlantilla
                                    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                                    .map((h) => {
                                        const idPlantilla = getId(h._id);
                                        const noDisponible = !h.disponible;
                                        const pasado = esHoy && estaEnElPasado(h.horaInicio, selectedDate);

                                        return (
                                            <tr key={idPlantilla} className="text-center">
                                                <td className="border px-3 py-3 font-medium">
                                                    {h.horaInicio} - {h.horaFin}
                                                </td>
                                                {[1, 2].map((cancha) => {
                                                    const reserva = obtenerReserva(idPlantilla, cancha);
                                                    const esDelUsuario =
                                                        reserva && session?.user.documento === reserva.correoCliente;

                                                    const disabled = !!reserva || pasado || noDisponible;
                                                    let texto = "Reservar";

                                                    if (reserva) {
                                                        texto = esDelUsuario && reserva.estado === "pendiente"
                                                            ? "Pendiente"
                                                            : "Reservado";
                                                    } else if (pasado) {
                                                        texto = "Pasado";
                                                    } else if (noDisponible) {
                                                        texto = "No disponible";
                                                    }

                                                    return (
                                                        <td key={cancha} className="border px-2 py-2">
                                                            <button
                                                                onClick={() => reservarHorario(idPlantilla, cancha)}
                                                                disabled={disabled}
                                                                className={`w-full px-2 py-2 rounded font-semibold text-sm sm:text-base ${disabled
                                                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                                                    : "bg-blue-500 text-white hover:bg-blue-600 transition"
                                                                    }`}
                                                            >
                                                                {texto}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-sm">No hay turnos configurados.</p>
                )}
                {mensaje && <p className="mt-4 text-green-600 text-center">{mensaje}</p>}
            </div>
        </div>
    );
}
