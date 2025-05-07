"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isBefore, format } from "date-fns";
import { signOut, useSession } from "next-auth/react";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";
import Loader from "@/components/Loader";

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
    const deporteId = actividadIds["padel"];
    const [loadingHorarios, setLoadingHorarios] = useState(true);
    const [loadingReservas, setLoadingReservas] = useState(true);

    async function fetchHorariosPlantilla() {
        setLoadingHorarios(true);
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
        setLoadingHorarios(false);
    }

    async function fetchReservas(fecha: string) {
        setLoadingReservas(true);
        try {
            const res = await fetch(`/api/reservas?deporte=${deporteId}&fecha=${fecha}`);
            const data = await res.json();
            setReservasDelDia(data.reservas || []);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
        }
        setLoadingReservas(false);
    }

    useEffect(() => {
        const fechaStr = format(selectedDate, "yyyy-MM-dd");
        fetchReservas(fechaStr);
    }, [selectedDate]);

    useEffect(() => {
        fetchHorariosPlantilla();
    }, []);

    async function reservarHorario(horarioId: string, cancha: number, horaInicio: string, horaFin: string) {
        const fechaStr = format(selectedDate, "yyyy-MM-dd");

        const confirm = await Swal.fire({
            title: "¿Confirmar reserva?",
            html: `
                <p><strong>Fecha:</strong> ${format(selectedDate, "dd-MM-yyyy")}</p>
                <p><strong>Horario:</strong> ${horaInicio} - ${horaFin}</p>
                <p><strong>Cancha:</strong> ${cancha}</p>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Reservar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#16a34a",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch("/api/reservas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ horario: horarioId, fechaTurno: fechaStr, cancha }),
            });
            const data = await res.json();
            if (res.ok) {
                await Swal.fire("¡Listo!", "Tu reserva fue registrada y está pendiente de aprobación.", "success");
                fetchReservas(fechaStr);
            } else {
                const mensaje =
                    data.error?.includes("día")
                        ? "Ya tenés una reserva para este deporte en ese día."
                        : data.error?.includes("semana")
                            ? "Alcanzaste el máximo de 3 reservas semanales para este deporte."
                            : data.error || "No se pudo hacer la reserva.";
                await Swal.fire("Reserva no permitida", mensaje, "warning");
            }
        } catch (error) {
            console.error("Error en la reserva:", error);
            await Swal.fire("Error", "Ocurrió un problema al hacer la reserva.", "error");
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

    function obtenerReservaDelUsuario(horarioId: string, cancha: number): any {
        return reservasDelDia.find(
            (r) =>
                obtenerIdReserva(r) === horarioId &&
                r.cancha === cancha &&
                r.estado !== "rechazada" &&
                r.correoCliente === session?.user.documento
        );
    }

    const esHoy = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <div className="w-full max-w-md mt-2">
                <div className="flex flex-col items-center mb-6">
                    <h1 className="text-4xl uppercase font-black text-green-700 tracking-tight">Pádel</h1>
                    <p className="text-sm uppercase tracking-widest text-gray-500 mt-1">Turnos disponibles</p>
                </div>


                <div className="mb-6 mt-2 flex flex-col items-center w-full max-w-xs sm:max-w-sm mx-auto">
                    <p className="text-sm uppercase text-gray-500 mb-0.5">Elegir Fecha</p>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => date && setSelectedDate(date)}
                        dateFormat="dd-MM-yyyy"
                        minDate={new Date()}
                        locale={es}
                        className="bg-green-600 text-white px-4 py-2 rounded-full text-center cursor-pointer w-full text-base focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        placeholderText="Seleccionar fecha"
                    />
                </div>

                {loadingHorarios || loadingReservas ? (
                    <Loader />
                ) : horariosPlantilla.length > 0 ? (
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
                                {horariosPlantilla.map((h) => {
                                    const idPlantilla = getId(h._id);
                                    const noDisponible = !h.disponible;
                                    const pasado = esHoy && estaEnElPasado(h.horaInicio, selectedDate);

                                    return (
                                        <tr key={idPlantilla} className="text-center">
                                            <td className="border px-3 py-3 font-mono">
                                                {h.horaInicio} - {h.horaFin}
                                            </td>
                                            {[1, 2].map((cancha) => {
                                                const reservasEnEseHorario = reservasDelDia.filter(
                                                    (r) =>
                                                        obtenerIdReserva(r) === idPlantilla &&
                                                        r.cancha === cancha
                                                );

                                                const reservaDelUsuario = reservasEnEseHorario.find(
                                                    (r) => r.correoCliente === session?.user.documento && r.estado !== "rechazada"
                                                );

                                                const hayReservaAprobada = reservasEnEseHorario.some(
                                                    (r) => r.estado === "aprobada"
                                                );

                                                const disabled = hayReservaAprobada || pasado || noDisponible || reservaDelUsuario;
                                                let texto = "Reservar";

                                                if (reservaDelUsuario) {
                                                    texto = reservaDelUsuario.estado === "pendiente" ? "Pendiente" : "Reservado";
                                                } else if (hayReservaAprobada) {
                                                    texto = "Reservado";
                                                } else if (pasado) {
                                                    texto = "Reservar";
                                                } else if (noDisponible) {
                                                    texto = "No disponible";
                                                }

                                                return (
                                                    <td key={cancha} className="border px-2 py-2">
                                                        <button
                                                            onClick={() =>
                                                                reservarHorario(idPlantilla, cancha, h.horaInicio, h.horaFin)
                                                            }
                                                            disabled={disabled}
                                                            className={`w-full px-2 py-2 rounded font-semibold text-sm sm:text-base ${disabled
                                                                ? "bg-gray-400 text-white cursor-not-allowed"
                                                                : "bg-green-500 text-white hover:bg-green-600 transition"
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
            </div>
        </div>
    );
}
