import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production",
    });

    const { pathname } = req.nextUrl;

    console.log("🔒 Ejecutando middleware para:", pathname);
    console.log("🧾 Token:", token);

    // Si no hay token
    if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/client") || pathname === "/admin/balance")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token) {
        const rol = token.rol;

        // 🔓 SUPERUSUARIO: acceso completo
        if (rol === "superusuario") return NextResponse.next();

        // 🚫 Bloquear acceso a /balance para otros roles
        if (pathname === "/admin/balance") {
            console.log("⛔ ACCESO DENEGADO a /balance para rol:", rol);
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // ✅ ADMIN
        if (
            rol === "admin" &&
            ![
                "/admin",
                "/admin/reservas",
                "/admin/horarios",
                "/admin/historial",
                "/admin/precios",
            ].includes(pathname)
        ) {
            console.log("⛔ ADMIN intentando acceder a ruta no autorizada:", pathname);
            return NextResponse.redirect(new URL("/admin", req.url));
        }

        // ✅ CLIENTE
        if (
            rol === "cliente" &&
            ![
                "/client",
                "/client/mis-reservas",
                "/client/perfil",
                "/client/reservas/padel",
                "/client/reservas/futbol",
                "/client/reservas/voley",
                "/client/reservas/basquet",
            ].includes(pathname)
        ) {
            console.log("⛔ CLIENTE intentando acceder a ruta no autorizada:", pathname);
            return NextResponse.redirect(new URL("/client", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/client/:path*", "/admin/balance"],
};

