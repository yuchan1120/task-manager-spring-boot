import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../../src/components/TaskList/TaskList';
import * as api from '../../src/api';

// モックデータ
const mockTasks = [
  { id: 1, title: 'Task A', description: 'Desc A', completed: false, dueDate: '2025-06-20' },
  { id: 2, title: 'Task B', description: 'Desc B', completed: true, dueDate: '2025-06-18' },
];

// API関数のモック
jest.mock('../../src/api');

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
  });

  describe('タスク一覧の表示とフィルター機能', () => {
    test('タスク一覧が表示される', async () => {
      render(<TaskList />);
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
      });
    });

    test('フィルター機能が動作する', async () => {
      render(<TaskList />);
      await waitFor(() => screen.getByText('Task A'));

      fireEvent.click(screen.getByText('未完了'));
      expect(screen.queryByText('Task B')).not.toBeInTheDocument();
      expect(screen.getByText('Task A')).toBeInTheDocument();

      fireEvent.click(screen.getByText('完了済み'));
      expect(screen.queryByText('Task A')).not.toBeInTheDocument();
      expect(screen.getByText('Task B')).toBeInTheDocument();
    });

    test('フィルター: 「すべて」ボタンをクリックすると全タスクが表示される', async () => {
      (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
      });

      // 「未完了」に切り替えてから「すべて」に戻すことで動作を明確にする
      fireEvent.click(screen.getByText('未完了'));
      expect(screen.getByText('Task A')).toBeInTheDocument();
      expect(screen.queryByText('Task B')).not.toBeInTheDocument();

      // 「すべて」に戻す
      fireEvent.click(screen.getByText('すべて'));

      // 両方のタスクが表示されることを確認
      expect(screen.getByText('Task A')).toBeInTheDocument();
      expect(screen.getByText('Task B')).toBeInTheDocument();
    });

    test('期限が未設定のタスクが「未設定」と表示される', async () => {
      (api.getTasks as jest.Mock).mockResolvedValue({
        data: [{ id: 3, title: 'No Due', description: 'No date', completed: false }]
      });
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByTestId('due-date-3')).toHaveTextContent(/未設定/);
      });
    });

  });

  describe('タスクの操作', () => {
    test('完了状態の切り替えができる', async () => {
      (api.toggleTask as jest.Mock).mockResolvedValue({});
      render(<TaskList />);
      await waitFor(() => screen.getByText('Task A'));

      const checkbox = screen.getByTestId('toggle-checkbox-1');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(api.toggleTask).toHaveBeenCalledWith(1);
      });
    });

    test('完了状態の切り替えに失敗した場合、エラーログが出力される', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      (api.toggleTask as jest.Mock).mockRejectedValue(new Error('Toggle failed'));

      render(<TaskList />);
      const checkbox = await screen.findByTestId('toggle-checkbox-1');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '完了状態の切り替えに失敗しました:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('タスクの削除ができる', async () => {
      (api.deleteTask as jest.Mock).mockResolvedValue({});
      render(<TaskList />);
      await waitFor(() => screen.getByText('Task A'));

      const deleteButton = screen.getByTestId('delete-button-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(api.deleteTask).toHaveBeenCalledWith(1);
      });
    });

    test('タスクの削除に失敗した場合、エラーログが出力される', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      (api.deleteTask as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      render(<TaskList />);
      const deleteButton = await screen.findByTestId('delete-button-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '削除に失敗しました:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('タスクの編集ができる', async () => {
      (api.updateTask as jest.Mock).mockResolvedValue({});
      render(<TaskList />);
      await waitFor(() => screen.getByText('Task A'));

      fireEvent.click(screen.getByText('Task A'));
      const input = screen.getByDisplayValue('Task A');
      fireEvent.change(input, { target: { value: 'Updated Task A' } });

      const dateInput = screen.getByDisplayValue('2025-06-20');
      fireEvent.change(dateInput, { target: { value: '2025-06-25' } });

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() =>
        expect(api.updateTask).toHaveBeenCalledWith(1, {
          id: 1,
          title: 'Updated Task A',
          description: 'Desc A',
          completed: false,
          dueDate: '2025-06-25',
        })
      );
    });

    test('編集をキャンセルする', async () => {
      render(<TaskList />);
      const title = await screen.findByText('Task A');
      fireEvent.click(title);

      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);

      expect(screen.queryByDisplayValue('Task A')).not.toBeInTheDocument();
    });

    test('編集に失敗した場合、エラーログが出力される', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      (api.updateTask as jest.Mock).mockRejectedValue(new Error('Update failed'));

      render(<TaskList />);
      const title = await screen.findByText('Task A');
      fireEvent.click(title);

      const input = screen.getByDisplayValue('Task A');
      fireEvent.change(input, { target: { value: 'Failed Update' } });

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '編集に失敗しました:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('期限の表示とエラーハンドリング', () => {
    test('期限の表示を確認する', async () => {
      render(<TaskList />);

      const dueDate1 = await screen.findByTestId('due-date-1');
      const dueDate2 = await screen.findByTestId('due-date-2');

      expect(dueDate1).toHaveTextContent('2025/6/20');
      expect(dueDate2).toHaveTextContent('2025/6/18');
    });


    test('APIエラー時にエラーメッセージが表示される', async () => {
      (api.getTasks as jest.Mock).mockRejectedValue(new Error('API Error'));
      render(<TaskList />);
      await waitFor(() => {
        expect(screen.getByText('タスクの取得に失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('編集モードの期限入力フィールド', () => {
    test('editingTask.dueDate が存在する場合、日付入力に値が表示される', async () => {
      render(<TaskList />);
      const title = await screen.findByText('Task A');
      fireEvent.click(title);

      const dateInput = screen.getByDisplayValue('2025-06-20');
      expect(dateInput).toBeInTheDocument();
    });

    test('editingTask.dueDate が存在しない場合、日付入力が空になる', async () => {
      (api.getTasks as jest.Mock).mockResolvedValue({
        data: [{ id: 3, title: 'No Due', description: 'No date', completed: false }]
      });

      render(<TaskList />);
      const title = await screen.findByText('No Due');
      fireEvent.click(title);

      // type="date" の input をすべて取得し、空のものを探す
      const dateInputs = screen.getAllByDisplayValue('');
      const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');

      expect(dateInput).toBeInTheDocument();
    });
  });
});
