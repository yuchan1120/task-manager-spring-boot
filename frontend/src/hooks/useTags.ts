import { useState, useCallback } from 'react';
import { getTags, addTag, updateTag, deleteTag } from '../api';
import { Tag } from '../types';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchTags = useCallback(() => {
    getTags()
      .then(res => setTags(res.data))
      .catch(err => console.error('タグの取得に失敗しました:', err));
  }, []);

  const handleAddTag = useCallback(async (newTagName: string) => {
    if (!newTagName.trim()) return;
    await addTag(newTagName);
    fetchTags();
  }, [fetchTags]);

  const handleUpdateTag = useCallback(async (id: number, newName: string) => {
    await updateTag(id, newName);
    fetchTags();
  }, [fetchTags]);

  const handleDeleteTag = useCallback(async (id: number) => {
    await deleteTag(id);
    fetchTags();
  }, [fetchTags]);

  return { tags, fetchTags, handleAddTag, handleUpdateTag, handleDeleteTag };
};
