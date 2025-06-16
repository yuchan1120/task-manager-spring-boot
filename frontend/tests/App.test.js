import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders タスク管理アプリ heading', () => {
  render(<App />);
  const heading = screen.getByText(/タスク管理アプリ/i);
  expect(heading).toBeInTheDocument();
});
