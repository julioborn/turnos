"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Swal from "sweetalert2";

interface Balance {
    total: number;
}

type BalanceResponse = {
    ok: true;
    general: Balance;
    deportes?: Record<string, Balance>;
};

const meses = [
    { nombre: "Enero", valor: 1 },
    { nombre: "Febrero", valor: 2 },
    { nombre: "Marzo", valor: 3 },
    { nombre: "Abril", valor: 4 },
    { nombre: "Mayo", valor: 5 },
    { nombre: "Junio", valor: 6 },
    { nombre: "Julio", valor: 7 },
    { nombre: "Agosto", valor: 8 },
    { nombre: "Septiembre", valor: 9 },
    { nombre: "Octubre", valor: 10 },
    { nombre: "Noviembre", valor: 11 },
    { nombre: "Diciembre", valor: 12 },
];

export default function BalancePage() {
    const [balanceFiltrado, setBalanceFiltrado] = useState<BalanceResponse | null>(null);
    const [balanceTotal, setBalanceTotal] = useState<BalanceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<string | null>(null);

    const [añosDisponibles, setAñosDisponibles] = useState<number[]>([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth() + 1);

    const toggle = (key: string) => {
        setOpen(open === key ? null : key);
    };

    useEffect(() => {
        const cargarAños = async () => {
            try {
                const res = await fetch("/api/balance/years");
                const data = await res.json();
                if (res.ok && data.ok) {
                    setAñosDisponibles(data.años);
                    if (data.años.length > 0) {
                        setAnioSeleccionado(data.años[0]);
                    }
                } else {
                    throw new Error("Error al cargar años");
                }
            } catch (error) {
                console.error("Error:", error);
                Swal.fire("Error", "No se pudieron cargar los años", "error");
            }
        };

        cargarAños();
    }, []);

    useEffect(() => {
        const fetchBalances = async () => {
            setLoading(true);
            try {
                const [filtradoRes, totalRes] = await Promise.all([
                    fetch(`/api/balance?anio=${anioSeleccionado}&mes=${mesSeleccionado}`),
                    fetch(`/api/balance`)
                ]);

                const dataFiltrado = await filtradoRes.json();
                const dataTotal = await totalRes.json();

                if (filtradoRes.ok && dataFiltrado.ok) {
                    setBalanceFiltrado(dataFiltrado);
                } else {
                    throw new Error("Error al obtener balance mensual");
                }

                if (totalRes.ok && dataTotal.ok) {
                    setBalanceTotal(dataTotal);
                } else {
                    throw new Error("Error al obtener balance total");
                }
            } catch (error) {
                console.error("Error:", error);
                Swal.fire("Error", "No se pudo cargar el balance", "error");
            } finally {
                setLoading(false);
            }
        };

        if (anioSeleccionado && mesSeleccionado) {
            fetchBalances();
        }
    }, [anioSeleccionado, mesSeleccionado]);

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center mt-20">

            {/* 🧾 Balance general completo */}
            {balanceTotal && (
                <div className="w-full max-w-3xl">
                    <h2 className="text-3xl font-extrabold mb-6 text-center text-green-700 uppercase mt-10">
                        Balance Total
                    </h2>
                    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-green-600">
                        <Card label="Total" valor={balanceTotal.general.total} />
                    </div>
                </div>
            )}

            <h2 className="text-3xl font-extrabold mb-6 text-center text-green-700 uppercase mt-10">
                Balance por Mes
            </h2>

            {/* Selectores */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
                <select
                    className="px-4 py-2 border rounded bg-white"
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                >
                    {añosDisponibles.map((anio) => (
                        <option key={anio} value={anio}>
                            {anio}
                        </option>
                    ))}
                </select>

                <select
                    className="px-4 py-2 border rounded bg-white"
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                >
                    {meses.map((mes) => (
                        <option key={mes.valor} value={mes.valor}>
                            {mes.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader />
                </div>
            ) : (
                <>
                    {/* 💰 Balance filtrado por año+mes */}
                    {balanceFiltrado && (
                        <div className="w-full max-w-3xl space-y-6">
                            {/* Total mensual general */}
                            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-green-600">
                                <Card label="Total" valor={balanceFiltrado.general.total} />
                            </div>

                            <h2 className="text-2xl font-extrabold mb-6 text-center text-green-700 uppercase mt-10">
                                Balance por Deporte
                            </h2>

                            {/* Totales por Deporte visibles directamente */}
                                {balanceFiltrado.deportes &&
                                Object.entries(balanceFiltrado.deportes).map(([deporte, data]) => (
                                    <div key={deporte} className="bg-white rounded-md shadow p-6 border-2 border-green-600">
                                        <h4 className="text-lg font-bold text-green-700 uppercase mb-2">
                                            {deporte.charAt(0).toUpperCase() + deporte.slice(1)}
                                        </h4>
                                        <Card label="Total" valor={data.total} />
                                    </div>
                                ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function Card({ label, valor }: { label: string; valor: number }) {
    return (
        <div className="bg-gray-50 border rounded-md p-4 text-center mt-2">
            <p className="text-sm text-gray-500 uppercase">{label}</p>
            <p className="text-xl font-bold text-green-800 mt-1">
                {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                }).format(valor)}
            </p>
        </div>
    );
}
