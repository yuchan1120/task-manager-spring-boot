import { useMemo } from 'react';
import { Task } from '../types';

export const useFilteredTasks = (
    tasks: Task[],
    filter: 'all' | 'completed' | 'incomplete',
    searchQuery: string,
    selectedTagId: number | null
) => {
    return useMemo(() => {
        const filtered = tasks.filter(task => {
            const matchesTag = selectedTagId === null || task.tagIds?.includes(selectedTagId);
            const matchesFilter =
                (filter === 'completed' && task.completed) ||
                (filter === 'incomplete' && !task.completed) ||
                filter === 'all';
            const matchesSearch =
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesTag && matchesFilter && matchesSearch;
        });

        return filtered.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [tasks, filter, searchQuery, selectedTagId]);
};
