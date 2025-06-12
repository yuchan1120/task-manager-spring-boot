// src/components/AddTask.js
import React, { useState } from 'react';
import axios from 'axios';

function AddTask({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await axios.post('http://localhost:8080/api/tasks', {
        title,
        description,
        completed: false,
      });
      setTitle('');
      setDescription('');
      onTaskAdded(); // 親から渡された一覧更新関数を呼び出す
    } catch (error) {
      console.error('タスクの追加に失敗しました:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">追加</button>
    </form>
  );
}

export default AddTask;
