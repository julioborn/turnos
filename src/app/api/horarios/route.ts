import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Horario from "@/models/Horario";
import "@/models/Actividad"; // Importa el modelo de Actividad para registrarlo

export async function GET(request: Request) {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const deporteId = searchParams.get("deporte");

    // Como ya comprobamos, el campo 'deporte' se almacena como ObjectId,
    // pero si tus documentos están guardados como string, usa el valor directamente.
    const query = deporteId ? { deporte: new mongoose.Types.ObjectId(deporteId) } : {};

    try {
        const horarios = await Horario.find(query).populate("deporte").exec();
        return NextResponse.json({ horarios });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
