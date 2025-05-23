// app/login/page.tsx (o donde esté tu login)

"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Cargando...</p>;
  }

  if (session) {
    return <p>Redirigiendo...</p>;
  }

  return (
    <div
      id="login-model"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="border rounded-md w-full max-w-sm mx-1 bg-white p-6 border-violet-600 dark:bg-gray-900 flex flex-col items-center">
        <p className="text-2xl font-bold dark:text-white">Login to Continue</p>
        <p className="dark:text-gray-200">It will take less than 2 minutes</p>

        <div className="mt-6 w-full space-y-3">
          <button
            onClick={() => signIn("google")}
            className="w-full text-center py-2 border flex items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150 dark:text-gray-300 dark:hover:text-white"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-5 h-5 mr-2"
              alt="Google Icon"
            />
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}
