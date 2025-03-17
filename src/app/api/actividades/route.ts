// app/api/actividades/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Actividad from "@/models/Actividad";

export async function GET(request: Request) {
    await connectMongoDB();
    try {
        const actividades = await Actividad.find().exec();
        return NextResponse.json({ actividades });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await connectMongoDB();
    const { nombre, descripcion } = await request.json();

    if (!nombre) {
        return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    try {
        const nuevaActividad = await Actividad.create({ nombre, descripcion });
        return NextResponse.json({ ok: true, actividad: nuevaActividad }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
