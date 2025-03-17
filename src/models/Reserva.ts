// models/Reserva.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IHorario } from './Horario';

export interface IReserva extends Document {
    horario: mongoose.Types.ObjectId | IHorario; // Referencia a la plantilla de horario
    nombreCliente: string;
    correoCliente: string;
    fechaTurno: Date; // La fecha en que se reserva el turno (no la fecha de creación)
    estado: "pendiente" | "aprobada" | "rechazada" | "completada";
}

const ReservaSchema: Schema = new Schema(
    {
        horario: {
            type: Schema.Types.ObjectId,
            ref: 'Horario',
            required: true,
        },
        nombreCliente: {
            type: String,
            required: true,
        },
        correoCliente: {
            type: String,
            required: true,
        },
        // La fecha del turno reservado (proporcionada por el usuario al hacer la reserva)
        fechaTurno: {
            type: Date,
            required: true,
        },
        // Estado de la reserva, por defecto es "pendiente"
        estado: {
            type: String,
            enum: ["pendiente", "aprobada", "rechazada", "completada"],
            default: "pendiente",
        },
    },
    { timestamps: true } // Agrega createdAt y updatedAt
);

export default mongoose.models.Reserva ||
    mongoose.model<IReserva>('Reserva', ReservaSchema, 'reservas');
