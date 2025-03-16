import Cookies from 'js-cookie';

type AppState = {
  view: 'landing' | 'viewing' | 'editing' | 'creating';
  noteId: string | null;
};

const APP_STATE_COOKIE = 'second_brainer_state';

export const useAppState = () => {
  const saveState = (state: AppState) => {
    Cookies.set(APP_STATE_COOKIE, JSON.stringify(state), { expires: 7 }); // Expires in 7 days
  };

  const loadState = (): AppState | null => {
    const savedState = Cookies.get(APP_STATE_COOKIE);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch {
        return null;
      }
    }
    return null;
  };

  const clearState = () => {
    Cookies.remove(APP_STATE_COOKIE);
  };

  return {
    saveState,
    loadState,
    clearState,
  };
}; 