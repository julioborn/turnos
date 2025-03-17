// app/api/reservas/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);

    // Si se pasa el parámetro "estado", se asume que es una consulta de admin
    const estado = searchParams.get("estado");
    if (estado) {
        try {
            const reservas = await Reserva.find({ estado })
                .populate("horario")
                .lean();
            return NextResponse.json({ ok: true, reservas });
        } catch (error: any) {
            return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
        }
    }

    // Si no se pasa "estado", se requieren "deporte" y "fecha"
    const deporte = searchParams.get("deporte");
    const fecha = searchParams.get("fecha");
    if (!deporte || !fecha) {
        return NextResponse.json(
            { ok: false, error: "Faltan parámetros (deporte y fecha son requeridos)" },
            { status: 400 }
        );
    }

    // Crear un rango basado en UTC para el día solicitado
    const start = new Date(`${fecha}T00:00:00Z`);
    const end = new Date(`${fecha}T23:59:59.999Z`);

    try {
        const reservas = await Reserva.find({
            fechaTurno: { $gte: start, $lte: end },
        })
            .populate("horario")
            .lean();

        // Filtrar reservas cuyo horario tenga el deporte
        const reservasFiltradas = reservas.filter(
            (reserva) =>
                reserva.horario &&
                reserva.horario.deporte.toString() === deporte
        );

        return NextResponse.json({ ok: true, reservas: reservasFiltradas });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const { horario, fechaTurno } = await request.json();
    if (!horario || !fechaTurno) {
        return NextResponse.json({ ok: false, error: "Faltan campos requeridos" }, { status: 400 });
    }

    try {
        const nuevaReserva = await Reserva.create({
            horario,
            fechaTurno,
            nombreCliente: session.user.nombre,
            correoCliente: session.user.documento,
            estado: "pendiente",
        });
        return NextResponse.json({ ok: true, reserva: nuevaReserva }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}


