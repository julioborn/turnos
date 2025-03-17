import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import Usuario from "@/models/Usuario";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt" as const,
    },
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                documento: {
                    label: "Documento",
                    type: "text",
                    placeholder: "Número de documento",
                },
                password: {
                    label: "Contraseña",
                    type: "password",
                },
            },
            async authorize(credentials) {
                await connectMongoDB();
                const { documento, password } = credentials as { documento: string; password: string };

                // Buscar el usuario en la BD por documento
                const usuario = await Usuario.findOne({ documento });
                if (!usuario) {
                    throw new Error("Usuario no encontrado");
                }

                // Comparar la contraseña
                const isValid = await bcrypt.compare(password, usuario.password);
                if (!isValid) {
                    throw new Error("Contraseña incorrecta");
                }

                // Retornar el usuario (sin contraseña)
                return {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    documento: usuario.documento,
                    rol: usuario.rol,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.rol = user.rol as "admin" | "cliente";
                token.nombre = user.nombre;
                token.documento = user.documento;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.rol = token.rol as "admin" | "cliente";
            session.user.nombre = token.nombre as string;
            session.user.documento = token.documento as string;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
