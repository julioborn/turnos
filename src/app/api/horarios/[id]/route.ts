import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Horario from "@/models/Horario";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    await connectMongoDB();
    const body = await request.json();
    try {
        const updatedHorario = await Horario.findByIdAndUpdate(params.id, body, { new: true });
        if (!updatedHorario) {
            return NextResponse.json({ ok: false, error: "Horario no encontrado" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, horario: updatedHorario });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await connectMongoDB();
    try {
        const deleted = await Horario.findByIdAndDelete(params.id);
        if (!deleted) {
            return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, message: "Horario eliminado" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
