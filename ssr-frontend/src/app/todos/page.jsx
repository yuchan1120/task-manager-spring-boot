// src/app/todos/page.jsx

async function fetchTodos() {
  const res = await fetch('http://localhost:8080/api/tasks', {
    cache: 'no-store', // SSRで毎回取得
  });

  if (!res.ok) {
    throw new Error('Failed to fetch ToDo list');
  }

  return res.json();
}

export default async function TodosPage() {
  const todos = await fetchTodos();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>ToDo一覧（SSR）</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <strong>{todo.title}</strong> - {todo.completed ? '完了' : '未完了'}
          </li>
        ))}
      </ul>
    </main>
  );
}
