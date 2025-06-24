// TaskList.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from '../styles/TaskList.module.css';
import { deleteTask, getTasks, toggleTask, updateTask } from '../api';
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
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks()
      .then(res => setTasks(res.data))
      .catch(err => {
        console.error('タスクの取得に失敗しました:', err);
        setError('タスクの取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesFilter =
        (filter === 'completed' && task.completed) ||
        (filter === 'incomplete' && !task.completed) ||
        filter === 'all';

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, filter, searchQuery]);

  const handleToggle = useCallback(async (id: number) => {
    try {
      await toggleTask(id);
      fetchTasks();
    } catch (err) {
      console.error('完了状態の切り替えに失敗しました:', err);
    }
  }, [fetchTasks]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      console.error('削除に失敗しました:', err);
    }
  }, [fetchTasks]);

  const handleEditClick = (task: Task) => {
    setEditingTask({ id: task.id, title: task.title, dueDate: task.dueDate });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTask(prev => prev ? { ...prev, title: e.target.value } : prev);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTask(prev => prev ? { ...prev, dueDate: e.target.value } : prev);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未設定';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.fixedForm}>
        <AddTask onTaskAdded={fetchTasks} />
      </div>

      <div className={styles.scrollArea}>
        {/* 🔍 検索バー */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="タスクを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* フィルターボタン */}
        <div className={styles.filterButtons}>
          {(['all', 'incomplete', 'completed'] as const).map(type => (
            <button key={type} onClick={() => setFilter(type)} disabled={filter === type}>
              {type === 'all' ? 'すべて' : type === 'incomplete' ? '未完了' : '完了済み'}
            </button>
          ))}
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <ul className={styles.taskList}>
            {filteredAndSortedTasks.map(task => (
              <li key={task.id} className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  className={styles.checkbox}
                  data-testid={`toggle-checkbox-${task.id}`}
                />

                <div className={styles.taskContent}>
                  {editingTask?.id === task.id ? (
                    <div className={styles.editForm}>
                      <input
                        type="text"
                        value={editingTask.title}
                        onChange={handleEditChange}
                        autoFocus
                      />
                      <input
                        type="date"
                        value={editingTask.dueDate?.split('T')[0] || ''}
                        onChange={handleDueDateChange}
                      />
                      <div className={styles.taskActions}>
                        <button onClick={() => handleEditSubmit(task)}>保存</button>
                        <button onClick={() => setEditingTask(null)}>キャンセル</button>
                      </div>
                    </div>
                  ) : (
                    <span
                      className={styles.taskTitle}
                      onClick={() => handleEditClick(task)}
                    >
                      {task.title}
                    </span>
                  )}

                  <span>{task.description}</span>

                  <span className={styles.dueDate} data-testid={`due-date-${task.id}`}>
                    期限: {formatDate(task.dueDate)}
                  </span>

                  <div className={styles.taskActions}>
                    <button
                      data-testid={`delete-button-${task.id}`}
                      onClick={() => handleDelete(task.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskList;
