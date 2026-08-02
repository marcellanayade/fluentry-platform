import { auth, currentUser } from "@clerk/nextjs/server";
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Painel de Estudos
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Welcome back, {dbUser.name}!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Remaining Classes */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-blue-800 font-semibold mb-2">Seu Saldo de Aulas</h2>
            <span className="text-5xl font-bold text-blue-600">{dbUser.classBalance}</span>
          </div>

          {/* Class Access (with Security Lock) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-gray-700 font-semibold mb-4">Sala de Aula Virtual</h2>
            
            {/* if the balance is greater than zero, display the Meet button. If not, block it */}
            {dbUser.classBalance > 0 ? (
              <a href="https://meet.google.com/seu-link-aqui" target="_blank" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition">
                Entrar no Google Meet
              </a>
            ) : (
              <p className="text-sm text-red-500 font-medium">
                Você precisa ter saldo de aulas disponível para acessar o link.
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}