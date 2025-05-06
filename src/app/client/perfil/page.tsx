"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loader from "@/components/Loader"; // ✅ importamos el Loader

export default function PerfilCliente() {
    const { data: session } = useSession();
    const [usuario, setUsuario] = useState({ nombre: "", documento: "", telefono: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetch("/api/usuarios/perfil")
                .then(res => res.json())
                .then(data => {
                    setUsuario({
                        nombre: data.nombre || "",
                        documento: data.documento || "",
                        telefono: data.telefono || "",
                    });
                    setLoading(false);
                });
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsuario({ ...usuario, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const res = await fetch("/api/usuarios/perfil", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario),
        });

        if (res.ok) {
            Swal.fire("¡Actualizado!", "Tu perfil fue actualizado correctamente.", "success");
        } else {
            Swal.fire("Error", "No se pudo actualizar el perfil.", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start pt-24">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-green-600">Mi Perfil</h2>

                <label className="block mb-2 font-medium text-sm text-gray-700">Nombre</label>
                <input
                    name="nombre"
                    value={usuario.nombre}
                    onChange={handleChange}
                    className="mb-4 w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <label className="block mb-2 font-medium text-sm text-gray-700">Documento</label>
                <input
                    name="documento"
                    value={usuario.documento}
                    onChange={handleChange}
                    className="mb-4 w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
                    disabled
                />

                <label className="block mb-2 font-medium text-sm text-gray-700">Teléfono</label>
                <input
                    name="telefono"
                    value={usuario.telefono}
                    onChange={handleChange}
                    className="mb-4 w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
}
