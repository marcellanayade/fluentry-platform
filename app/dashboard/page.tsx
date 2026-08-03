import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";

export default async function DashboardPage() {
  //check if user is logged in
  const { userId } = await auth();
  
  //if not a user go to login 
  if (!userId) {
    redirect("/");
  }

  //fetch google info about the student 
  const user = await currentUser();

  //try to find student by clerk unique id
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  //if student is not in db, create it 
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user?.primaryEmailAddress?.emailAddress || "",
        name: user?.firstName || "Aluno",
        
      },
    });
  }

  if (dbUser.role === "TEACHER") {
    redirect("/teacher");
  }

  return (
    <div className="min-h-screen bg-black bg-[url('/bg-fluentry.png')] bg-cover bg-center bg-fixed p-8 relative">
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto bg-black/60 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.15)] p-8 border border-purple-500/30 backdrop-blur-md relative z-10">
        
        {/* header container putting title and user button side-by-side */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              Painel de Estudos
            </h1>
            <p className="text-gray-300 text-lg">
              Welcome back, {dbUser.name}!
            </p>
          </div>
          
          <div className="bg-black/50 p-1.5 rounded-full border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Remaining Classes */}
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <h2 className="text-purple-300 font-semibold mb-2">Seu Saldo de Aulas</h2>
            <span className="text-5xl font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">{dbUser.classBalance}</span>
          </div>

          {/* Class Access (with Security Lock) */}
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <h2 className="text-gray-300 font-semibold mb-4">Sala de Aula Virtual</h2>
            
            {/* if the balance is greater than zero, display the Meet button. If not, block it */}
            {dbUser.classBalance > 0 ? (
              <a href="https://meet.google.com/seu-link-aqui" target="_blank" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-[0_0_10px_rgba(34,197,94,0.4)] hover:shadow-[0_0_15px_rgba(34,197,94,0.7)]">
                Entrar no Google Meet
              </a>
            ) : (
              <p className="text-sm text-red-400 font-medium drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]">
                Você precisa ter saldo de aulas disponível para acessar o link.
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}