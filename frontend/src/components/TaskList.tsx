import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from '../styles/TaskList.module.css';
import {
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
  getTags,
  addTag,
  updateTag,
  deleteTag
} from '../api';
import AddTask from './AddTask';

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  tagIds?: number[];
};

type Tag = {
  id: number;
  name: string;
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTask, setEditingTask] = useState<Pick<Task, 'id' | 'title' | 'dueDate' | 'tagIds'> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState<string>('');

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks()
      .then(res => {
        console.log('取得したデータ:', res.data); // ← ここを追加
        setTasks(res.data);
      })
      .catch(err => {
        console.error('タスクの取得に失敗しました:', err);
        setError('タスクの取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchTags = useCallback(() => {
    getTags()
      .then(res => setTags(res.data))
      .catch(err => console.error('タグの取得に失敗しました:', err));
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchTags();
  }, [fetchTasks, fetchTags]);

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesTag =
        selectedTagId === null || task.tagIds?.includes(selectedTagId);

      const matchesFilter =
        (filter === 'completed' && task.completed) ||
        (filter === 'incomplete' && !task.completed) ||
        filter === 'all';

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTag && matchesFilter && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, filter, searchQuery, selectedTagId]);


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
    setEditingTask({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      tagIds: task.tagIds ?? []
    });
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
        title: editingTask.title,
        dueDate: editingTask.dueDate,
        completed: task.completed,
        description: task.description,
        tagIds: editingTask.tagIds
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

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    await addTag(newTagName);
    setNewTagName('');
    fetchTags();
  };

  const handleTagContextMenu = async (e: React.MouseEvent, tag: Tag) => {
    e.preventDefault();
    const newName = prompt('タグ名を編集', tag.name);
    if (newName === null) return;
    if (newName === '') {
      if (window.confirm('このタグを削除しますか？')) {
        await deleteTag(tag.id);
        fetchTags();
      }
    } else {
      await updateTag(tag.id, newName);
      fetchTags();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.fixedForm}>
        <AddTask onTaskAdded={fetchTasks} />
      </div>

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

      {/* タグフィルター */}
      <div className={styles.filterButtons}>
        <button
          onClick={() => setSelectedTagId(null)}
          className={!selectedTagId ? styles.activeTag : ''}
        >
          全タグ
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setSelectedTagId(tag.id)}
            onContextMenu={(e) => handleTagContextMenu(e, tag)}
            className={selectedTagId === tag.id ? styles.activeTag : ''}
          >
            {tag.name}
          </button>
        ))}
        <div className={styles.addTag}>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="タグ追加"
          />
          <button onClick={handleAddTag}>＋</button>
        </div>
      </div>

      <div className={styles.scrollArea}>
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
                      <select
                        multiple
                        value={editingTask.tagIds?.map(String)} 
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                          setEditingTask(prev => prev ? { ...prev, tagIds: selected } : prev);
                        }}
                      >
                        {tags.map(tag => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
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

                  <span className={styles.tagLabel}>
                    タグ: {
                      task.tagIds && task.tagIds.length > 0
                        ? task.tagIds
                          .map(id => tags.find(tag => tag.id === id)?.name || '不明なタグ')
                          .join(', ')
                        : 'なし'
                    }
                  </span>


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
