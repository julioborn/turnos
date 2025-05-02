"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // No mostrar el header en /login
    if (pathname === "/login") return null;

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        router.push(path);
    };

    return (
        <header className="fixed top-0 left-0 w-full bg-green-600 text-white shadow-md px-6 py-4 flex justify-between items-center z-50 h-20">
            <button onClick={toggleMenu} className="focus:outline-none">
                {isOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
            </button>
            <img
                src="/crc-old-nobg.png"
                alt="Logo Turnos"
                className="h-16 w-20 object-contain"
            />

<AnimatePresence>
    {isOpen && (
        <>
            {/* Fondo oscuro detrás del menú */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-40"
                onClick={toggleMenu}
            />

            {/* Menú lateral */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 h-full w-64 bg-[#F3F4F6] text-black shadow-xl z-50 p-6 flex flex-col gap-4"
            >
                <h2 className="text-xl font-bold mb-4 text-green-600">Menú</h2>
                <ul className="flex flex-col gap-2">
                    {session?.user.rol === "admin" && (
                        <>
                            <li>
                                <button onClick={() => handleNavigate("/admin")} 
                                  className="w-full bg-white text-left px-4 py-3 rounded-lg shadow hover:bg-green-100 transition font-semibold text-gray-800"
>
                                    Inicio
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigate("/admin/horarios")}   className="w-full bg-white text-left px-4 py-3 rounded-lg shadow hover:bg-green-100 transition font-semibold text-gray-800"
>
                                    Horarios
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigate("/admin/reservas")}   className="w-full bg-white text-left px-4 py-3 rounded-lg shadow hover:bg-green-100 transition font-semibold text-gray-800"
>
                                    Reservas
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigate("/admin/historial")}   className="w-full bg-white text-left px-4 py-3 rounded-lg shadow hover:bg-green-100 transition font-semibold text-gray-800"
>
                                    Historial
                                </button>
                            </li>
                        </>
                    )}

                    {session?.user.rol === "cliente" && (
                        <>
                            <li>
                                <button onClick={() => handleNavigate("/client")}   className="w-full bg-white text-left px-4 py-3 rounded-lg shadow hover:bg-green-100 transition font-semibold text-gray-800"
>
                                    Inicio
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigate("/client/mis-reservas")}   className="w-full bg-white text-left px-4 py-3 rounded-lg shadow hover:bg-green-100 transition font-semibold text-gray-800"
>
                                    Mis Reservas
                                </button>
                            </li>
                        </>
                    )}
                </ul>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full bg-white text-left px-4 py-3 rounded-lg shadow hover:bg-red-100 transition font-semibold text-red-600"

                >
                    Cerrar Sesión
                </button>
            </motion.div>
        </>
    )}
</AnimatePresence>

        </header>
    );
}
