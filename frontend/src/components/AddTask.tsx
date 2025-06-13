import React, { useState } from 'react';
import { addTask } from '../api';
import type { NewTask } from '../api';

type AddTaskProps = {
  onTaskAdded: () => void;
};

const AddTask: React.FC<AddTaskProps> = ({ onTaskAdded }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('タイトルと説明は必須です');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const newTask: NewTask = {
        title,
        description,
        completed: false,
      };
      await addTask(newTask);
      setTitle('');
      setDescription('');
      onTaskAdded();
    } catch (err) {
      setError('タスクの追加に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        タイトル:
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        説明:
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? '追加中...' : '追加'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default AddTask;
