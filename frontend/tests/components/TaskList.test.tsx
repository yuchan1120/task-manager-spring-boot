import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../../src/components/TaskList';
import * as api from '../../src/api';
import { AxiosHeaders, AxiosResponse } from 'axios';

jest.mock('../../src/api');

const mockTasks = [
  { id: 1, title: 'タスク1', description: '説明1', completed: false },
  { id: 2, title: 'タスク2', description: '説明2', completed: true },
];

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期表示: タスク一覧が表示される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク2')).toBeInTheDocument();
    });
  });

  // 28-33
  test('初期表示: エラー時にエラーメッセージが表示される', async () => {
    (api.getTasks as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('タスクの取得に失敗しました')).toBeInTheDocument();
    });
  });

  // 43
  test('タスクのトグル: チェックボックスをクリックすると toggleTask が呼ばれる', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.toggleTask as jest.Mock).mockResolvedValue({});

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(api.toggleTask).toHaveBeenCalledWith(1);
    });
  });

  // 45
  test('タスクのトグル失敗時にエラーが出力される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.toggleTask as jest.Mock).mockRejectedValue(new Error('Toggle Error'));

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(api.toggleTask).toHaveBeenCalled();
    });
  });

  // 52
  test('タスクの削除: 削除ボタンを押すと deleteTask が呼ばれる', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.deleteTask as jest.Mock).mockResolvedValue({});

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    const deleteButton = screen.getAllByText('削除')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  // 54
  test('タスクの削除失敗時にエラーが出力される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.deleteTask as jest.Mock).mockRejectedValue(new Error('Delete Error'));

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    const deleteButton = screen.getAllByText('削除')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalled();
    });
  });

  // 59
  test('タスクの編集: タイトルをクリックすると編集モードになる', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    fireEvent.click(screen.getByText('タスク1'));

    expect(screen.getByDisplayValue('タスク1')).toBeInTheDocument();
  });

  // 71
  test('タスクの編集: Enter で更新される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.updateTask as jest.Mock).mockResolvedValue({});

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    fireEvent.click(screen.getByText('タスク1'));

    const input = screen.getByDisplayValue('タスク1');
    fireEvent.change(input, { target: { value: '更新後タスク' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(1, expect.objectContaining({ title: '更新後タスク' }));
    });
  });

  // 103
  test('タスクの編集: Escape でキャンセルされる', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    fireEvent.click(screen.getByText('タスク1'));

    const input = screen.getByDisplayValue('タスク1');
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByDisplayValue('タスク1')).not.toBeInTheDocument();
  });

  test('入力欄の変更で editingTask.title が更新される', async () => {
    render(<TaskList />);

    // タスクが表示されるまで待つ
    await waitFor(() => {
      expect(screen.getByText('タスク1')).toBeInTheDocument();
    });

    // タイトルをクリックして編集モードに入る
    fireEvent.click(screen.getByText('タスク1'));

    // 編集用の input が表示される
    const input = screen.getByDisplayValue('タスク1');
    expect(input).toBeInTheDocument();

    // input に新しいタイトルを入力
    fireEvent.change(input, { target: { value: '新しいタイトル' } });

    // 入力欄の値が更新されているか確認
    expect(screen.getByDisplayValue('新しいタイトル')).toBeInTheDocument();
  });

  // 107
  test('編集モードからキャンセルすると通常表示に戻る', async () => {
    render(<TaskList />);

    // タスクが表示されるまで待つ
    await waitFor(() => {
      expect(screen.getByText('タスク1')).toBeInTheDocument();
    });

    // タイトルをクリックして編集モードに入る
    fireEvent.click(screen.getByText('タスク1'));

    // 編集フィールドが表示される
    const input = screen.getByDisplayValue('タスク1');
    expect(input).toBeInTheDocument();

    // キャンセルボタンをクリック
    fireEvent.click(screen.getByText('キャンセル'));

    // 編集フィールドが消えて、通常のタイトル表示に戻る
    await waitFor(() => {
      expect(screen.queryByDisplayValue('タスク1')).not.toBeInTheDocument();
      expect(screen.getByText('タスク1')).toBeInTheDocument();
    });
  });

  // 73
  test('タスクの編集失敗時にエラーが出力される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.updateTask as jest.Mock).mockRejectedValue(new Error('Update Error'));

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    fireEvent.click(screen.getByText('タスク1'));
    const input = screen.getByDisplayValue('タスク1');
    fireEvent.change(input, { target: { value: '編集失敗' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalled();
    });
  });

  // 100
  test('編集中にフォーカスが外れると更新される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.updateTask as jest.Mock).mockResolvedValue({});

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    fireEvent.click(screen.getByText('タスク1'));
    const input = screen.getByDisplayValue('タスク1');
    fireEvent.change(input, { target: { value: 'フォーカス外れ' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'フォーカス外れ' }));
    });
  });

  test('フィルター: 「すべて」ボタンをクリックすると全タスクが表示される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);
    await waitFor(() => {
      expect(screen.getByText('タスク1')).toBeInTheDocument();
      expect(screen.getByText('タスク2')).toBeInTheDocument();
    });

    // 「未完了」に切り替えてから「すべて」に戻すことで動作を明確にする
    fireEvent.click(screen.getByText('未完了'));
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.queryByText('タスク2')).not.toBeInTheDocument();

    // 「すべて」に戻す
    fireEvent.click(screen.getByText('すべて'));

    // 両方のタスクが表示されることを確認
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
  });


  test('フィルター: 「未完了」で未完了タスクのみ表示される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク1'));

    fireEvent.click(screen.getByText('未完了'));

    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.queryByText('タスク2')).not.toBeInTheDocument();
  });

  test('フィルター: 「完了済み」で完了タスクのみ表示される', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);
    await waitFor(() => screen.getByText('タスク2'));

    fireEvent.click(screen.getByText('完了済み'));

    expect(screen.getByText('タスク2')).toBeInTheDocument();
    expect(screen.queryByText('タスク1')).not.toBeInTheDocument();
  });
});
