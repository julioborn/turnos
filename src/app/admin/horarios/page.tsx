"use client";

import { useState, useEffect } from "react";

// Ejemplo de lista de deportes (puedes obtenerlos dinámicamente)
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

    // Función para cargar los horarios para el deporte seleccionado
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
        if (selectedDeporte) {
            fetchHorarios();
        } else {
            setHorarios([]);
        }
    }, [selectedDeporte]);

    // Función para actualizar la disponibilidad de un horario
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

    // Función para agregar un nuevo horario
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
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Administrar Horarios</h1>
            <div className="mb-4">
                <label className="block mb-2">Seleccione un deporte:</label>
                <select
                    value={selectedDeporte}
                    onChange={(e) => setSelectedDeporte(e.target.value)}
                    className="border p-2"
                >
                    <option value="">-- Seleccione --</option>
                    {deportes.map((deporte) => (
                        <option key={deporte.id} value={deporte.id}>
                            {deporte.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {selectedDeporte && (
                <>
                    <h2 className="text-xl font-semibold mb-2">Horarios Disponibles</h2>
                    {loading ? (
                        <p>Cargando horarios...</p>
                    ) : (
                        <ul>
                            {horarios.length > 0 ? (
                                horarios.map((h) => (
                                    <li key={h._id} className="mb-2 border p-2 flex items-center justify-between">
                                        <span>
                                            {h.horaInicio} - {h.horaFin}
                                        </span>
                                        <label className="flex items-center gap-2">
                                            <span>Disponible</span>
                                            <input
                                                type="checkbox"
                                                checked={h.disponible}
                                                onChange={() => toggleDisponibilidad(h._id, h.disponible)}
                                            />
                                        </label>
                                    </li>
                                ))
                            ) : (
                                <p>No hay horarios configurados para este deporte.</p>
                            )}
                        </ul>
                    )}

                    <h2 className="text-xl font-semibold mt-8 mb-2">Agregar Horario</h2>
                    <form onSubmit={addHorario} className="flex flex-col gap-2 max-w-md">
                        <label className="flex flex-col">
                            Hora de inicio:
                            <input
                                type="time"
                                value={newHorario.horaInicio}
                                onChange={(e) =>
                                    setNewHorario({ ...newHorario, horaInicio: e.target.value })
                                }
                                required
                                className="border p-2"
                            />
                        </label>
                        <label className="flex flex-col">
                            Hora de fin:
                            <input
                                type="time"
                                value={newHorario.horaFin}
                                onChange={(e) =>
                                    setNewHorario({ ...newHorario, horaFin: e.target.value })
                                }
                                required
                                className="border p-2"
                            />
                        </label>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                        >
                            Agregar Horario
                        </button>
                    </form>
                    {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
                </>
            )}
        </div>
    );
}
