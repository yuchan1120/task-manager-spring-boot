// hooks/useTasks.ts
import { useState, useCallback } from 'react';
import { Task, NewTask } from '../types';
import { deleteTask, getTasks, toggleTask, updateTask, addTask } from '../api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks()
      .then(res => setTasks(res.data))
      .catch(() => setError('タスクの取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddTask = useCallback(async (newTask: NewTask) => {
    await addTask(newTask);
    fetchTasks();
  }, [fetchTasks]);

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

  const handleEditSubmit = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      fetchTasks();
    } catch (err) {
      console.error('編集に失敗しました:', err);
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    handleAddTask,
    handleToggle,
    handleDelete,
    handleEditSubmit,
  };
};
