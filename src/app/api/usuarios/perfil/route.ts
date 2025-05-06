// app/api/usuarios/perfil/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectMongoDB } from "@/lib/mongodb";
import Usuario from "@/models/Usuario";
import { IUsuario } from "@/models/Usuario"; // Para tipado opcional

export async function GET() {
    await connectMongoDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtenemos el usuario con lean para evitar errores de tipado
    const usuario = await Usuario.findOne({ documento: session.user.documento }).lean() as IUsuario | null;

    if (!usuario) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
        nombre: usuario.nombre,
        documento: usuario.documento,
        telefono: usuario.telefono ?? "",
    });
}

export async function PUT(req: Request) {
    await connectMongoDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { nombre, telefono } = await req.json();

    // Validación básica
    if (!nombre || !telefono) {
        return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const updateResult = await Usuario.updateOne(
        { documento: session.user.documento },
        { $set: { nombre, telefono } }
    );

    if (updateResult.modifiedCount === 0) {
        return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
