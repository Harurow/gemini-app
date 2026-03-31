import { useEffect } from 'react';
import { useAppStore } from '../store/app-store';

export function useTheme() {
  const settings = useAppStore((s) => s.settings);
  const theme = settings?.theme || 'system';

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => {
        if (media.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      update();
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
  }, [theme]);
}
