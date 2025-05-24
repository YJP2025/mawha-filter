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
  siteName: string;
  url: string;
}

interface MangaTableProps {
  bookmarks: Bookmark[];
}

// Helper: Extract chapter number from title or URL
function extractChapter(str: string): string {
  // Try to find "ch" or "chapter" followed by a number
  const match = str.match(/(?:ch(?:apter)?\.?\s?)(\d+(\.\d+)?)/i);
  if (match) return match[1];
  // Try to find just a number at the end
  const num = str.match(/(\d+(\.\d+)?)\s*$/);
  if (num) return num[1];
  return "-";
}

// Helper: Clean title (remove chapter info, extra text)
function cleanTitle(str: string): string {
  // Lista ampliada de palabras/sufijos basura
  const blacklist = [
    "night comic", "1st kiss manga", "manga english", "new chapters", "online free",
    "manhwa", "manhua", "manga galaxy", "manga", "toonily.net", "manga tx", "manga online team",
    "nitro scans", "eng-li"
  ];

  // Quita "Manga:" al inicio
  let title = str.replace(/^Manga:\s*/i, "");

  // Quita "Chapter ..." o "Ch ..." y variantes
  title = title.replace(/ch(?:apter)?[^\w\d]*\d+([^\w\d-]\w+)*[^\w\d-]*/gi, "");

  // Quita "Chapter break" y similares
  title = title.replace(/Chapter break/gi, "");

  // Quita todo lo que esté después de un guion o pipe si es basura
  let parts = title.split(/[-|]/);
  // Busca la última parte que NO sea basura
  while (parts.length > 1 && blacklist.some(bad => parts[parts.length - 1].toLowerCase().includes(bad))) {
    parts.pop();
  }
  title = parts.join("-").trim();

  // Quita cualquier basura que quede al final (sin guion)
  blacklist.forEach(bad => {
    const regex = new RegExp(`(${bad})`, "ig");
    title = title.replace(regex, "");
  });

  // Quita números al final
  title = title.replace(/\d+(\.\d+)?$/, "");

  // Quita espacios y guiones al final
  title = title.replace(/[-\s]+$/, "");

  return title.trim();
}

// Helper: Get site name from URL
function getSiteName(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Helper: Detect type by title/url (fallback)
function detectType(bm: Bookmark): string {
  const lowerTitle = bm.title?.toLowerCase() || "";
  const lowerUrl = bm.url?.toLowerCase() || "";
  if (lowerTitle.includes("manhwa") || lowerUrl.includes("webtoons") || lowerUrl.includes("manhwa"))
    return "Manhwa";
  if (lowerTitle.includes("manhua") || lowerUrl.includes("manhua")) return "Manhua";
  if (lowerTitle.includes("manga") || lowerUrl.includes("manga")) return "Manga";
  return "Desconocido";
}

// Helper: Fetch cover and type from Kitsu API (MANGA endpoint)
async function fetchMangaInfo(title: string) {
  try {
    const response = await fetch(
      `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(title)}`
    );
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      // Busca coincidencia exacta en títulos alternativos
      const normalized = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/gi, "");
      const inputNorm = normalized(title);

      let bestMatch = data.data[0];
      for (const info of data.data) {
        const attrs = info.attributes;
        const allTitles = [
          attrs.titles?.en,
          attrs.titles?.en_jp,
          attrs.titles?.ja_jp,
          attrs.canonicalTitle,
          ...(attrs.abbreviatedTitles || []),
        ].filter(Boolean);

        if (allTitles.some((t: string) => normalized(t) === inputNorm)) {
          bestMatch = info;
          break;
        }
      }

      return {
        cover:
          bestMatch.attributes.posterImage?.small ||
          bestMatch.attributes.posterImage?.original ||
          "/default-portrait.jpg",
        type:
          bestMatch.attributes.subtype === "manhwa"
            ? "Manhwa"
            : bestMatch.attributes.subtype === "manhua"
            ? "Manhua"
            : "Manga",
      };
    }
  } catch {}
  return {
    cover: "/default-portrait.jpg",
    type: "Desconocido",
  };
}

// Recursively extract bookmarks
function extractBookmarks(nodes: any[]): Bookmark[] {
  let result: Bookmark[] = [];
  for (const node of nodes) {
    if (typeof node.title === "string" && typeof node.url === "string") {
      result.push(node);
    }
    if (Array.isArray(node.children)) {
      result = result.concat(extractBookmarks(node.children));
    }
  }
  return result;
}

