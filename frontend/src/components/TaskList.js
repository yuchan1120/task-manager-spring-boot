import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/tasks')
      .then(response => {
        setTasks(response.data);
        console.log(response.data);
        
      })
      .catch(error => {
        console.error('タスクの取得に失敗しました:', error);
      });
  }, []);

  return (
    <div>
      <h2>タスク一覧</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> - {task.description} [{task.completed ? '完了' : '未完了'}]
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
