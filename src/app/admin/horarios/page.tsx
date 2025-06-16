"use client";

import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const deportes = [
    { id: "67d1cefbbd7067375f6b33ac", nombre: "Pádel" },
    { id: "67d1ce8dbd7067375f6b33a8", nombre: "Fútbol" },
    { id: "67d1ceb0bd7067375f6b33aa", nombre: "Vóley" },
    { id: "67d1cea2bd7067375f6b33a9", nombre: "Básquet" },
];

export default function AdminHorarios() {
    const [selectedDeporte, setSelectedDeporte] = useState<string>(deportes[0].id);
    const [horarios, setHorarios] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<string>("");
    const [newHorario, setNewHorario] = useState<{ horaInicio: string; horaFin: string }>({
        horaInicio: "",
        horaFin: "",
    });
    const [loadingHorarios, setLoadingHorarios] = useState(true);
    const [loadingReservas, setLoadingReservas] = useState(true);

    async function fetchHorarios() {
        if (!selectedDeporte) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/horarios?deporte=${selectedDeporte}`);
            const data = await res.json();
            if (data.ok) {
                setHorarios(data.horarios || []);
            } else {
                setMensaje("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error al cargar horarios:", error);
            setMensaje("Error al cargar horarios.");
        }
        setLoading(false);
    }

    useEffect(() => {
        // Espera a que todo se renderice y luego scrollea al tope
        const scrollToTop = () => {
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "instant" }); // Podés usar "smooth" si querés
            });
        };

        // Pequeña demora para asegurar que todo se montó
        const timeout = setTimeout(scrollToTop, 50);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (selectedDeporte) {
            fetchHorarios();
        } else {
            setHorarios([]);
        }
    }, [selectedDeporte]);

    async function toggleDisponibilidad(horarioId: string, current: boolean) {
        try {
            const res = await fetch(`/api/horarios/${horarioId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disponible: !current }),
            });
            const data = await res.json();
            if (res.ok) {
                setMensaje("Disponibilidad actualizada.");
                fetchHorarios();
            } else {
                setMensaje("Error al actualizar disponibilidad: " + data.error);
            }
        } catch (error) {
            console.error("Error al actualizar disponibilidad:", error);
            setMensaje("Error al actualizar disponibilidad.");
        }
    }

    async function deleteHorario(horarioId: string) {
        const confirm = await Swal.fire({
            title: "¿Eliminar horario?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`/api/horarios/${horarioId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                await Swal.fire("Eliminado", "El horario fue eliminado correctamente.", "success");
                fetchHorarios();
            } else {
                Swal.fire("Error", data.error || "No se pudo eliminar", "error");
            }
        } catch (error) {
            console.error("Error al eliminar horario:", error);
            Swal.fire("Error", "Ocurrió un problema al eliminar el horario.", "error");
        }
    }

    async function addHorario(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedDeporte || !newHorario.horaInicio || !newHorario.horaFin) return;
        try {
            const res = await fetch(`/api/horarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deporte: selectedDeporte,
                    horaInicio: newHorario.horaInicio,
                    horaFin: newHorario.horaFin,
                    disponible: true,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setNewHorario({ horaInicio: "", horaFin: "" });
                fetchHorarios();
                await Swal.fire("Creado", "Horario agregado correctamente.", "success");
            } else {
                Swal.fire("Error", data.error || "No se pudo crear el horario.", "error");
            }
        } catch (error) {
            console.error("Error al crear horario:", error);
            Swal.fire("Error", "Ocurrió un problema al crear el horario.", "error");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex p-4 flex-col items-center mt-10">
            <div className="w-full max-w-md">
                <h1 className="text-5xl font-black mb-6 text-center">Horarios</h1>

                {/* Botones para seleccionar deporte */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {deportes.map((deporte) => (
                        <button
                            key={deporte.id}
                            onClick={() => setSelectedDeporte(deporte.id)}
                            className={`relative px-4 py-2 rounded-full text-sm font-medium transition ${selectedDeporte === deporte.id
                                ? "bg-green-600 text-white"
                                : "bg-white border border-green-600 text-green-600"
                                }`}
                        >
                            {deporte.nombre}
                        </button>
                    ))}
                </div>

                {selectedDeporte && (
                    <>
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader />
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {horarios.length > 0 ? (
                                    horarios.map((h) => (
                                        <li
                                            key={h._id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border rounded p-3 bg-white shadow-sm"
                                        >
                                            <span className="text-sm">
                                                {h.horaInicio} - {h.horaFin}
                                            </span>
                                            <div className="flex gap-2 items-center text-sm">
                                                <label className="flex items-center gap-2">
                                                    <span>Disponible</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={h.disponible}
                                                        onChange={() =>
                                                            toggleDisponibilidad(h._id, h.disponible)
                                                        }
                                                    />
                                                </label>
                                                <button
                                                    onClick={() => deleteHorario(h._id)}
                                                    className="text-red-500 hover:underline text-xs"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p>No hay horarios configurados para este deporte.</p>
                                )}
                            </ul>
                        )}

                        <h2 className="text-xl font-semibold mt-8 mb-3">Agregar Horario</h2>
                        <form onSubmit={addHorario} className="flex flex-col gap-4">
                            <label className="flex flex-col text-sm">
                                Hora de inicio:
                                <input
                                    type="time"
                                    value={newHorario.horaInicio}
                                    onChange={(e) =>
                                        setNewHorario({ ...newHorario, horaInicio: e.target.value })
                                    }
                                    required
                                    className="border p-2 rounded mt-1"
                                />
                            </label>
                            <label className="flex flex-col text-sm">
                                Hora de fin:
                                <input
                                    type="time"
                                    value={newHorario.horaFin}
                                    onChange={(e) =>
                                        setNewHorario({ ...newHorario, horaFin: e.target.value })
                                    }
                                    required
                                    className="border p-2 rounded mt-1"
                                />
                            </label>
                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                            >
                                Agregar Horario
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
