import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TodosPage() {
  const supabase = await createClient();

  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test: Todos</h1>
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-4">
          <p className="font-semibold">Note from Supabase:</p>
          <p>{error.message}</p>
          <p className="mt-2 text-xs text-amber-600">
            If you haven&apos;t created a &apos;todos&apos; table in your Supabase SQL editor yet, this error is expected.
          </p>
        </div>
      )}
      <ul className="space-y-2">
        {todos && todos.length > 0 ? (
          todos.map((todo: { id: string | number; name?: string; title?: string }) => (
            <li key={todo.id} className="p-3 bg-slate-50 rounded border border-slate-200">
              {todo.name || todo.title || JSON.stringify(todo)}
            </li>
          ))
        ) : (
          !error && <li className="text-slate-500 italic">No todos found in &apos;todos&apos; table.</li>
        )}
      </ul>
    </div>
  );
}
