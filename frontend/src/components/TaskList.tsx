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
  dueDate?: string; // ISO形式の文字列（例: "2025-06-20"）
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Pick<Task, 'id' | 'title' | 'dueDate'> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all'); // フィルター状態

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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

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
    setEditingTask({ id: task.id, title: task.title, dueDate: task.dueDate });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTask(prev => prev ? { ...prev, title: e.target.value } : prev);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setEditingTask(prev => prev ? { ...prev, dueDate: newDate } : prev);
  };

  const handleEditSubmit = async (task: Task) => {
    if (!editingTask) return;
    try {
      await updateTask(task.id, {
        ...task,
        title: editingTask.title,
        dueDate: editingTask.dueDate
      });
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

      {/* フィルターボタン */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setFilter('all')} disabled={filter === 'all'}>すべて</button>
        <button onClick={() => setFilter('incomplete')} disabled={filter === 'incomplete'}>未完了</button>
        <button onClick={() => setFilter('completed')} disabled={filter === 'completed'}>完了済み</button>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ul>
          {sortedTasks.map(task => (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
                data-testid={`toggle-checkbox-${task.id}`}
              />
              {editingTask?.id === task.id ? (
                <>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={handleEditChange}
                    autoFocus
                  />
                  <input
                    type="date"
                    value={editingTask?.dueDate ? editingTask.dueDate.split('T')[0] : ''}
                    onChange={handleDueDateChange}
                  />
                  <button onClick={() => handleEditSubmit(task)}>保存</button>
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
              {' - '}{task.description}
              {' - 期限: '}
                <span>{task.dueDate ? new Date(task.dueDate).getFullYear() : '未設定'}</span>/
                <span>{task.dueDate ? new Date(task.dueDate).getMonth() + 1 : ''}</span>/
                <span>{task.dueDate ? new Date(task.dueDate).getDate() : ''}</span>
              [{task.completed ? '完了' : '未完了'}]
              <button data-testid={`delete-button-${task.id}`} onClick={() => handleDelete(task.id)}>
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
