"use client";

import './globals.css'; // Asegúrate que la ruta sea correcta
import { SessionProvider } from "next-auth/react";
import MangaTable from "@/components/MangaTable";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
