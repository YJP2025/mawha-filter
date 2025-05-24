"use client";

import React, { useState, useEffect, useCallback } from "react";
import MangaTable from "@/components/MangaTable";
import UserMenu from "@/components/UserMenu"; // Asegúrate de crear este componente

export default function Page() {
  const [bookmarks, setBookmarks] = useState([]);
  const [extensionDetected, setExtensionDetected] = useState<null | boolean>(null);

  // Detecta la extensión
  useEffect(() => {
    let detected = false;
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.action === "mawhaExtensionDetected") {
        detected = true;
        setExtensionDetected(true);
        window.removeEventListener("message", handleMessage);
      }
    }
    window.addEventListener("message", handleMessage);
    window.postMessage({ action: "isMawhaExtensionInstalled" }, "*");
    const timeout = setTimeout(() => {
      if (!detected) setExtensionDetected(false);
      window.removeEventListener("message", handleMessage);
    }, 1000);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Recibe los bookmarks
  useEffect(() => {
    function handleBookmarks(event: MessageEvent) {
      if (event.data && event.data.action === "bookmarksData") {
        setBookmarks(event.data.bookmarks);
      }
    }
    window.addEventListener("message", handleBookmarks);
    return () => window.removeEventListener("message", handleBookmarks);
  }, []);

  // Solicita los bookmarks
  const requestBookmarks = useCallback(() => {
    window.postMessage({ action: "getBookmarks" }, "*");
  }, []);

  return (
    <>
      <UserMenu />
      <main className="p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white text-center">My Manga Bookmarks</h1>
        </div>

        {extensionDetected === false && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded text-center max-w-xl mx-auto">
            <strong>Extensión NO detectada.</strong> Por favor, instala o activa la extensión para importar tus bookmarks automáticamente.
          </div>
        )}

        {extensionDetected === true && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded text-center max-w-xl mx-auto">
            <strong>¡Extensión detectada!</strong> Puedes importar tus bookmarks de Google automáticamente.
          </div>
        )}

        <MangaTable bookmarks={bookmarks} />
      </main>
    </>
  );
}
