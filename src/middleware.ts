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

    // Si no hay token y se intenta acceder a rutas protegidas
    if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/client"))) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si hay token, validar el acceso por rol
    if (token) {
        const rol = token.rol;

        // SUPERUSUARIO puede acceder a todo lo de admin + rutas exclusivas
        if (rol === "superusuario") {
            return NextResponse.next(); // acceso libre a todas las rutas protegidas
        }

        // ADMIN: acceso solo a rutas administrativas específicas (excluyendo /admin/balance)
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

        // CLIENTE: acceso solo a su panel y rutas de reservas
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
    matcher: ["/admin/:path*", "/client/:path*"],
};
