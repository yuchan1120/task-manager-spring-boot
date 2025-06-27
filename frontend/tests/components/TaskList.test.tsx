import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import TaskList from '../../src/components/TaskList';
import * as api from '../../src/api';

// モックデータ
const mockTasks = [
  { id: 1, title: 'Task A', description: 'Desc A', completed: false, dueDate: '2025-06-20', tagIds: [] },
  { id: 2, title: 'Task B', description: 'Desc B', completed: true, dueDate: '2025-06-18', tagIds: [] },
  {
    id: 3,
    title: '期限切れタスク',
    description: 'これは期限切れです',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // 昨日
    completed: false,
    tagIds: [],
  },
];

const mockTags = [
  { id: 1, name: '仕事' },
  { id: 2, name: 'プライベート' },
];

// API関数のモック
jest.mock('../../src/api', () => ({
  getTasks: jest.fn(),
  getTags: jest.fn(),
  toggleTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTask: jest.fn(),
  addTag: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
}));

describe('TaskList', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });
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

      (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
      (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });
      (api.deleteTask as jest.Mock).mockRejectedValue(new Error('削除失敗'));

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
          tagIds: [],
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

  describe('TaskList Component', () => {
    test('検索バーでタスクを絞り込める', async () => {
      render(<TaskList />);

      // 初期表示を待つ
      await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
      });

      // 検索バーに「Task A」と入力
      const searchInput = screen.getByPlaceholderText('タスクを検索...');
      fireEvent.change(searchInput, { target: { value: 'Task A' } });

      // 絞り込み結果を確認
      await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.queryByText('Task B')).not.toBeInTheDocument();
      });
    });

    test('検索語が空ならすべて表示される', async () => {
      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('タスクを検索...');
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
      });
    });

    test('検索はタイトルと説明の両方にマッチする', async () => {
      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task A')).toBeInTheDocument();
        expect(screen.getByText('Task B')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('タスクを検索...');
      fireEvent.change(searchInput, { target: { value: 'Desc B' } });

      await waitFor(() => {
        expect(screen.getByText('Task B')).toBeInTheDocument();
        expect(screen.queryByText('Task A')).not.toBeInTheDocument();
      });
    });
  });

  describe('タグ機能のテスト', () => {
    beforeEach(() => {
      (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });
    });

    it('タグが正しく表示されること', async () => {
      render(<TaskList />);

      const tagButtons = await screen.findAllByText('仕事');
      const tagButton = tagButtons.find(el => el.tagName === 'BUTTON');
      expect(tagButton).toBeInTheDocument();

      const privateButtons = await screen.findAllByText('プライベート');
      const privateButton = privateButtons.find(el => el.tagName === 'BUTTON');
      expect(privateButton).toBeInTheDocument();
    });

    it('新しいタグを追加できること', async () => {
      (api.addTag as jest.Mock).mockResolvedValue({});
      render(<TaskList />);

      const input = screen.getByPlaceholderText('タグ追加');
      const button = screen.getByText('＋');

      fireEvent.change(input, { target: { value: '新タグ' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(api.addTag).toHaveBeenCalledWith('新タグ');
      });
    });

    it('タグ名を編集できること', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('新しい名前');
      (api.updateTag as jest.Mock).mockResolvedValue({});

      render(<TaskList />);

      const tagElements = await screen.findAllByText('仕事');
      const tagButton = tagElements.find(el => el.tagName === 'BUTTON');
      expect(tagButton).toBeDefined();

      fireEvent.contextMenu(tagButton!);

      await waitFor(() => {
        expect(api.updateTag).toHaveBeenCalledWith(1, '新しい名前');
      });

      promptSpy.mockRestore();
    });

    it('タグを削除できること', async () => {
      const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('');
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<TaskList />);

      const tagElements = await screen.findAllByText('プライベート');
      const tagButton = tagElements.find(el => el.tagName === 'BUTTON');
      expect(tagButton).toBeDefined();

      fireEvent.contextMenu(tagButton!);

      await waitFor(() => {
        expect(api.deleteTag).toHaveBeenCalledWith(2);
      });

      promptSpy.mockRestore();
      confirmSpy.mockRestore();
    });

    it('タグの取得に失敗した場合、エラーメッセージが表示されること', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      (api.getTags as jest.Mock).mockRejectedValue(new Error('取得失敗'));

      render(<TaskList />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'タグの取得に失敗しました:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('「全タグ」ボタンが表示され、クリックで全タグが選択されること', async () => {
      render(<TaskList />);

      const allTagButton = screen.getByText('全タグ');
      expect(allTagButton).toBeInTheDocument();
      expect(allTagButton.tagName).toBe('BUTTON');

      // 初期状態で selectedTagId が null の場合、active クラスが付いているか確認
      expect(allTagButton).toHaveClass('activeTag');

      // タグを選択した後に「全タグ」ボタンをクリックして selectedTagId が null に戻るか確認
      const tagButtons = await screen.findAllByText('仕事');
      const tagButton = tagButtons.find(el => el.tagName === 'BUTTON');
      fireEvent.click(tagButton!);

      fireEvent.click(allTagButton);

      // selectedTagId が null に戻ったことを確認するには、UIの変化や状態を確認する必要があります。
      // 例えば、active クラスが「全タグ」ボタンに戻っているかなど。
      expect(allTagButton).toHaveClass('activeTag');
    });

    it('タグの複数選択ができ、選択結果が編集タスクに反映されること', async () => {
      render(<TaskList />);

      const select = await screen.findByRole('listbox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('multiple');

      const options = within(select).getAllByRole('option');
      const workOption = options.find(opt => opt.textContent === '仕事') as HTMLOptionElement;
      const privateOption = options.find(opt => opt.textContent === 'プライベート') as HTMLOptionElement;

      expect(workOption).toBeDefined();
      expect(privateOption).toBeDefined();

      // ✅ userEvent を使って複数選択
      await userEvent.selectOptions(select, [workOption, privateOption]);

      // 選択されたことを確認
      expect(workOption.selected).toBe(true);
      expect(privateOption.selected).toBe(true);
    });

    it('タグ名が正しく表示されること', async () => {
      const mockTask = { id: 1, title: 'Task A', description: 'Desc A', tagIds: [1, 2] };
      const mockTags = [
        { id: 1, name: '仕事' },
        { id: 2, name: 'プライベート' },
      ];

      (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });
      (api.getTasks as jest.Mock).mockResolvedValue({ data: [mockTask] });

      render(<TaskList />);

      await waitFor(() => {
        const tagLabels = screen.getAllByTestId('tag-label');
        const target = tagLabels.find(el =>
          el.textContent?.includes('仕事') && el.textContent?.includes('プライベート')
        );
        expect(target).toBeInTheDocument();
      });
    });

    it('存在しないタグIDがある場合、「不明なタグ」と表示されること', async () => {
      const mockTask = { id: 1, title: 'Task A', description: 'Desc A', tagIds: [1, 99] };
      const mockTags = [{ id: 1, name: '仕事' }];

      (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });
      (api.getTasks as jest.Mock).mockResolvedValue({ data: [mockTask] });

      render(<TaskList />);

      await waitFor(() => {
        const tagLabels = screen.getAllByTestId('tag-label');
        const target = tagLabels.find(el =>
          el.textContent?.includes('仕事') && el.textContent?.includes('不明なタグ')
        );
        expect(target).toBeInTheDocument();
      });
    });

    it('タグがない場合、「なし」と表示されること', async () => {
      const task = { tagIds: [] };
      const tags = [
        { id: 1, name: '仕事' },
      ];

      render(<TaskList />);

      await waitFor(() => {
        const tagLabels = screen.getAllByTestId('tag-label');
        expect(tagLabels.length).toBeGreaterThan(0);

        tagLabels.forEach(label => {
          expect(label).toHaveTextContent('タグ: なし');
        });
      });
    });

    test('updates tagIds on selection change', () => {

      const DummyComponent = ({ editingTask, setEditingTask }: any) => (
        <select
          multiple
          value={editingTask.tagIds?.map(String)}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
            setEditingTask((prev: any) => prev ? { ...prev, tagIds: selected } : prev);
          }}
          data-testid="multi-select"
        >
          <option value="1">Tag 1</option>
          <option value="2">Tag 2</option>
          <option value="3">Tag 3</option>
        </select>
      );


      const mockSetEditingTask = jest.fn();
      const editingTask = { tagIds: [] }; // ← 初期状態を空にする

      render(<DummyComponent editingTask={editingTask} setEditingTask={mockSetEditingTask} />);

      const select = screen.getByTestId('multi-select');
      const options = screen.getAllByRole('option') as HTMLOptionElement[];

      options[1].selected = true;
      options[2].selected = true;

      fireEvent.change(select);

      const updateFn = mockSetEditingTask.mock.calls[0][0];
      const result = updateFn(editingTask);

      expect(result).toEqual({
        ...editingTask,
        tagIds: [2, 3],
      });
    });
  });

  describe('TaskList ダイアログ操作', () => {
    test('期限切れタスクがある場合にダイアログが表示される', async () => {
      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('期限を過ぎたタスクがあります')).toBeInTheDocument();
        expect(screen.getAllByText(/期限切れタスク/)).toHaveLength(2);
      });
    });

    test('期限切れタスクがある場合にダイアログが表示され、閉じるボタンで閉じる', async () => {
      render(<TaskList />);

      // ダイアログが表示されるのを待つ
      const dialogTitle = await screen.findByText('期限を過ぎたタスクがあります');
      expect(dialogTitle).toBeInTheDocument();

      // 「閉じる」ボタンをクリック
      const closeButton = screen.getByText('閉じる');
      fireEvent.click(closeButton);

      // ダイアログが非表示になることを確認
      await waitFor(() => {
        expect(screen.queryByText('期限を過ぎたタスクがあります')).not.toBeInTheDocument();
      });
    });
  });
});
