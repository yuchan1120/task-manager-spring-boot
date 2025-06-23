import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';


// モックコンポーネント
jest.mock('../src/components/TaskList', () => () => <div>Mock TaskList</div>);
jest.mock('../src/components/LoginForm', () => ({ onLogin }: any) => (
  <button onClick={() => onLogin('mock-token')}>Mock Login</button>
));

describe('App コンポーネント', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('トークンがない場合は LoginForm を表示する', () => {
    render(<App />);
    expect(screen.getByText('Mock Login')).toBeInTheDocument();
  });

  test('ログイン後に TaskList が表示される', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Mock Login'));
    expect(screen.getByText('Mock TaskList')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  test('保存されたトークンがある場合は TaskList を表示する', () => {
    localStorage.setItem('jwt', 'saved-token');
    render(<App />);
    expect(screen.getByText('Mock TaskList')).toBeInTheDocument();
  });

  test('ログアウトボタンを押すとトークンが削除され LoginForm に戻る', () => {
    localStorage.setItem('jwt', 'saved-token');
    render(<App />);
    fireEvent.click(screen.getByText('ログアウト'));
    expect(screen.getByText('Mock Login')).toBeInTheDocument();
    expect(localStorage.getItem('jwt')).toBeNull();
  });
});
