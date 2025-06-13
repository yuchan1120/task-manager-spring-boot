import React, { useState } from 'react';
import { addTask } from '../api';

function AddTask({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('タイトルと説明は必須です');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await addTask({ title, description, completed: false });
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
}

export default AddTask;
