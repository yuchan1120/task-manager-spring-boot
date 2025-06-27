// hooks/useTasks.test.tsx
import { renderHook, act } from '@testing-library/react';
import { NewTask, Task } from '../../src/types';
import * as api from '../../src/api';
import { useTasks } from '../../src/hooks/useTasks';

jest.mock('../../src/api');

describe('useTasks hook', () => {
    const mockTasks: Task[] = [
        { id: 1, title: 'Test Task 1', description: 'Test Task 1', completed: false },
        { id: 2, title: 'Test Task 2', description: 'Test Task 2', completed: true },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches tasks successfully', async () => {
        (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.fetchTasks();
        });

        expect(result.current.tasks).toEqual(mockTasks);
        expect(result.current.error).toBe('');
        expect(result.current.loading).toBe(false);
    });

    it('handles fetch error', async () => {
        (api.getTasks as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.fetchTasks();
        });

        expect(result.current.error).toBe('タスクの取得に失敗しました');
    });

    it('adds a task and refetches', async () => {
        const newTask: NewTask = {
            title: 'New Task',
            description: '',
            completed: false
        };
        (api.addTask as jest.Mock).mockResolvedValue({});
        (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.handleAddTask(newTask);
        });

        expect(api.addTask).toHaveBeenCalledWith(newTask);
        expect(result.current.tasks).toEqual(mockTasks);
    });

    it('toggles a task and refetches', async () => {
        (api.toggleTask as jest.Mock).mockResolvedValue({});
        (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.handleToggle(1);
        });

        expect(api.toggleTask).toHaveBeenCalledWith(1);
        expect(result.current.tasks).toEqual(mockTasks);
    });

    it('deletes a task and refetches', async () => {
        (api.deleteTask as jest.Mock).mockResolvedValue({});
        (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.handleDelete(1);
        });

        expect(api.deleteTask).toHaveBeenCalledWith(1);
        expect(result.current.tasks).toEqual(mockTasks);
    });

    it('edits a task and refetches', async () => {
        const updatedTask: Task = {
            id: 1, title: 'Updated Task', completed: true,
            description: ''
        };
        (api.updateTask as jest.Mock).mockResolvedValue({});
        (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.handleEditSubmit(updatedTask);
        });

        expect(api.updateTask).toHaveBeenCalledWith(updatedTask.id, updatedTask);
        expect(result.current.tasks).toEqual(mockTasks);
    });

    it('logs error when toggleTask fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (api.toggleTask as jest.Mock).mockRejectedValue(new Error('Toggle failed'));

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.handleToggle(1);
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            '完了状態の切り替えに失敗しました:',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('logs error when deleteTask fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (api.deleteTask as jest.Mock).mockRejectedValue(new Error('Delete failed'));

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.handleDelete(1);
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            '削除に失敗しました:',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('logs error when updateTask fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const updatedTask: Task = {
            id: 1, title: 'Updated Task', completed: true,
            description: ''
        };
        (api.updateTask as jest.Mock).mockRejectedValue(new Error('Update failed'));

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await result.current.handleEditSubmit(updatedTask);
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            '編集に失敗しました:',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
