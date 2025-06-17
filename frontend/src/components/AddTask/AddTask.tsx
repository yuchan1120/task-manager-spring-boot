// インポート
import React, { useState } from 'react'; // useState: Reactのフックで、状態（state）を管理します。
import { addTask } from '../../api'; // addTask: タスクを追加するAPI関数。
import type { NewTask } from '../../api'; // NewTask: 新しいタスクの型定義（TypeScriptの型）。
import styles from './AddTask.module.css'

// Propsの型定義
type AddTaskProps = {
  onTaskAdded: () => void; // onTaskAdded: タスク追加後に呼び出されるコールバック関数（親コンポーネントに通知するため）。
};

// コンポーネント本体
// React.FC<AddTaskProps>: 関数コンポーネントで、AddTaskProps 型のpropsを受け取る。
const AddTask: React.FC<AddTaskProps> = ({ onTaskAdded }) => {
  // 状態管理
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // フォーム送信後にページがリロードされてしまい、入力内容が消えたり、Reactの状態がリセットされ
    e.preventDefault();
    // 入力チェック
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
        dueDate: dueDate || undefined, // 空文字は送らないように
      };
      // API呼び出し
      await addTask(newTask);
      // フォームをリセット
      setTitle('');
      setDescription('');
      setDueDate('');
      // 親に通知
      onTaskAdded();
    } catch (err) {
      // エラー処理
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

      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? '追加中...' : '追加'}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default AddTask;
