import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Upload,
  User,
  Settings,
  LogOut,
  PlaySquare,
  History,
  ThumbsUp,
  LayoutDashboard,
  Menu,
  X,
  Plus,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync search input with URL if query param exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query");
    if (q) setSearchQuery(q);
  }, [location.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/?query=${encodeURIComponent(q)}`);
    } else {
      navigate("/");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    navigate("/");
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.info("You have been logged out");
    navigate("/login");
  };

  const userAvatar =
    user?.avatar ||
    (user?.username
      ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`
      : null);

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="icon-btn sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="brand-logo-link">
          <div className="brand-badge">
            <PlaySquare size={20} className="brand-icon" />
          </div>
          <span className="brand-name">Vid<span className="brand-accent">Tube</span></span>
        </Link>
      </div>

      <form className="navbar-search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search videos, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="search-submit-btn" aria-label="Search">
          <Search size={18} />
        </button>
      </form>

      <div className="navbar-right">
        <ThemeToggle />

        {user ? (
          <>
            <Link to="/upload" className="btn btn-secondary btn-upload">
              <Plus size={16} />
              <span>Create</span>
            </Link>

            <div className="user-dropdown-container" ref={dropdownRef}>
              <button
                className="user-avatar-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="User menu"
              >
                <img
                  src={userAvatar}
                  alt={user.username}
                  className="avatar avatar-md"
                />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-header">
                    <img
                      src={userAvatar}
                      alt={user.username}
                      className="avatar avatar-md"
                    />
                    <div className="dropdown-user-meta">
                      <div className="dropdown-user-fullname">
                        {user.fullName || user.username}
                      </div>
                      <div className="dropdown-user-handle">@{user.username}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    to={`/channel/${user.username}`}
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>Your Channel</span>
                  </Link>

                  <Link
                    to="/studio"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Creator Studio</span>
                  </Link>

                  <Link
                    to="/history"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <History size={16} />
                    <span>Watch History</span>
                  </Link>

                  <Link
                    to="/liked"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <ThumbsUp size={16} />
                    <span>Liked Videos</span>
                  </Link>

                  <Link
                    to="/playlists"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <PlaySquare size={16} />
                    <span>Playlists</span>
                  </Link>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => toggleTheme()}
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    <span style={{ flex: 1, textAlign: "left" }}>Appearance</span>
                    <span className="dropdown-theme-badge">
                      {isDark ? "Dark" : "Light"}
                    </span>
                  </button>

                  <Link
                    to="/settings"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="row" style={{ gap: 8 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
