import React, { useEffect, useState } from 'react';
import styles from '../styles/TaskList.module.css';
import AddTask from './AddTask';
import TaskItem from './TaskItem';
import TaskFilter from './TaskFilter';
import { useTasks } from '../hooks/useTasks';
import { useTags } from '../hooks/useTags';
import { Tag, Task } from '../types';
import { useFilteredTasks } from '../hooks/useFilteredTasks';

const TaskList: React.FC = () => {
  const [editingTask, setEditingTask] = useState<Pick<Task, 'id' | 'title' | 'dueDate' | 'tagIds'> | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [showOverdueDialog, setShowOverdueDialog] = useState(false);

  const {
    tasks,
    loading,
    error,
    fetchTasks,
    handleToggle,
    handleDelete,
    handleEditSubmit,
  } = useTasks();

  const {
    tags,
    fetchTags,
    handleAddTag,
    handleUpdateTag,
    handleDeleteTag,
  } = useTags();

  const filteredTasks = useFilteredTasks(tasks, filter, searchQuery, selectedTagId);

  useEffect(() => {
    fetchTasks();
    fetchTags();
  }, [fetchTasks, fetchTags]);

  useEffect(() => {
    const now = new Date();
    const overdue = tasks.filter(task =>
      task.dueDate && new Date(task.dueDate) < now && !task.completed
    );
    setOverdueTasks(overdue);
    setShowOverdueDialog(overdue.length > 0);
  }, [tasks]);

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

  const handleAddNewTag = async () => {
    await handleAddTag(newTagName);
    setNewTagName('');
  };

  const handleTagContextMenu = async (e: React.MouseEvent, tag: Tag) => {
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

  const renderOverdueDialog = () => (
    <div className={styles.dialog}>
      <h3>期限を過ぎたタスクがあります</h3>
      <ul>
        {overdueTasks.map(task => (
          <li key={task.id}>{task.title}（期限: {task.dueDate}）</li>
        ))}
      </ul>
      <button onClick={() => setShowOverdueDialog(false)}>閉じる</button>
    </div>
  );

  return (
    <div className={styles.container}>
      {showOverdueDialog && renderOverdueDialog()}

      <div className={styles.fixedForm}>
        <AddTask onTaskAdded={fetchTasks} />
      </div>

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
        onAddTag={handleAddNewTag}
        onTagContextMenu={handleTagContextMenu}
      />

      <div className={styles.scrollArea}>
        {loading ? (
          <p>読み込み中...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <ul className={styles.taskList}>
            {filteredTasks.map((task: { id: any; title?: string; description?: string; completed?: boolean; dueDate?: string | undefined; tagIds?: number[] | undefined; }) => (
              <TaskItem
                key={task.id}
                task={{
                  ...task,
                  title: task.title ?? '',
                  description: task.description ?? '',
                  completed: task.completed ?? false,
                  dueDate: task.dueDate ?? '',
                  tagIds: task.tagIds ?? [],
                }}
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
