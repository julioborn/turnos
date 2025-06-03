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
        const horarios = await Horario.aggregate([
            {
                $match: { deporte: new mongoose.Types.ObjectId(deporte) }
            },
            {
                $addFields: {
                    minutosOrdenables: {
                        $cond: {
                            if: {
                                $lte: [
                                    { $toInt: { $substrBytes: ["$horaInicio", 0, 2] } },
                                    4
                                ]
                            },
                            then: {
                                $add: [
                                    1440,
                                    {
                                        $add: [
                                            { $multiply: [{ $toInt: { $substrBytes: ["$horaInicio", 0, 2] } }, 60] },
                                            { $toInt: { $substrBytes: ["$horaInicio", 3, 2] } }
                                        ]
                                    }
                                ]
                            },
                            else: {
                                $add: [
                                    { $multiply: [{ $toInt: { $substrBytes: ["$horaInicio", 0, 2] } }, 60] },
                                    { $toInt: { $substrBytes: ["$horaInicio", 3, 2] } }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $sort: { minutosOrdenables: 1 }
            },
            {
                $project: {
                    _id: 1,
                    deporte: 1,
                    horaInicio: 1,
                    horaFin: 1,
                    disponible: { $ifNull: ["$disponible", true] }
                }
            }
        ]);

        return NextResponse.json({ ok: true, horarios });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await connectMongoDB();

    try {
        const { deporte, horaInicio, horaFin, disponible } = await request.json();

        if (!deporte || !horaInicio || !horaFin) {
            return NextResponse.json(
                { ok: false, error: "Faltan campos obligatorios." },
                { status: 400 }
            );
        }

        // ✅ Verificar si ya existe un horario con el mismo inicio y fin para ese deporte
        const yaExiste = await Horario.findOne({ deporte, horaInicio, horaFin });
        if (yaExiste) {
            return NextResponse.json(
                { ok: false, error: "Ya existe ese horario para este deporte." },
                { status: 409 }
            );
        }

        const nuevoHorario = await Horario.create({
            deporte,
            horaInicio,
            horaFin,
            disponible: disponible !== undefined ? disponible : true,
        });

        return NextResponse.json({ ok: true, horario: nuevoHorario });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}

