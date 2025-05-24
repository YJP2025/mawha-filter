"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!session) return null;

  return (
    <div className="absolute top-4 right-6 z-50" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-black/70 rounded-full text-white shadow-lg hover:bg-black/90 transition"
      >
        <FiUser className="w-5 h-5" />
        <span className="hidden sm:inline">{session.user?.name || session.user?.email}</span>
      </button>
      {open && (
        <div className="mt-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[180px] flex flex-col items-start">
          <div className="flex items-center gap-2 mb-3">
            <FiUser className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{session.user?.name || session.user?.email}</span>
          </div>
          <button
            onClick={async () => {
              setOpen(false);
              await signOut({ redirect: false });
              router.push("/");
            }}
            className="flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 rounded transition w-full"
          >
            <FiLogOut className="w-5 h-5" />
            Salir
          </button>
        </div>
      )}
    </div>
  );
}