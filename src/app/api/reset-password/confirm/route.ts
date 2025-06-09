import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Usuario from "@/models/Usuario";
import ResetToken from "@/models/ResetToken";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    await connectMongoDB();
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
        return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Buscar el token válido en la colección ResetToken
    const resetToken = await ResetToken.findOne({ token });

    if (!resetToken || resetToken.expiresAt < new Date()) {
        return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    // Buscar al usuario asociado
    const usuario = await Usuario.findById(resetToken.usuarioId);
    if (!usuario) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Encriptar la nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    usuario.password = hashed;
    await usuario.save();

    // Eliminar el token después de usarlo
    await ResetToken.deleteOne({ _id: resetToken._id });

    return NextResponse.json({ ok: true });
}
