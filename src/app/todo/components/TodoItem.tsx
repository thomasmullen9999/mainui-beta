import { useRouter } from "next/navigation";
import { Todo } from "@prisma/client";
import { Item } from "@/app/todo/components/Item1"
export const TodoItem = ({ todos }: { todos: Todo[] }) => {


 
  return (
    <>
      <Item todos={todos}/>
    </>
  );
};