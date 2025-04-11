"use client";

import { useState, useEffect } from "react";

const deportes = [
    { id: "67d1cefbbd7067375f6b33ac", nombre: "Padel" },
    { id: "67d1ce8dbd7067375f6b33a8", nombre: "Fútbol" },
    { id: "67d1ceb0bd7067375f6b33aa", nombre: "Vóley" },
    { id: "67d1cea2bd7067375f6b33a9", nombre: "Básquet" },
];

export default function AdminHorarios() {
    const [selectedDeporte, setSelectedDeporte] = useState<string>("");
    const [horarios, setHorarios] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<string>("");
    const [newHorario, setNewHorario] = useState<{ horaInicio: string; horaFin: string }>({
        horaInicio: "",
        horaFin: "",
    });

    async function fetchHorarios() {
        if (!selectedDeporte) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/horarios?deporte=${selectedDeporte}`);
            const data = await res.json();
            if (data.ok) {
                const ordenados = (data.horarios || []).sort((a: any, b: any) =>
                    a.horaInicio.localeCompare(b.horaInicio)
                );
                setHorarios(ordenados);
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
        if (!confirm("¿Estás seguro de eliminar este horario?")) return;
        try {
            const res = await fetch(`/api/horarios/${horarioId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                setMensaje("Horario eliminado.");
                fetchHorarios();
            } else {
                setMensaje("Error al eliminar horario: " + data.error);
            }
        } catch (error) {
            console.error("Error al eliminar horario:", error);
            setMensaje("Error al eliminar horario.");
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
                setMensaje("Horario creado.");
                setNewHorario({ horaInicio: "", horaFin: "" });
                fetchHorarios();
            } else {
                setMensaje("Error al crear horario: " + data.error);
            }
        } catch (error) {
            console.error("Error al crear horario:", error);
            setMensaje("Error al crear horario.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Administrar Horarios</h1>

                {/* Botones para seleccionar deporte */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {deportes.map((deporte) => (
                        <button
                            key={deporte.id}
                            onClick={() => setSelectedDeporte(deporte.id)}
                            className={`px-4 py-2 rounded font-medium transition ${selectedDeporte === deporte.id
                                    ? "bg-green-600 text-white"
                                    : "bg-white text-gray-800 border border-gray-300"
                                }`}
                        >
                            {deporte.nombre}
                        </button>
                    ))}
                </div>

                {selectedDeporte && (
                    <>
                        <h2 className="text-xl font-semibold mb-3">Horarios Disponibles</h2>
                        {loading ? (
                            <p className="text-center">Cargando horarios...</p>
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
                        {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
                    </>
                )}
            </div>
        </div>
    );
}
