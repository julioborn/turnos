// models/ResetToken.ts
import mongoose, { Schema, Document } from "mongoose";

interface IResetToken extends Document {
    usuarioId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
}

const ResetTokenSchema = new Schema<IResetToken>({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Usuario"
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

export default mongoose.models.ResetToken || mongoose.model<IResetToken>("ResetToken", ResetTokenSchema);
