import mongoose, { Schema, Document } from "mongoose";

export interface IReserva extends Document {
    horario: mongoose.Types.ObjectId;
    nombreCliente: string;
    correoCliente: string;
    fechaTurno: Date;
    estado: "pendiente" | "aprobada" | "rechazada";
    createdAt: Date;
    updatedAt: Date;
}

const ReservaSchema: Schema = new Schema(
    {
        horario: {
            type: Schema.Types.ObjectId,
            ref: "Horario", // 🔥 Asegúrate de que coincide con el modelo de horarios
            required: true,
        },
        nombreCliente: { type: String, required: true },
        correoCliente: { type: String, required: true },
        fechaTurno: { type: Date, required: true },
        estado: {
            type: String,
            enum: ["pendiente", "aprobada", "rechazada"],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Reserva || mongoose.model<IReserva>("Reserva", ReservaSchema);
