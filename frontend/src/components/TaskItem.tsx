import React from 'react';
import { Task, Tag } from '../types';
import styles from '../styles/TaskList.module.css';

type Props = {
    task: Task;
    tags: Tag[];
    editingTask: Pick<Task, 'id' | 'title' | 'dueDate' | 'tagIds'> | null;
    setEditingTask: React.Dispatch<React.SetStateAction<Pick<Task, 'id' | 'title' | 'dueDate' | 'tagIds'> | null>>;
    handleToggle: (id: number) => void;
    handleDelete: (id: number) => void;
    handleEditClick: (task: Task) => void;
    handleEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDueDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleEditSubmit: (task: Task) => void;
};

const TaskItem: React.FC<Props> = ({
    task,
    tags,
    editingTask,
    setEditingTask,
    handleToggle,
    handleDelete,
    handleEditClick,
    handleEditChange,
    handleDueDateChange,
    handleEditSubmit,
}) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '未設定';
        const date = new Date(dateStr);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    };

    return (
        <li className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}>
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
                            <button
                                onClick={async () => {
                                    if (!editingTask) return;
                                    const updatedTask: Task = {
                                        ...task,
                                        title: editingTask.title,
                                        dueDate: editingTask.dueDate,
                                        tagIds: editingTask.tagIds,
                                    };
                                    await handleEditSubmit(updatedTask);
                                    setEditingTask(null);
                                }}
                            >
                                保存
                            </button>
                            <button onClick={() => setEditingTask(null)}>キャンセル</button>
                        </div>
                    </div>
                ) : (
                    <span className={styles.taskTitle} onClick={() => handleEditClick(task)}>
                        {task.title}
                    </span>
                )}

                <span>{task.description}</span>

                <span className={styles.tagLabel} data-testid="tag-label">
                    タグ: {
                        task.tagIds && task.tagIds.length > 0
                            ? task.tagIds.map(id => tags.find(tag => tag.id === id)?.name || '不明なタグ').join(', ')
                            : 'なし'
                    }
                </span>

                <span className={styles.dueDate} data-testid={`due-date-${task.id}`}>
                    期限: {formatDate(task.dueDate)}
                </span>

                <div className={styles.taskActions}>
                    <button data-testid={`delete-button-${task.id}`} onClick={() => handleDelete(task.id)}>削除</button>
                </div>
            </div>
        </li>
    );
};

export default TaskItem;
