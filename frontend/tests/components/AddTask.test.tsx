import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddTask from '../../src/components/AddTask';
import * as api from '../../src/api';

jest.mock('../../src/api');

describe('AddTask コンポーネント', () => {
    const mockOnTaskAdded = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
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
});
