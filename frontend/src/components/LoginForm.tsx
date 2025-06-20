import React, { useState } from 'react';
import { login } from '../api'; // api.ts から login をインポート

interface LoginFormProps {
  onLogin: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }

    try {
      const response = await login(username, password); // api.ts の login を使用
      const token = response.data.token;
      localStorage.setItem('token', token); // api.ts と同じキーに統一
      setError('');
      onLogin(token);
    } catch (err: any) {
      console.error('ログインエラー:', err);
      setError('ログイン失敗：ユーザー名またはパスワードが間違っています');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        placeholder="ユーザー名"
        onKeyDown={handleKeyDown}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleLogin}>ログイン</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
