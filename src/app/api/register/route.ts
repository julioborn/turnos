import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Usuario from "../../../models/Usuario";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    await connectMongoDB();

    const { nombre, email, password, documento, telefono } = await request.json();

    // Validación: todos los campos requeridos
    if (!nombre || !email || !password || !documento || !telefono) {
        return NextResponse.json(
            { error: "Faltan campos requeridos (nombre, email, password, documento o teléfono)" },
            { status: 400 }
        );
    }

    // Verificar si el email ya está registrado
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
        return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            password: hashedPassword,
            rol: "cliente",
            documento,
            telefono,
        });

        return NextResponse.json({ ok: true, user: nuevoUsuario }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
