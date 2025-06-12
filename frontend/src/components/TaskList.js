import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddTask from './AddTask';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = () => {
    axios.get('http://localhost:8080/api/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error('タスクの取得に失敗しました:', error);
      });
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/tasks/${id}/toggle`);
      fetchTasks(); // 状態更新後に再取得
    } catch (error) {
      console.error('完了状態の切り替えに失敗しました:', error);
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
            <strong>{task.title}</strong> - {task.description} [{task.completed ? '完了' : '未完了'}]
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
