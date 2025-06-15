"use client";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Swal from "sweetalert2";

const deportes: { nombre: string; id: string }[] = [
    { nombre: "pádel", id: "padel" },
    { nombre: "fútbol", id: "futbol" },
    { nombre: "básquet", id: "basquet" },
    { nombre: "vóley", id: "voley" },
];

export default function AdminPrecios() {
    const [deporteSeleccionado, setDeporteSeleccionado] = useState("padel");
    const [precio, setPrecio] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        const fetchPrecio = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/precios/${deporteSeleccionado}`);
                const data = await res.json();
                if (data?.precioHora !== undefined) {
                    setPrecio(data.precioHora);
                } else {
                    setPrecio(null);
                }
            } catch (error) {
                console.error("Error al cargar el precio:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrecio();
    }, [deporteSeleccionado]);

    const handleGuardar = async () => {
        if (precio === null) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/precios/${deporteSeleccionado}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ precioHora: precio }),
            });
            if (res.ok) {
                await Swal.fire({
                    title: "¡Guardado!",
                    text: "El precio fue actualizado correctamente.",
                    icon: "success",
                    confirmButtonColor: "#16a34a",
                    confirmButtonText: "Aceptar",
                });
            } else {
                Swal.fire("Error", "No se pudo actualizar el precio", "error");
            }
        } catch (error) {
            console.error("Error al guardar el precio:", error);
            Swal.fire("Error", "Ocurrió un problema al guardar el precio", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center mt-10">
            <h2 className="text-4xl font-extrabold mb-6 text-center">Editar Precios</h2>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
                {deportes.map((d) => (
                    <button
                        key={d.id}
                        onClick={() => setDeporteSeleccionado(d.id)}
                        className={`relative px-4 py-2 rounded-full text-sm font-medium transition ${deporteSeleccionado === d.id
                                ? "bg-green-600 text-white"
                                : "bg-white border border-green-600 text-green-600"
                            }`}
                    >
                        {d.nombre.charAt(0).toUpperCase() + d.nombre.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader />
                </div>
            ) : (
                <div className="bg-white shadow-md p-6 rounded-md w-full max-w-sm text-center">
                    <h3 className="text-xl font-bold mb-4">
                        Precio Hora de {deporteSeleccionado.charAt(0).toUpperCase() + deporteSeleccionado.slice(1)}
                    </h3>
                    <input
                        type="number"
                        value={precio ?? 0}
                        onChange={(e) => setPrecio(Number(e.target.value))}
                        className="border rounded px-4 py-2 w-full mb-4"
                    />
                    <button
                        onClick={handleGuardar}
                        className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
                        disabled={precio === null || saving}
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            )}
        </div>
    );
}
