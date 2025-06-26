import React, { useState, useEffect } from 'react';
import styles from '../styles/AddTask.module.css';
import { addTask, getTags, NewTask, Tag } from '../api';

type AddTaskProps = {
  onTaskAdded: () => void;
};

const AddTask: React.FC<AddTaskProps> = ({ onTaskAdded }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // タグ一覧を取得
  useEffect(() => {

    getTags()
      .then(res => {
        setTags(res.data);
      })
      .catch(err => console.error('タグの取得に失敗しました:', err));
  }, []);

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
        dueDate: dueDate || undefined,
        tagIds: tagIds,
      };
      await addTask(newTask);

      setTitle('');
      setDescription('');
      setDueDate('');
      setTagIds([]);
      onTaskAdded();
    } catch (err) {
      setError('タスクの追加に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
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

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? '追加中...' : '追加'}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default AddTask;