export default function MangaTable({ bookmarks }: MangaTableProps) {
  const [items, setItems] = useState<MangaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function processBookmarks() {
      setLoading(true);
      // Flatten and filter only manga/manhwa/manhua bookmarks
      const allBookmarks = extractBookmarks(bookmarks);
      const realBookmarks = allBookmarks.filter((bm) => {
        const type = detectType(bm);
        return type !== "Desconocido";
      });

      // Agrupa por nombre limpio para buscar el capítulo más alto
      const grouped: Record<string, Bookmark[]> = {};
      for (const bm of realBookmarks) {
        const title = cleanTitle(bm.title);
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push(bm);
      }

      // Para cada bookmark, busca el capítulo más alto si no tiene capítulo en el título
      const promises = realBookmarks.map(async (bm) => {
        const title = cleanTitle(bm.title);
        let chapter = extractChapter(bm.title + " " + bm.url);

        // Si no hay capítulo, busca el mayor entre todos los bookmarks con ese nombre limpio
        if (chapter === "-") {
          let max = "-";
          for (const other of grouped[title]) {
            const ch = extractChapter(other.title + " " + other.url);
            if (ch !== "-") {
              if (max === "-" || parseFloat(ch) > parseFloat(max)) {
                max = ch;
              }
            }
          }
          chapter = max;
        }

        const siteName = getSiteName(bm.url);

        // Fetch cover/type from Kitsu
        const info = await fetchMangaInfo(title);

        return {
          id: bm.id,
          name: title,
          chapter,
          portrait: info.cover,
          site: siteName,
          type: info.type,
          siteName,
          url: bm.url,
        };
      });

      const results = await Promise.all(promises);
      setItems(results);
      setLoading(false);
    }

    if (bookmarks.length > 0) {
      processBookmarks();
    } else {
      setItems([]);
    }
  }, [bookmarks]);

  // Opciones únicas para filtros
  const typeOptions = Array.from(new Set(items.map(i => i.type).filter(Boolean)));
  const siteOptions = Array.from(new Set(items.map(i => i.siteName).filter(Boolean)));

  let filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter ? item.type === typeFilter : true) &&
      (siteFilter ? item.siteName === siteFilter : true) &&
      (chapterFilter ? item.chapter === chapterFilter : true)
  );

  return (
    <div className="py-10 px-2">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-center bg-black/60 rounded-lg p-4 shadow-lg">
        <input
          type="text"
          placeholder="Buscar nombre..."
          className="border border-orange-400 p-2 rounded min-w-[180px] bg-gray-900 text-orange-200 placeholder-orange-400 focus:ring-2 focus:ring-orange-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-orange-400 p-2 rounded bg-gray-900 text-orange-200"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {typeOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          className="border border-orange-400 p-2 rounded bg-gray-900 text-orange-200"
          value={siteFilter}
          onChange={e => setSiteFilter(e.target.value)}
        >
          <option value="">Todos los sitios</option>
          {siteOptions.map(site => (
            <option key={site} value={site}>{site}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Capítulo exacto"
          className="border border-orange-400 p-2 rounded w-36 bg-gray-900 text-orange-200 placeholder-orange-400"
          value={chapterFilter}
          onChange={e => setChapterFilter(e.target.value)}
        />
      </div>
      {/* Total y botón en la misma fila */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="font-semibold text-orange-200 text-center drop-shadow min-w-[120px]">
          {loading ? "Cargando bookmarks..." : `Total: ${filteredItems.length}`}
        </div>
        <button
          type="button"
          onClick={() => window.postMessage({ action: "getBookmarks" }, "*")}
          className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        >
          Cargar Bookmarks
        </button>
      </div>
      <div className="max-w-6xl mx-auto">
        <table className="w-full border-collapse border border-orange-900 text-base bg-black/80 rounded-xl overflow-hidden shadow-2xl">
          <thead>
            <tr className="bg-gradient-to-r from-orange-900 via-orange-700 to-orange-900 text-orange-100">
              <th className="border border-orange-900 p-3">Cover</th>
              <th className="border border-orange-900 p-3">Name</th>
              <th className="border border-orange-900 p-3">Chapter</th>
              <th className="border border-orange-900 p-3">Type</th>
              <th className="border border-orange-900 p-3">Site</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className={`text-center hover:bg-orange-950/60 transition ${
                  item.type === "Desconocido" ? "bg-red-900/60" : ""
                }`}
                title={item.type === "Desconocido" ? "Tipo no detectado" : ""}
              >
                <td className="border border-orange-900 p-2">
                  <img
                    src={item.portrait}
                    alt={item.name}
                    className="mx-auto h-56 w-56 object-cover rounded-lg shadow-lg border-4 border-orange-800" // ancho aumentado
                  />
                </td>
                <td className="border border-orange-900 p-2 text-orange-100 font-bold">{item.name}</td>
                <td className="border border-orange-900 p-2 text-orange-200">{item.chapter}</td>
                <td className="border border-orange-900 p-2 text-orange-300">{item.type}</td>
                <td className="border border-orange-900 p-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline"
                  >
                    {item.siteName}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
