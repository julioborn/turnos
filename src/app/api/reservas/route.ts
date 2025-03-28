import "@/models";  // Asegura que se carguen todos los modelos
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
// import Horario from "@/models/Horario";  // ya se cargó mediante models/index.ts
// import Actividad from "@/models/Actividad";  // ya se cargó mediante models/index.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";


export async function GET(request: Request) {
    await connectMongoDB();
    const { searchParams } = new URL(request.url, process.env.NEXTAUTH_URL || "http://localhost:3000");
    const estado = searchParams.get("estado");
    const deporte = searchParams.get("deporte");
    const fecha = searchParams.get("fecha");

    if (estado) {
        try {
            const reservas = await Reserva.find({ estado })
                .populate({
                    path: "horario",
                    populate: { path: "deporte", model: "Actividad" },
                })
                .lean();
            return NextResponse.json({ ok: true, reservas });
        } catch (error: any) {
            return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
        }
    } else if (deporte && fecha) {
        const start = new Date(`${fecha}T00:00:00Z`);
        const end = new Date(`${fecha}T23:59:59.999Z`);
        try {
            const reservas = await Reserva.find({
                fechaTurno: { $gte: start, $lte: end },
            })
                .populate({
                    path: "horario",
                    populate: { path: "deporte", model: "Actividad" },
                })
                .lean();
            const reservasFiltradas = reservas.filter(
                (reserva) =>
                    reserva.horario &&
                    reserva.horario.deporte &&
                    reserva.horario.deporte._id.toString() === deporte
            );
            return NextResponse.json({ ok: true, reservas: reservasFiltradas });
        } catch (error: any) {
            return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
        }
    } else {
        return NextResponse.json(
            { ok: false, error: "Faltan parámetros. Se requiere (estado) o (deporte y fecha)" },
            { status: 400 }
        );
    }
}

export async function POST(request: Request) {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const { horario, fechaTurno, cancha } = await request.json();

    if (!horario || !fechaTurno || !cancha) {
        return NextResponse.json({ ok: false, error: "Faltan campos requeridos (horario, fechaTurno y cancha)" }, { status: 400 });
    }

    try {
        const nuevaReserva = await Reserva.create({
            horario,
            fechaTurno,
            cancha, // ✅ nuevo campo agregado
            nombreCliente: session.user.nombre,
            correoCliente: session.user.documento,
            estado: "pendiente",
        });
        return NextResponse.json({ ok: true, reserva: nuevaReserva }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}