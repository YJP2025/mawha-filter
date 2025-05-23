"use client";

import React, { useState, useEffect } from "react";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  chapter?: string;
  portrait?: string;
  type?: string;
}

interface MangaItem {
  id: string;
  name: string;
  chapter: string;
  portrait: string;
  site: string;
  type: string;
}

interface MangaTableProps {
  bookmarks: Bookmark[];
}

export default function MangaTable({ bookmarks }: MangaTableProps) {
  const [items, setItems] = useState<MangaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [extensionDetected, setExtensionDetected] = useState(false);

  // Mueve la detección de la extensión aquí
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).mawhaExtensionInstalled) {
      setExtensionDetected(true);
    } else {
      setExtensionDetected(false);
    }
  }, []);

  // Datos de ejemplo estáticos para cuando no haya bookmarks
  const defaultData: MangaItem[] = [
    {
      id: "1",
      name: "Attack on Titan",
      chapter: "139",
      portrait: "https://cdn.manga.com/aot.jpg",
      site: "https://mangaplus.shueisha.co.jp/",
      type: "Manga",
    },
    {
      id: "2",
      name: "Solo Leveling",
      chapter: "179",
      portrait: "https://cdn.manga.com/solo.jpg",
      site: "https://www.webtoons.com/en/fantasy/solo-leveling/list?title_no=2699",
      type: "Manhwa",
    },
  ];

  // Función para intentar detectar el tipo por url o título
  const detectType = (bm: Bookmark) => {
    if (bm.type) return bm.type; // Ya definido

    const lowerTitle = bm.title.toLowerCase();
    const lowerUrl = bm.url.toLowerCase();

    if (lowerTitle.includes("manga") || lowerUrl.includes("manga")) return "Manga";
    if (lowerTitle.includes("manhwa") || lowerUrl.includes("webtoons") || lowerUrl.includes("manhwa"))
      return "Manhwa";
    if (lowerTitle.includes("manhua") || lowerUrl.includes("manhua")) return "Manhua";

    return "Desconocido";
  };

  useEffect(() => {
    if (bookmarks.length === 0) {
      setItems(defaultData);
    } else {
      const transformed = bookmarks.map((bm) => {
        const typeDetected = detectType(bm);
        if (typeDetected === "Desconocido") {
          console.warn(`No se detectó tipo para: ${bm.title} (${bm.url})`);
        } else {
          console.info(`Tipo detectado para ${bm.title}: ${typeDetected}`);
        }

        return {
          id: bm.id,
          name: bm.title,
          chapter: bm.chapter ?? "-",
          portrait: bm.portrait ?? "/default-portrait.jpg",
          site: bm.url,
          type: typeDetected,
        };
      });
      setItems(transformed);
    }
  }, [bookmarks]);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshData = () => {
    if (bookmarks.length === 0) {
      setItems(defaultData);
    }
  };

  return (
    <div>
      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={refreshData}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Portrait</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Chapter</th>
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Site</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr
              key={item.id}
              className={`text-center hover:bg-gray-100 ${
                item.type === "Desconocido" ? "bg-red-100" : ""
              }`}
              title={item.type === "Desconocido" ? "Tipo no detectado" : ""}
            >
              <td className="border border-gray-300 p-2">
                <img
                  src={item.portrait}
                  alt={item.name}
                  className="mx-auto h-20 w-14 object-cover"
                />
              </td>
              <td className="border border-gray-300 p-2">{item.name}</td>
              <td className="border border-gray-300 p-2">{item.chapter}</td>
              <td className="border border-gray-300 p-2">{item.type}</td>
              <td className="border border-gray-300 p-2">
                <a
                  href={item.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {item.site}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const contentScripts = [
  {
    matches: ["<all_urls>"],
    js: ["content-script.js"],
    run_at: "document_start",
  },
];
