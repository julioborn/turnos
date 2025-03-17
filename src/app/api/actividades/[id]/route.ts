import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Actividad from "@/models/Actividad";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    await connectMongoDB();
    const body = await request.json();
    try {
        const updatedActividad = await Actividad.findByIdAndUpdate(params.id, body, { new: true });
        if (!updatedActividad) {
            return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, actividad: updatedActividad });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await connectMongoDB();
    try {
        const deleted = await Actividad.findByIdAndDelete(params.id);
        if (!deleted) {
            return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, message: "Actividad eliminada" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
