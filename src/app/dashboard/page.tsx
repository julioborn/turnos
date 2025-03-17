"use client";
import { useSession } from "next-auth/react";
import AdminDashboard from "./AdminDashboard";
import ClienteDashboard from "./ClienteDashboard";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    console.log("Session:", session, "Status:", status);

    if (status === "loading") return <div>Cargando...</div>;

    // Redirigir a login si no hay sesión
    if (!session) return <div>No has iniciado sesión</div>;

    // Si el rol es admin, mostramos el panel de administración, sino el de cliente
    return session.user.rol === "admin" ? <AdminDashboard /> : <ClienteDashboard />;
}
