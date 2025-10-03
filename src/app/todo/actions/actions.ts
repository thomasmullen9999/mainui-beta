"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const update = async (todo: any) => {
  await prisma.todo.update({
    where: {
      id: todo.id,
    },
    data: {
      complete: todo.completed,
    },
  });
  revalidatePath("./");
};

const deleteTodo = async (todo: any) => {
  await prisma.todo.delete({
    where: {
      id: todo.id,
    },
  });
  revalidatePath("./");
};

export { update, deleteTodo };
