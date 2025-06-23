// src/App.tsx
import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import LoginForm from './components/LoginForm';
import TaskList from './components/TaskList';
import './styles/global.css';

const AppContent = () => {
  const { isAuthenticated, logout, login } = useContext(AuthContext);


  return (
    <div className="app">
      <h1>タスク管理アプリ</h1>
      {isAuthenticated ? (
        <>
          <button onClick={logout}>ログアウト</button>
          <TaskList />
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
