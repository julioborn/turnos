import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Horario from "@/models/Horario";

export async function GET(request: Request) {
    await connectMongoDB();
    const { searchParams } = new URL(request.url, process.env.NEXTAUTH_URL || "http://localhost:3000");
    const deporte = searchParams.get("deporte");

    if (!deporte) {
        return NextResponse.json({ ok: false, error: "Falta el parámetro deporte" }, { status: 400 });
    }

    try {
        const horarios = await Horario.find({ deporte })
            .lean()
            .sort({ horaInicio: 1 });

        const horariosConDisponibilidad = horarios.map(h => ({
            ...h,
            disponible: h.disponible !== undefined ? h.disponible : true
        }));

        return NextResponse.json({ ok: true, horarios: horariosConDisponibilidad });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await connectMongoDB();

    try {
        const { deporte, horaInicio, horaFin, disponible } = await request.json();

        if (!deporte || !horaInicio || !horaFin) {
            return NextResponse.json(
                { ok: false, error: "Faltan campos obligatorios." },
                { status: 400 }
            );
        }

        const nuevoHorario = await Horario.create({
            deporte,
            horaInicio,
            horaFin,
            disponible: disponible !== undefined ? disponible : true,
        });

        return NextResponse.json({ ok: true, horario: nuevoHorario });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
