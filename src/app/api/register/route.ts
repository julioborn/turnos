// api/register/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Usuario from "../../../models/Usuario";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    await connectMongoDB();

    const { nombre, email, password, documento, telefono } = await request.json();

    // Verificar que se hayan enviado los campos obligatorios
    if (!nombre || !password || !documento || !telefono) {
        return NextResponse.json(
            { error: "Faltan campos requeridos (nombre, password, documento o teléfono)" },
            { status: 400 }
        );
    }

    // Si se proporciona email y no es una cadena vacía, verificamos que no exista ya un usuario con ese correo
    if (email && email.trim() !== "") {
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
        }
    }

    try {
        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario asignando email solo si se proporcionó
        const nuevoUsuario = await Usuario.create({
            nombre,
            email: email && email.trim() !== "" ? email : undefined,
            password: hashedPassword,
            rol: "cliente", // Por defecto, asignamos el rol "cliente"
            documento,
            telefono,
        });

        return NextResponse.json({ ok: true, user: nuevoUsuario }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
