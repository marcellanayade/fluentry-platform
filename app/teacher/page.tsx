import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs"; // <-- Import adicionado aqui
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { addClasses, deductClass } from "./actions";

export default async function TeacherDashboard() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  //check if user is admin/teacher 
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser || dbUser.role !== "TEACHER") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-[url('/bg-fluentry.png')] bg-cover bg-center bg-fixed relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
        <div className="z-10 bg-black/70 p-8 rounded-xl border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">Acesso Negado</h1>
          <p className="text-gray-300">Você não tem permissão para acessar o painel da professora.</p>
        </div>
      </div>
    );
  }

  //fetch students registered in db  
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
  });

 return (
    <div className="min-h-screen bg-black bg-[url('/bg-fluentry.png')] bg-cover bg-center bg-fixed p-8 relative">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto bg-black/60 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.15)] p-8 border border-purple-500/30 backdrop-blur-md relative z-10">
        
        {/* header container putting title and user button side-by-side */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              Painel da Teacher
            </h1>
            <p className="text-gray-300 text-lg">
              Gerenciamento de alunos e liberação de saldo de aulas.
            </p>
          </div>
          
          {/* Avatar / Logout */}
          <div className="bg-black/50 p-1.5 rounded-full border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        
        <div className="border border-purple-500/30 rounded-lg overflow-hidden bg-black/40 mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-900/40 text-purple-200 text-sm border-b border-purple-500/30">
                <th className="p-4">Nome do Aluno</th>
                <th className="p-4">E-mail</th>
                <th className="p-4 text-center">Saldo de Aulas</th>
                <th className="p-4 text-center">Gerenciar Aulas</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Nenhum aluno cadastrado ainda. Peça para um aluno fazer login na página inicial!
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-purple-500/20 hover:bg-purple-800/20 transition-colors duration-200">
                    <td className="p-4 font-medium text-gray-200">{student.name}</td>
                    <td className="p-4 text-gray-400">{student.email}</td>
                    <td className="p-4 text-center font-bold text-purple-400 text-2xl drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                      {student.classBalance}
                    </td>
                    <td className="p-4 text-center">
                      
                      <div className="flex items-center justify-center gap-6">
                        {/* deduct class form */}
                        <form action={deductClass}>
                          <input type="hidden" name="studentId" value={student.id} />
                          <button 
                            type="submit" 
                            disabled={student.classBalance === 0}
                            className="bg-red-600/80 hover:bg-red-500 text-white px-3 py-1.5 rounded text-sm font-bold transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Descontar 1 aula"
                          >
                            -1 
                          </button>
                        </form>

                        <div className="w-px h-8 bg-purple-500/30"></div>

                        {/* add classes form */}
                        <form action={addClasses} className="flex items-center gap-2">
                          <input type="hidden" name="studentId" value={student.id} />
                          <input 
                            type="number" 
                            name="amount" 
                            defaultValue="8" 
                            min="1" 
                            className="w-16 bg-black/50 border border-purple-500/50 rounded px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                          />
                          <button 
                            type="submit" 
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-sm font-medium transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                          >
                            Adicionar
                          </button>
                        </form>
                      </div>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}