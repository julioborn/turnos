import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IHorario extends Document {
    deporte: mongoose.Types.ObjectId;
    horaInicio: string;
    horaFin: string;
    disponible: boolean;
}

const HorarioSchema: Schema = new Schema({
    deporte: {
        type: Schema.Types.ObjectId,
        ref: "Actividad",
        required: true,
    },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    disponible: { type: Boolean, default: true },
});

export default models.Horario || model<IHorario>("Horario", HorarioSchema, 'horarios');
