import { NewTodo } from "@/app/todo/components/NewTodo";
import { TodoItem } from "@/app/todo/components/TodoItem";
import { prisma } from "@/lib/prisma";

export default async function Todo() {
  const todos = await prisma.todo.findMany();

  return (
    <main className=" flex flex-col min-h-screen justify-center items-center bg-slate-50 relative ">
      <div className="absolute top-4 left-16">
        <div className=" relative py-4 space-x-6"></div>
      </div>
      <div className="bg-slate-300 rounded-3xl py-6  h-[400px] w-[450px] flex flex-col text-slate-800">
        <h1 className="text-3xl text-center">My to dos</h1>
        <NewTodo />
        <ul className="px-6">
          <TodoItem todos={todos} />
        </ul>
      </div>
    </main>
  );
}
