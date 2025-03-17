import mongoose, { Schema, Document } from "mongoose";

export interface IActividad extends Document {
    nombre: string;
}

const ActividadSchema: Schema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
});

export default mongoose.models.Actividad || mongoose.model<IActividad>("Actividad", ActividadSchema, 'actividades');
