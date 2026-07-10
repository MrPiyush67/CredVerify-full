import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist((set) => ({
    theme: 'system',
    setTheme: (newTheme) => {
      const isDark =
        newTheme === 'dark' ||
        (newTheme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      document.documentElement.classList.toggle('dark', isDark);
      set({ theme: newTheme });
    },
  }),{
    name: 'theme-storage'
  }),
);
