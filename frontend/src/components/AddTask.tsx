import React, { useState, useEffect } from 'react';
import styles from '../styles/AddTask.module.css';
import { NewTask } from '../types';
import { useTags } from '../hooks/useTags';
import { useTasks } from '../hooks/useTasks';

type AddTaskProps = {
  onTaskAdded: () => void;
};

const AddTask: React.FC<AddTaskProps> = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [error, setError] = useState('');

  const { tags, fetchTags } = useTags();
  const { handleAddTask } = useTasks();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError('タイトルと説明は必須です');
      return;
    }

    setError('');
    try {
      const newTask: NewTask = {
        title,
        description,
        completed: false,
        dueDate: dueDate || undefined,
        tagIds,
      };
      await handleAddTask(newTask);

      setTitle('');
      setDescription('');
      setDueDate('');
      setTagIds([]);
      onTaskAdded();
    } catch (err) {
      setError('タスクの追加に失敗しました');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="title">タイトル</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        className={styles.input}
      />

      <label htmlFor="description">説明</label>
      <input
        id="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="説明"
        className={styles.input}
      />

      <label htmlFor="dueDate">期限</label>
      <input
        id="dueDate"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className={styles.input}
      />

      <label htmlFor="tags">タグ</label>
      <select
        id="tags"
        multiple
        value={tagIds.map(String)}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
          setTagIds(selected);
        }}
        className={styles.input}
      >
        {tags.map(tag => (
          <option key={tag.id} value={String(tag.id)}>
            {tag.name}
          </option>
        ))}
      </select>

      <button type="submit" className={styles.button}>
        追加
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default AddTask;
