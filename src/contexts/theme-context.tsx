import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'auto';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleAutoTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme as Theme;
    }
    // Default to auto mode
    return 'auto';
  });

  const [lastManualTheme, setLastManualTheme] = useState<'light' | 'dark'>(
    () => {
      const savedLastManualTheme = localStorage.getItem('last-manual-theme');
      return (savedLastManualTheme as 'light' | 'dark') || 'dark';
    }
  );


  useEffect(() => {
    const root = window.document.documentElement;

    let effectiveTheme: 'light' | 'dark';
    if (theme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme;
    }

    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = window.document.documentElement;
      const effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  useEffect(() => {
    const updateFavicon = (isDark) => {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (favicon) favicon.href = isDark ? '/favicon-white.svg' : '/favicon-black.svg';
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    updateFavicon(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      updateFavicon(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleAutoTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'auto') {
        // When disabling auto, revert to last manual theme
        return lastManualTheme;
      } else {
        // When enabling auto, save current theme as last manual
        setLastManualTheme(prevTheme);
        return 'auto';
      }
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        toggleAutoTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
