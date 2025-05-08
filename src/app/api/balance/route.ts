import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reserva from "@/models/Reserva";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import "@/models/Horario";
import "@/models/Actividad";

const JUGADORES_POR_DEPORTE: Record<string, number> = {
    padel: 4,
    futbol: 10,
    basquet: 10,
    voley: 8,
};

export async function GET(req: Request) {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.rol !== "superusuario") {
        return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const anio = searchParams.get("anio");
    const mes = searchParams.get("mes");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const query: any = { estado: "aprobada" };

    // 🎯 1. Rango personalizado con fechas ISO
    if (desde && hasta) {
        const start = new Date(desde);
        const end = new Date(hasta);
        end.setHours(23, 59, 59, 999);
        query.fechaTurno = { $gte: start, $lte: end };
    }

    // 🎯 2. Año completo
    else if (anio && (!mes || mes === "0")) {
        const year = parseInt(anio, 10);
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        query.fechaTurno = { $gte: start, $lte: end };
    }

    // 🎯 3. Año + mes específicos
    else if (anio && mes) {
        const year = parseInt(anio, 10);
        const month = parseInt(mes, 10) - 1;
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        query.fechaTurno = { $gte: start, $lte: end };
    }

    const reservas = await Reserva.find(query)
        .populate({ path: "horario", populate: { path: "deporte" } })
        .lean();

    const deportesBalance: Record<string, { total: number }> = {};

    for (const r of reservas) {
        const nombreDeporte = r.horario?.deporte?.nombre?.toLowerCase();
        if (!nombreDeporte || !JUGADORES_POR_DEPORTE[nombreDeporte]) continue;

        const ingreso = (r.precioHora ?? 0) * JUGADORES_POR_DEPORTE[nombreDeporte];

        if (!deportesBalance[nombreDeporte]) {
            deportesBalance[nombreDeporte] = { total: 0 };
        }

        deportesBalance[nombreDeporte].total += ingreso;
    }

    const totalGeneral = Object.values(deportesBalance).reduce((acc, d) => acc + d.total, 0);

    return NextResponse.json({
        ok: true,
        general: { total: totalGeneral },
        deportes: deportesBalance,
    });
}
