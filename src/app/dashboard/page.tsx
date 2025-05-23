"use client";

import React, { useState, useEffect } from "react";
import MangaTable from "@/components/MangaTable";

const initialBookmarks = [
  {
    id: "100",
    title: "My Manga Bookmark",
    url: "https://mymangasite.com",
    chapter: "12",
    portrait: "https://mymangasite.com/cover.jpg",
    type: "Manga",
  },
  {
    id: "101",
    title: "Cool Manhwa",
    url: "https://coolmanhwa.com",
    chapter: "45",
    portrait: "https://coolmanhwa.com/cover.jpg",
    type: "Manhwa",
  },
  {
    id: "102",
    title: "Other Link (not manga)",
    url: "https://randomsite.com",
    // no type, no chapter
  },
];

export default function Page() {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [extensionDetected, setExtensionDetected] = useState<null | boolean>(null);

  // Simulación de detección de extensión
  useEffect(() => {
    // Cambia esto por la lógica real de tu extensión, por ejemplo:
    // window.__MY_EXTENSION_INSTALLED__ o window.postMessage, etc.
    if (typeof window !== "undefined" && (window as any).mawhaExtensionInstalled) {
      setExtensionDetected(true);
    } else {
      setExtensionDetected(false);
    }
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Manga Bookmarks</h1>

      {extensionDetected === false && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
          <strong>Extensión NO detectada.</strong> Por favor, instala o activa la extensión para importar tus bookmarks automáticamente.
        </div>
      )}

      {extensionDetected === true && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          <strong>¡Extensión detectada!</strong> Puedes importar tus bookmarks de Google automáticamente.
        </div>
      )}

      <MangaTable bookmarks={bookmarks} />
    </main>
  );
}
