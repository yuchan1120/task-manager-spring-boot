import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddTask from './AddTask';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  const fetchTasks = () => {
    axios.get('http://localhost:8080/api/tasks')
      .then(response => setTasks(response.data))
      .catch(error => console.error('タスクの取得に失敗しました:', error));
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/tasks/${id}/toggle`);
      fetchTasks();
    } catch (error) {
      console.error('完了状態の切り替えに失敗しました:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('削除に失敗しました:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
  };

  const handleEditChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleEditSubmit = async (task) => {
    try {
      await axios.put(`http://localhost:8080/api/tasks/${task.id}`, {
        ...task,
        title: editedTitle
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error('編集に失敗しました:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h2>タスク一覧</h2>
      <AddTask onTaskAdded={fetchTasks} />
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task.id)}
            />
            {editingTaskId === task.id ? (
              <>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={handleEditChange}
                  onBlur={() => handleEditSubmit(task)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSubmit(task);
                  }}
                  autoFocus
                />
              </>
            ) : (
              <strong onClick={() => handleEditClick(task)} style={{ cursor: 'pointer' }}>
                {task.title}
              </strong>
            )}
            {' - '}{task.description} [{task.completed ? '完了' : '未完了'}]
            <button onClick={() => handleDelete(task.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
