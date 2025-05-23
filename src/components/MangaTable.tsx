"use client";

import React, { useState, useEffect } from "react";

interface MangaItem {
  id: string;
  name: string;
  chapter: string;
  portrait: string;
  site: string; // Aquí asumimos que es el link
  type: string;
}

export default function MangaTable() {
  const [items, setItems] = useState<MangaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Ejemplo de datos
  const data: MangaItem[] = [
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

  useEffect(() => {
    setItems(data);
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshData = () => {
    setItems(data);
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
            <tr key={item.id} className="text-center hover:bg-gray-100">
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
