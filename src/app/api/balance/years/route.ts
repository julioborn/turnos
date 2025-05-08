import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.rol !== "superusuario") {
        return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    // Buscar todas las reservas aprobadas
    const reservas = await Reserva.find({ estado: "aprobada" }, { fechaTurno: 1 }).lean();

    const años = new Set<number>();

    for (const r of reservas) {
        const fecha = new Date(r.fechaTurno);
        años.add(fecha.getFullYear());
    }

    // Devolver ordenado de mayor a menor
    const lista = Array.from(años).sort((a, b) => b - a);

    return NextResponse.json({ ok: true, años: lista });
}
