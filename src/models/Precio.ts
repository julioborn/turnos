// models/Precio.ts
import mongoose, { Schema } from "mongoose";

const PrecioSchema = new Schema({
    deporte: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Actividad", // asegura que este nombre coincida con tu modelo de actividad
        required: true,
        unique: true,
    },
    precioHora: {
        type: Number,
        required: true,
    },
});

export default mongoose.models.Precio || mongoose.model("Precio", PrecioSchema);
