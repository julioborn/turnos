import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            rol: "admin" | "cliente";
            nombre: string;
            documento: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultSession["user"] {
        id: string;
        rol: "admin" | "cliente";
        nombre: string;
        documento: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        rol: "admin" | "cliente";
        nombre: string;
        documento: string;
    }
}
