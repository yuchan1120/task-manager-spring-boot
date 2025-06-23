// src/components/LoginForm.tsx
import React, { useState, useContext } from 'react';
import { login } from '../api';
import { AuthContext } from '../AuthContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: loginWithContext } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }

    try {
      const response = await login(username, password);
      const token = response.data.token;
      loginWithContext(token);
      localStorage.setItem('token', token);
      setError('');
    } catch {
      setError('ログイン失敗：ユーザー名またはパスワードが間違っています');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div>
      <h2>ログイン</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ユーザー名"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="パスワード"
      />
      <button onClick={handleLogin}>ログイン</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
