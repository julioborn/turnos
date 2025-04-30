import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    await connectMongoDB();

    try {
        const reservaAprobada = await Reserva.findById(params.id);
        if (!reservaAprobada) {
            return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });
        }

        // Aprueba esta reserva
        reservaAprobada.estado = "aprobada";
        await reservaAprobada.save();

        // Rechaza (elimina) las otras reservas del mismo turno (cancha + horario + fecha)
        await Reserva.deleteMany({
            _id: { $ne: reservaAprobada._id },
            horario: reservaAprobada.horario,
            fechaTurno: reservaAprobada.fechaTurno,
            cancha: reservaAprobada.cancha,
            estado: "pendiente",
        });

        return NextResponse.json({ ok: true, reserva: reservaAprobada });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await connectMongoDB();
    try {
        const deleted = await Reserva.findByIdAndDelete(params.id);
        if (!deleted) {
            return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, message: "Reserva eliminada" });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
