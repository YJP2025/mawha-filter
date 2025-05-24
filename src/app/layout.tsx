"use client";

import './globals.css';
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden">
        {/* Fondo animado */}
        <div className="fixed inset-0 -z-10 animate-flow bg-gradient-to-br from-black via-[#1a1a2e] to-[#232526]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,140,0,0.15)_0,transparent_70%),radial-gradient(circle_at_80%_80%,rgba(255,69,0,0.12)_0,transparent_70%)] animate-pulse"></div>
        </div>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
