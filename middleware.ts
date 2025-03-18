// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    // Obtener el token a partir de la cookie. Asegúrate de tener NEXTAUTH_SECRET definido.
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Si la ruta es para admin, se requiere rol "admin"
    if (pathname.startsWith('/admin')) {
        if (!token || token.rol !== 'admin') {
            // Redirige a login o a la página de acceso no autorizado.
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Si la ruta es para cliente, se requiere rol "cliente"
    if (pathname.startsWith('/client')) {
        if (!token || token.rol !== 'cliente') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Permitir el acceso en caso de que se cumplan las condiciones
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/client/:path*"],
};
