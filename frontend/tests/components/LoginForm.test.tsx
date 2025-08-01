// tests/components/LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../../src/components/LoginForm';
import { login } from '../../src/api';
import { AuthContext } from '../../src/AuthContext';

jest.mock('../../src/api', () => ({
  login: jest.fn(),
}));

describe('LoginForm コンポーネント', () => {
  const mockLoginWithContext = jest.fn();

  const mockAuthContextValue = {
    login: mockLoginWithContext,
    logout: jest.fn(),
    authToken: null,
    isAuthenticated: false,
  };

  const renderWithContext = () =>
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <LoginForm />
      </AuthContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('ユーザー名とパスワードが未入力の場合、エラーメッセージを表示する', async () => {
    renderWithContext();
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(await screen.findByText('ユーザー名とパスワードを入力してください')).toBeInTheDocument();
  });

  test('ログイン成功時に loginWithContext が呼ばれ、トークンが保存される', async () => {
    (login as jest.Mock).mockResolvedValue({ data: { token: 'mock-token' } });

    renderWithContext();
    fireEvent.change(screen.getByPlaceholderText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockLoginWithContext).toHaveBeenCalledWith('mock-token');
      expect(localStorage.getItem('token')).toBe('mock-token');
    });
  });

  test('ログイン失敗時にエラーメッセージを表示する', async () => {
    (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    renderWithContext();
    fireEvent.change(screen.getByPlaceholderText('ユーザー名'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(await screen.findByText('ログイン失敗：ユーザー名またはパスワードが間違っています')).toBeInTheDocument();
  });

  test('Enterキーでログイン処理が実行される', async () => {
    (login as jest.Mock).mockResolvedValue({ data: { token: 'mock-token' } });

    renderWithContext();
    fireEvent.change(screen.getByPlaceholderText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('パスワード'), { target: { value: 'password' } });

    fireEvent.keyDown(screen.getByPlaceholderText('パスワード'), { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockLoginWithContext).toHaveBeenCalledWith('mock-token');
      expect(localStorage.getItem('token')).toBe('mock-token');
    });
  });
});
