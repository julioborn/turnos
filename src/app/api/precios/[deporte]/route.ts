import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Precio from "@/models/Precio";
import mongoose from "mongoose";

// 🔁 Mapa de nombres de deporte a sus ObjectIds reales
const deporteIds: { [key: string]: string } = {
    padel: "67d1cefbbd7067375f6b33ac",
    futbol: "67d1ce8dbd7067375f6b33a8",
    voley: "67d1ceb0bd7067375f6b33aa",
    basquet: "67d1cea2bd7067375f6b33a9",
};

export async function GET(request: Request, { params }: { params: { deporte: string } }) {
    await connectMongoDB();

    const deporteId = deporteIds[params.deporte];
    if (!deporteId) {
        return NextResponse.json({ error: "Deporte no válido" }, { status: 400 });
    }

    const precio = await Precio.findOne({ deporte: new mongoose.Types.ObjectId(deporteId) });

    if (!precio) return NextResponse.json({ error: "Precio no encontrado" }, { status: 404 });

    return NextResponse.json(precio);
}

export async function PUT(req: Request, { params }: { params: { deporte: string } }) {
    const { precioHora } = await req.json();
    await connectMongoDB();

    const deporteId = deporteIds[params.deporte];
    if (!deporteId) {
        return NextResponse.json({ error: "Deporte no válido" }, { status: 400 });
    }

    const updated = await Precio.findOneAndUpdate(
        { deporte: new mongoose.Types.ObjectId(deporteId) },
        { precioHora },
        { new: true, upsert: true }
    );

    return NextResponse.json(updated);
}
