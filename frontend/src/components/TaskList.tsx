// TaskList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  getTasks,
  toggleTask,
  deleteTask,
  updateTask
} from '../api';
import AddTask from './AddTask';

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Pick<Task, 'id' | 'title'> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // useCallback でメモ化すると、再レンダリング時の無駄な再定義を防げる
  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks()
      .then(response => setTasks(response.data))
      .catch(err => {
        console.error('タスクの取得に失敗しました:', err);
        setError('タスクの取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggle = async (id: number) => {
    try {
      await toggleTask(id);
      fetchTasks();
    } catch (err) {
      console.error('完了状態の切り替えに失敗しました:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error('削除に失敗しました:', err);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask({ id: task.id, title: task.title });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTask(prev => {
      if (prev) {
        return { ...prev, title: e.target.value };
      } else {
        return null;
      }
    });
  };

  const handleEditSubmit = async (task: Task) => {
    if (!editingTask) return;
    try {
      await updateTask(task.id, { ...task, title: editingTask.title });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('編集に失敗しました:', err);
    }
  };

  return (
    <div>
      <h2>タスク一覧</h2>
      <AddTask onTaskAdded={fetchTasks} />
      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
              />
              {editingTask?.id === task.id ? (
                <>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={handleEditChange}
                    onBlur={() => handleEditSubmit(task)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSubmit(task);
                      if (e.key === 'Escape') setEditingTask(null);
                    }}
                    autoFocus
                  />
                  <button onClick={() => setEditingTask(null)}>キャンセル</button>
                </>
              ) : (
                <strong
                  onClick={() => handleEditClick(task)}
                  style={{ cursor: 'pointer' }}
                >
                  {task.title}
                </strong>
              )}
              {' - '}{task.description} [{task.completed ? '完了' : '未完了'}]
              <button onClick={() => handleDelete(task.id)}>削除</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
