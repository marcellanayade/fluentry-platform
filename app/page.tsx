import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link"; 

export default async function Home() {
  // is user logged
  const { userId } = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">
        Fluentry Platform
      </h1>

      {/* login based in userId */}
      {userId ? (
        <div className="flex flex-col items-center gap-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center gap-4">
            <p className="text-gray-700 font-medium text-lg">Você está conectado!</p>
            <UserButton afterSignOutUrl="/" />
          </div>
          <Link 
            href="/dashboard" 
            className="w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Acessar meu Painel
          </Link>
        </div>
      ) : (
        <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer">
          <SignInButton mode="modal">
            <span>Entrar na Plataforma</span>
          </SignInButton>
        </div>
      )}
    </main>
  );
}