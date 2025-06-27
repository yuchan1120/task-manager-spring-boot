import { renderHook, act } from '@testing-library/react';
import { Tag } from '../../src/types';
import { useTags } from '../../src/hooks/useTags';
import * as api from '../../src/api';

jest.mock('../../src/api');

const mockTags: Tag[] = [
  { id: 1, name: 'React' },
  { id: 2, name: 'TypeScript' },
];

describe('useTags hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches tags correctly', async () => {
    (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });

    const { result } = renderHook(() => useTags());

    await act(async () => {
      await result.current.fetchTags();
    });

    expect(api.getTags).toHaveBeenCalled();
    expect(result.current.tags).toEqual(mockTags);
  });

  it('adds a new tag and refreshes the list', async () => {
    (api.addTag as jest.Mock).mockResolvedValue({});
    (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });

    const { result } = renderHook(() => useTags());

    await act(async () => {
      await result.current.handleAddTag('NewTag');
    });

    expect(api.addTag).toHaveBeenCalledWith('NewTag');
    expect(api.getTags).toHaveBeenCalled();
  });

  it('updates a tag and refreshes the list', async () => {
    (api.updateTag as jest.Mock).mockResolvedValue({});
    (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });

    const { result } = renderHook(() => useTags());

    await act(async () => {
      await result.current.handleUpdateTag(1, 'UpdatedTag');
    });

    expect(api.updateTag).toHaveBeenCalledWith(1, 'UpdatedTag');
    expect(api.getTags).toHaveBeenCalled();
  });

  it('deletes a tag and refreshes the list', async () => {
    (api.deleteTag as jest.Mock).mockResolvedValue({});
    (api.getTags as jest.Mock).mockResolvedValue({ data: mockTags });

    const { result } = renderHook(() => useTags());

    await act(async () => {
      await result.current.handleDeleteTag(1);
    });

    expect(api.deleteTag).toHaveBeenCalledWith(1);
    expect(api.getTags).toHaveBeenCalled();
  });

  it('does not add empty tag', async () => {
    const { result } = renderHook(() => useTags());

    await act(async () => {
      await result.current.handleAddTag('   ');
    });

    expect(api.addTag).not.toHaveBeenCalled();
  });
});
