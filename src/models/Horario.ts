// models/Horario.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IHorario extends Document {
    deporte: mongoose.Types.ObjectId; // Referencia a la actividad o deporte
    horaInicio: string;
    horaFin: string;
}

const HorarioSchema: Schema = new Schema({
    deporte: {
        type: Schema.Types.ObjectId,
        ref: "Actividad", // O el nombre del modelo que uses para representar deportes o actividades
        required: true,
    },
    horaInicio: {
        type: String,
        required: true,
    },
    horaFin: {
        type: String,
        required: true,
    },
});

export default mongoose.models.Horario || mongoose.model<IHorario>("Horario", HorarioSchema, 'horarios');
