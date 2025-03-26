import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    await connectMongoDB();
    try {
        // Actualiza el estado de la reserva a "aprobada"
        const updatedReserva = await Reserva.findByIdAndUpdate(
            params.id,
            { estado: "aprobada" },
            { new: true }
        );
        if (!updatedReserva) {
            return NextResponse.json({ ok: false, error: "Reserva no encontrada" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, reserva: updatedReserva });
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
