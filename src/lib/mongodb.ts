import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || ""; // Asegúrate de que está definida en .env.local

if (!MONGODB_URI) {
    throw new Error("⚠️ MONGODB_URI no está definida en las variables de entorno.");
}

export async function connectMongoDB() {
    if (mongoose.connection.readyState >= 1) {
        return; // Ya conectado, evitar conexión redundante
    }

    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: "turnos", // Asegúrate de poner el nombre de tu BD
        });
        console.log("✅ Conectado a MongoDB");
    } catch (error) {
        console.error("🚨 Error al conectar con MongoDB:", error);
    }
}
