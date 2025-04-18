import "@/models";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";


export async function GET(request: Request) {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url, process.env.NEXTAUTH_URL || "http://localhost:3000");
    const estado = searchParams.get("estado");
    const deporte = searchParams.get("deporte");
    const fecha = searchParams.get("fecha");

    try {
        if (estado) {
            // buscar por estado
            const reservas = await Reserva.find({ estado })
                .populate({ path: "horario", populate: { path: "deporte", model: "Actividad" } })
                .lean();
            return NextResponse.json({ ok: true, reservas });
        }

        if (deporte && fecha) {
            const start = new Date(`${fecha}T00:00:00Z`);
            const end = new Date(`${fecha}T23:59:59.999Z`);

            const reservas = await Reserva.find({
                fechaTurno: { $gte: start, $lte: end }
            })
                .populate({ path: "horario", populate: { path: "deporte", model: "Actividad" } })
                .lean();

            const reservasFiltradas = reservas.filter(
                (reserva) =>
                    reserva.horario?.deporte &&
                    reserva.horario.deporte._id.toString() === deporte
            );

            return NextResponse.json({ ok: true, reservas: reservasFiltradas });
        }

        // 💡 Nueva condición: traer solo las reservas del usuario logueado
        const reservas = await Reserva.find({ correoCliente: session.user.documento })
            .populate({ path: "horario", populate: { path: "deporte", model: "Actividad" } })
            .lean();

        return NextResponse.json({ ok: true, reservas });

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

    const { horario, fechaTurno, cancha } = await request.json();

    if (!horario || !fechaTurno || !cancha) {
        return NextResponse.json({ ok: false, error: "Faltan campos requeridos (horario, fechaTurno y cancha)" }, { status: 400 });
    }

    // 🔥 Esta es la corrección: aseguramos que se cree una fecha local con hora 00:00
    const [year, month, day] = fechaTurno.split("-");
    const fechaLocal = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0); // → hora 00:00 local

    try {
        const nuevaReserva = await Reserva.create({
            horario,
            fechaTurno: fechaLocal, // ahora sí guardamos bien
            cancha,
            nombreCliente: session.user.nombre,
            correoCliente: session.user.documento,
            estado: "pendiente",
        });
        return NextResponse.json({ ok: true, reserva: nuevaReserva }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}