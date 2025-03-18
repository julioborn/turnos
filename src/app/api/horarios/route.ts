// app/api/horarios/route.ts
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
        // Convertir el string a ObjectId
        const horarios = await Horario.find({
            deporte: new mongoose.Types.ObjectId(deporte),
        }).lean();
        return NextResponse.json({ ok: true, horarios });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
