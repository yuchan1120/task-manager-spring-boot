import React from 'react';
import TaskList from './components/TaskList/TaskList';
import './styles/reset.css';
import './styles/variables.css';
import './styles/global.css';

function App() {
  return (
    <div className="app">
      <h1>タスク管理アプリ</h1>
      <TaskList />
    </div>
  );
}

export default App;
