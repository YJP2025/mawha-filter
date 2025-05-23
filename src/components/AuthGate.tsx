"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Esperar a cargar sesión

    if (!session) {
      router.push("/login"); // Redirigir a login si no autenticado
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-xl dark:text-white">
        Verificando sesión...
      </div>
    );
  }

  if (!session) {
    // Opcional: mientras redirige
    return <p>Redirigiendo al login...</p>;
  }

  return <>{children}</>;
}
