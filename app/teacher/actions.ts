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