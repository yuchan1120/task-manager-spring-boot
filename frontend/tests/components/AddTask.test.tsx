import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddTask from '../../src/components/AddTask';
import * as api from '../../src/api';

jest.mock('../../src/api', () => ({
    addTask: jest.fn(),
    getTags: jest.fn(),
}));


describe('AddTask コンポーネント', () => {
    const mockOnTaskAdded = jest.fn();


    beforeEach(() => {
        jest.clearAllMocks();
        (api.getTags as jest.Mock).mockResolvedValue({ data: [] });
    });


    test('フォームの初期状態が正しい', () => {
        render(<AddTask onTaskAdded={mockOnTaskAdded} />);
        expect(screen.getByLabelText(/タイトル/i)).toHaveValue('');
        expect(screen.getByLabelText(/説明/i)).toHaveValue('');
        expect(screen.getByRole('button')).toHaveTextContent('追加');
    });

    test('タイトルと説明が空の場合、バリデーションエラーが表示される', async () => {
        render(<AddTask onTaskAdded={mockOnTaskAdded} />);
        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText('タイトルと説明は必須です')).toBeInTheDocument();
        });
    });

    test('タスク追加成功時にフォームがリセットされ、onTaskAdded が呼ばれる', async () => {
        (api.addTask as jest.Mock).mockResolvedValue({});

        render(<AddTask onTaskAdded={mockOnTaskAdded} />);
        fireEvent.change(screen.getByLabelText(/タイトル/i), { target: { value: '新しいタスク' } });
        fireEvent.change(screen.getByLabelText(/説明/i), { target: { value: '説明文' } });
        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(api.addTask).toHaveBeenCalledWith({
                title: '新しいタスク',
                description: '説明文',
                completed: false,
                dueDate: undefined,
                tagIds: [],
            });
            expect(mockOnTaskAdded).toHaveBeenCalled();
            expect(screen.getByLabelText(/タイトル/i)).toHaveValue('');
            expect(screen.getByLabelText(/説明/i)).toHaveValue('');
        });
    });

    test('API 呼び出し失敗時にエラーメッセージが表示される', async () => {
        (api.addTask as jest.Mock).mockRejectedValue(new Error('API Error'));

        render(<AddTask onTaskAdded={mockOnTaskAdded} />);
        fireEvent.change(screen.getByLabelText(/タイトル/i), { target: { value: '失敗タスク' } });
        fireEvent.change(screen.getByLabelText(/説明/i), { target: { value: '失敗説明' } });
        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByText('タスクの追加に失敗しました')).toBeInTheDocument();
        });
    });

    test('期限入力欄が表示され、送信時にAPIに含まれること', async () => {
        (api.getTags as jest.Mock).mockResolvedValue({ data: [] });
        (api.addTask as jest.Mock).mockResolvedValue({ data: {} });

        const onTaskAdded = jest.fn();
        render(<AddTask onTaskAdded={onTaskAdded} />);

        fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: '新しいタスク' } });
        fireEvent.change(screen.getByLabelText(/説明/), { target: { value: '説明文' } });
        fireEvent.change(screen.getByLabelText(/期限/), { target: { value: '2025-06-30' } });

        fireEvent.click(screen.getByText('追加'));

        await waitFor(() => {
            expect(api.addTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: '新しいタスク',
                    description: '説明文',
                    dueDate: '2025-06-30',
                })
            );
        });
    });

    test('タグを選択して送信すると、tagIds が API に渡される', async () => {
        (api.getTags as jest.Mock).mockResolvedValue({
            data: [
                { id: 1, name: '仕事' },
                { id: 2, name: '個人' },
            ],
        });
        (api.addTask as jest.Mock).mockResolvedValue({});

        render(<AddTask onTaskAdded={mockOnTaskAdded} />);

        fireEvent.change(await screen.findByLabelText(/タイトル/), { target: { value: 'タグ付きタスク' } });
        fireEvent.change(screen.getByLabelText(/説明/), { target: { value: 'タグのテスト' } });

        const select = screen.getByLabelText(/タグ/) as HTMLSelectElement;
        const options = screen.getAllByRole('option') as HTMLOptionElement[];

        // 複数選択状態を設定
        options.forEach(option => {
            if (['1', '2'].includes(option.value)) {
                option.selected = true;
            }
        });

        fireEvent.change(select);

        fireEvent.click(screen.getByText('追加'));

        await waitFor(() => {
            expect(api.addTask).toHaveBeenCalledWith(
                expect.objectContaining({
                    tagIds: expect.arrayContaining([1, 2]),
                })
            );
        });
    });

    test('タグの取得に失敗した場合、エラーがコンソールに出力される', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (api.getTags as jest.Mock).mockRejectedValue(new Error('取得失敗'));

        render(<AddTask onTaskAdded={mockOnTaskAdded} />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'タグの取得に失敗しました:',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});
