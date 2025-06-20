import React, { useEffect, useState } from 'react';
import TaskList from './components/TaskList';
import LoginForm from './components/LoginForm';
import './styles/reset.css';
import './styles/variables.css';
import './styles/global.css';

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('jwt');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
  };

  return (
    <div className="app">
      <h1>タスク管理アプリ</h1>
      {token ? (
        <>
          <button onClick={handleLogout}>ログアウト</button>
          <TaskList />
        </>
      ) : (
        <LoginForm onLogin={setToken} />
      )}
    </div>
  );
}

export default App;
