"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function addClasses(formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseInt(amountStr, 10);

  if (!studentId || isNaN(amount)) {
    return;
  }

  //update balance adding new classes to db
  await prisma.user.update({
    where: { id: studentId },
    data: {
      classBalance: {
        increment: amount,
      },
    },
  });

  //update page 
  revalidatePath("/teacher");
}

//deduct 1 class from student balance
export async function deductClass(formData: FormData) {
  const studentId = formData.get("studentId") as string;

  if (!studentId) {
    return;
  }

  //find student in db to check balance
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  //deduct only if balance is greater than 0
  if (student && student.classBalance > 0) {
    await prisma.user.update({
      where: { id: studentId },
      data: {
        classBalance: {
          decrement: 1,
        },
      },
    });
  }

  //update page
  revalidatePath("/teacher");
}