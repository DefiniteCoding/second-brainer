
import { useCallback } from 'react';
import { Note } from '@/types/note';

export function useRecentViews(
  recentViews: string[],
  setRecentViews: React.Dispatch<React.SetStateAction<string[]>>,
  getNoteById: (id: string) => Note | undefined
) {
  const addToRecentViews = useCallback((noteId: string) => {
    setRecentViews(prevViews => {
      const filteredViews = prevViews.filter(id => id !== noteId);
      return [noteId, ...filteredViews].slice(0, 10);
    });
  }, [setRecentViews]);

  const getRecentlyViewedNotes = useCallback((): Note[] => {
    return recentViews
      .map(id => getNoteById(id))
      .filter((note): note is Note => note !== undefined);
  }, [recentViews, getNoteById]);

  return {
    addToRecentViews,
    getRecentlyViewedNotes
  };
}
