import "@/models";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import Horario from "@/models/Horario";
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
        return NextResponse.json(
            { ok: false, error: "Faltan campos requeridos (horario, fechaTurno y cancha)" },
            { status: 400 }
        );
    }

    // 🔁 Convertimos fechaTurno en objeto Date local
    const [year, month, day] = fechaTurno.split("-");
    const fechaLocal = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0);

    // 🧠 Obtener el horario para saber a qué deporte pertenece
    const horarioCompleto = await Horario.findById(horario).populate("deporte");
    if (!horarioCompleto) {
        return NextResponse.json({ ok: false, error: "Horario no encontrado" }, { status: 404 });
    }

    const deporteId = horarioCompleto.deporte._id;

    // 📆 Restricción 1: Solo 1 reserva por deporte en el mismo día
    const startOfDay = new Date(fechaLocal);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fechaLocal);
    endOfDay.setHours(23, 59, 59, 999);

    const reservasDelDia = await Reserva.find({
        correoCliente: session.user.documento,
        fechaTurno: { $gte: startOfDay, $lte: endOfDay },
    }).populate({ path: "horario", populate: { path: "deporte" } });

    const yaReservoEseDia = reservasDelDia.some(
        (r) => r.horario?.deporte?._id.toString() === deporteId.toString()
    );

    if (yaReservoEseDia) {
        return NextResponse.json(
            { ok: false, error: "Ya tenés una reserva para este deporte en ese día" },
            { status: 400 }
        );
    }

    // 📅 Restricción 2: Máximo 3 reservas por deporte por semana
    const startOfWeek = new Date(fechaLocal);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const reservasSemana = await Reserva.find({
        correoCliente: session.user.documento,
        fechaTurno: { $gte: startOfWeek, $lte: endOfWeek },
    }).populate({ path: "horario", populate: { path: "deporte" } });

    const cantidadReservasSemana = reservasSemana.filter(
        (r) => r.horario?.deporte?._id.toString() === deporteId.toString()
    ).length;

    if (cantidadReservasSemana >= 3) {
        return NextResponse.json(
            { ok: false, error: "Ya alcanzaste el máximo de 3 reservas para este deporte en la semana" },
            { status: 400 }
        );
    }

    // ✅ Si pasa todas las validaciones, se crea la reserva
    try {
        const nuevaReserva = await Reserva.create({
            horario,
            fechaTurno: fechaLocal,
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