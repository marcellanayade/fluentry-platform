import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { addClasses } from "./actions";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
        <p className="text-gray-600">Você não tem permissão para acessar o painel da professora.</p>
      </div>
    );
  }

  //fetch students registered in db  
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
  });

 return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Painel da Professora
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Gerenciamento de alunos e liberação de saldo de aulas.
        </p>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                <th className="p-4">Nome do Aluno</th>
                <th className="p-4">E-mail</th>
                <th className="p-4 text-center">Saldo de Aulas</th>
                <th className="p-4 text-center">Adicionar Aulas (Pix)</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Nenhum aluno cadastrado ainda. Peça para um aluno fazer login na página inicial!
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{student.name}</td>
                    <td className="p-4 text-gray-600">{student.email}</td>
                    <td className="p-4 text-center font-bold text-blue-600 text-lg">
                      {student.classBalance}
                    </td>
                    <td className="p-4 text-center">
                      {/* form that calls server action */}
                      <form action={addClasses} className="flex items-center justify-center gap-2">
                        <input type="hidden" name="studentId" value={student.id} />
                        <input 
                          type="number" 
                          name="amount" 
                          defaultValue="8" 
                          min="1" 
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm"
                        />
                        <button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                        >
                          Adicionar
                        </button>
                      </form>
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