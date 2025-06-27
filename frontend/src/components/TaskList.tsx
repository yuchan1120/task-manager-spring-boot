import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from '../styles/TaskList.module.css';
import AddTask from './AddTask';
import { Tag, Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { useTags } from '../hooks/useTags';
import TaskItem from './TaskItem';
import TaskFilter from './TaskFilter';

const TaskList: React.FC = () => {
  const [editingTask, setEditingTask] = useState<Pick<Task, 'id' | 'title' | 'dueDate' | 'tagIds'> | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState<string>('');
  const { tasks, loading, error, fetchTasks, handleToggle, handleDelete, handleEditSubmit } = useTasks();
  const { tags, fetchTags, handleAddTag, handleUpdateTag, handleDeleteTag } = useTags();

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

  const handleEditClick = (task: Task) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      tagIds: task.tagIds ?? [],
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTask(prev => prev ? { ...prev, title: e.target.value } : prev);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTask(prev => prev ? { ...prev, dueDate: e.target.value } : prev);
  };

  const onAddTag = async () => {
    await handleAddTag(newTagName);
    setNewTagName('');
  };

  const onTagContextMenu = async (e: React.MouseEvent, tag: Tag) => {
    e.preventDefault();
    const newName = prompt('タグ名を編集', tag.name);
    if (newName === null) return;
    if (newName === '') {
      if (window.confirm('このタグを削除しますか？')) {
        await handleDeleteTag(tag.id);
      }
    } else {
      await handleUpdateTag(tag.id, newName);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.fixedForm}>
        <AddTask onTaskAdded={fetchTasks} />
      </div>

      {/* フィルターUIを分離したコンポーネントに置き換え */}
      <TaskFilter
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTagId={selectedTagId}
        setSelectedTagId={setSelectedTagId}
        tags={tags}
        newTagName={newTagName}
        setNewTagName={setNewTagName}
        onAddTag={onAddTag}
        onTagContextMenu={onTagContextMenu}
      />

      {/* タスク一覧表示 */}
      <div className={styles.scrollArea}>
        {loading ? (
          <p>読み込み中...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <ul className={styles.taskList}>
            {filteredAndSortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                tags={tags}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                handleToggle={handleToggle}
                handleDelete={handleDelete}
                handleEditClick={handleEditClick}
                handleEditChange={handleEditChange}
                handleDueDateChange={handleDueDateChange}
                handleEditSubmit={handleEditSubmit}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );

};

export default TaskList;
