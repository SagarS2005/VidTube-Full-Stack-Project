import { createContext, useContext, useState, useEffect, useCallback } from "react";

const THEME_STORAGE_KEY = "vidtube_theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // 1. Initial theme detection from localStorage or system preference
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
      }
    } catch {
      // Fallback
    }
    return "dark";
  });

  // 2. Synchronize DOM and storage whenever theme changes
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute("data-theme", theme);
      root.style.colorScheme = theme;
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error("Failed to persist theme", e);
    }
  }, [theme]);

  // 3. Optional listener for system preference change (only if user hasn't manually set one)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e) => {
      // Only auto-update if user hasn't set an explicit preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? "light" : "dark");
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === "dark" || newTheme === "light") {
      setThemeState(newTheme);
    }
  }, []);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
