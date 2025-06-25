import React, { useEffect, useState } from 'react';
import { getTags, addTag, updateTag, deleteTag } from '../api';
import styles from '../styles/TagFilter.module.css';

export type Tag = {
    id: number;
    name: string;
};

type Props = {
    selectedTagId: number | null;
    onSelectTag: (tagId: number | null) => void;
};

const TagFilter: React.FC<Props> = ({ selectedTagId, onSelectTag }) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [editingTagId, setEditingTagId] = useState<number | null>(null);
    const [newTagName, setNewTagName] = useState('');

    const fetchTags = async () => {
        const res = await getTags();
        setTags(res.data);
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;
        await addTag(newTagName);
        setNewTagName('');
        fetchTags();
    };

    const handleUpdateTag = async (id: number, name: string) => {
        await updateTag(id, name);
        setEditingTagId(null);
        fetchTags();
    };

    const handleDeleteTag = async (id: number) => {
        await deleteTag(id);
        fetchTags();
    };

    return (
        <div className={styles.tagFilter}>
            <button onClick={() => onSelectTag(null)} className={!selectedTagId ? styles.active : ''}>
                全タグ
            </button>
            {tags.map(tag => (
                <div
                    key={tag.id}
                    className={`${styles.tagItem} ${selectedTagId === tag.id ? styles.active : ''}`}
                    onClick={() => onSelectTag(tag.id)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        const newName = prompt('タグ名を編集', tag.name);
                        if (newName === null) return;
                        if (newName === '') {
                            if (window.confirm('このタグを削除しますか？')) {
                                handleDeleteTag(tag.id);
                            }
                        } else {
                            handleUpdateTag(tag.id, newName);
                        }
                    }}
                >
                    {tag.name}
                </div>
            ))}
            <div className={styles.addTag}>
                <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="タグ追加"
                />
                <button onClick={handleAddTag}>＋</button>
            </div>
        </div>
    );
};

export default TagFilter;
