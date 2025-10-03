"use client";
import { update, deleteTodo } from "@/app/todo/actions/actions";
export const Item = ({ todos }: { todos: any[] }) => {
  return (
    <>
      {todos.map((todo) => {
        return (
          <li key={todo.id} className="flex px-4">
            <span className="flex gap-2 flex-1">
              <input
                type="checkbox"
                name="check"
                checked={todo.complete}
                onChange={() => update(todo)}
                className="peer cursor-pointer accent-slate-300 "
              />
              <label
                htmlFor={todo.id}
                className="peer-checked:line-through peer-checked:text-slate-500 cursor-pointer"
              >
                {todo.title} {todo.complete}
              </label>
            </span>
            <button
              onClick={() => deleteTodo(todo)}
              className="text-slate-500  hover:text-slate-800 mr-3"
            >
              X
            </button>
          </li>
        );
      })}
    </>
  );
};
