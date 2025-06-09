// models/Usuario.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUsuario extends Document {
    nombre: string;
    email?: string; // Opcional
    password: string;
    rol: "admin" | "cliente";
    documento: string;
    telefono: string;
    resetToken?: string;
    resetTokenExp?: Date;
}

const UsuarioSchema: Schema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        // Si se desea, se puede configurar para que sea único solo si se proporciona,
        // pero para simplificar lo dejamos sin unique.
    },
    password: {
        type: String,
        required: true,
    },
    rol: {
        type: String,
        enum: ["admin", "cliente", "superusuario"],
        default: "cliente",
    },
    documento: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    resetToken:
    {
        type: String,
        required: false
    },
    resetTokenExp:
    {
        type: Date,
        required: false
    },
});

export default mongoose.models.Usuario || mongoose.model<IUsuario>("Usuario", UsuarioSchema);
