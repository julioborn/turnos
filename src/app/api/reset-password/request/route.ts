import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectMongoDB } from "@/lib/mongodb";
import Usuario from "@/models/Usuario";
import ResetToken from "@/models/ResetToken";
import sendEmail from "@/lib/sendEmail";

export async function POST(req: Request) {
    await connectMongoDB();
    const { email } = await req.json();

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        return NextResponse.json({ error: "No se encontró un usuario con ese correo" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await ResetToken.create({
        usuarioId: usuario._id,
        token,
        expiresAt,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset/${token}`;

    await sendEmail({
        to: email,
        subject: "Restablecer contraseña",
        html: `<p>Hacé click en el siguiente enlace para cambiar tu contraseña:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    return NextResponse.json({ ok: true });
}
