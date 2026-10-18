import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ variant = "icon", showLabel = false, className = "" }) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-pill-btn ${className}`}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="theme-pill-icon">
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </span>
        <span className="theme-pill-text">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    );
  }

  if (variant === "switch") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={!isDark}
        onClick={toggleTheme}
        className={`theme-switch-track ${!isDark ? "active-light" : ""} ${className}`}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle dark and light theme"
      >
        <span className="theme-switch-thumb">
          {isDark ? <Moon size={13} /> : <Sun size={13} />}
        </span>
      </button>
    );
  }

  // Default: icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`icon-btn theme-toggle-btn ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className={`theme-icon-wrapper ${isDark ? "is-dark" : "is-light"}`}>
        {isDark ? (
          <Sun size={19} className="theme-icon sun-icon" />
        ) : (
          <Moon size={19} className="theme-icon moon-icon" />
        )}
      </div>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
