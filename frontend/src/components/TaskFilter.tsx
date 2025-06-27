// components/TaskFilter.tsx
import React from 'react';
import styles from '../styles/TaskList.module.css';
import { Tag } from '../types';

type Props = {
    filter: 'all' | 'completed' | 'incomplete';
    setFilter: (filter: 'all' | 'completed' | 'incomplete') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedTagId: number | null;
    setSelectedTagId: (id: number | null) => void;
    tags: Tag[];
    newTagName: string;
    setNewTagName: (name: string) => void;
    onAddTag: () => void;
    onTagContextMenu: (e: React.MouseEvent, tag: Tag) => void;
};

const TaskFilter: React.FC<Props> = ({
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedTagId,
    setSelectedTagId,
    tags,
    newTagName,
    setNewTagName,
    onAddTag,
    onTagContextMenu,
}) => {
    return (
        <>
            {/* 🔍 検索バー */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="タスクを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* フィルターボタン */}
            <div className={styles.filterButtons}>
                {(['all', 'incomplete', 'completed'] as const).map(type => (
                    <button key={type} onClick={() => setFilter(type)} disabled={filter === type}>
                        {type === 'all' ? 'すべて' : type === 'incomplete' ? '未完了' : '完了済み'}
                    </button>
                ))}
            </div>

            {/* タグフィルター */}
            <div className={styles.filterButtons}>
                <button
                    onClick={() => setSelectedTagId(null)}
                    className={!selectedTagId ? styles.activeTag : ''}
                >
                    全タグ
                </button>
                {tags.map(tag => (
                    <button
                        key={tag.id}
                        onClick={() => setSelectedTagId(tag.id)}
                        onContextMenu={(e) => onTagContextMenu(e, tag)}
                        className={selectedTagId === tag.id ? styles.activeTag : ''}
                    >
                        {tag.name}
                    </button>
                ))}
                <div className={styles.addTag}>
                    <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="タグ追加"
                    />
                    <button onClick={onAddTag}>＋</button>
                </div>
            </div>
        </>
    );
};

export default TaskFilter;
