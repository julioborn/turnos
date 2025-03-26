"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si aún se está cargando la sesión, no hacemos nada.
    if (status === "loading") return;
    // Si no hay sesión, redirige a /login
    if (!session) {
      router.push("/login");
    } else {
      // Redirige según el rol del usuario
      if (session.user.rol === "admin") {
        router.push("/admin");
      } else if (session.user.rol === "cliente") {
        router.push("/client");
      } else {
        // Si el rol no es reconocido, redirige a una ruta por defecto o muestra un error
        router.push("/login");
      }
    }
  }, [session, status, router]);

  return null;
}
