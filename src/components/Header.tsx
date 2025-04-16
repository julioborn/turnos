"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { div } from "framer-motion/client";

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // No renderizar en /login
    if (pathname === "/login") return null;

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        router.push(path);
    };

    return (
        <header className="w-full bg-green-600 text-white px-6 py-5 flex justify-between items-center shadow-md fixed top-0 left-0 z-50">
            <button onClick={toggleMenu} className="focus:outline-none">
                {isOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
            </button>
            <img
                src="/crc4.png"
                alt="Logo Turnos"
                className="h-10 object-contain"
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-full left-0 bg-white text-black shadow-md w-48 rounded-md mt-2 overflow-hidden z-50"
                    >
                        <ul className="flex flex-col">
                            {session?.user.rol === "admin" && (
                                <>
                                    <li>
                                        <button
                                            onClick={() => handleNavigate("/admin")}
                                            className="w-full text-left px-4 py-2 hover:bg-green-100"
                                        >
                                            Inicio
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleNavigate("/admin/horarios")}
                                            className="w-full text-left px-4 py-2 hover:bg-green-100"
                                        >
                                            Horarios
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleNavigate("/admin/reservas")}
                                            className="w-full text-left px-4 py-2 hover:bg-green-100"
                                        >
                                            Reservas
                                        </button>
                                    </li>
                                </>
                            )}
                            {session?.user.rol === "cliente" && (
                                <div>
                                    {/* <li className="px-4 py-2 text-sm text-gray-700 font-medium">
                                        {session.user.nombre}
                                    </li> */}
                                    <li>
                                        <button
                                            onClick={() => handleNavigate("/client")}
                                            className="w-full text-left px-4 py-2 hover:bg-green-100"
                                        >
                                            Inicio
                                        </button>
                                    </li>
                                </div>
                            )}
                            <li>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                                >
                                    Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
