import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

jest.mock('../src/api', () => ({
  validateToken: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/components/TaskList', () => () => <div>Mock TaskList</div>);
jest.mock('../src/components/LoginForm', () => {
  const React = require('react');
  const { useContext } = React;
  const { AuthContext } = require('../src/AuthContext');
  return {
    __esModule: true,
    default: () => {
      const { login } = useContext(AuthContext);
      return <button onClick={() => login('mock-token')}>Mock Login</button>;
    },
  };
});

test('保存されたトークンがある場合は TaskList を表示する', async () => {
  localStorage.setItem('jwt', 'saved-token');
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Mock TaskList')).toBeInTheDocument();
  });
});
