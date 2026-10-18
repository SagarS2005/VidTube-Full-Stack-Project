import { NavLink } from "react-router-dom";
import {
  Home,
  Users2,
  MessageSquare,
  History,
  ThumbsUp,
  ListVideo,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Video
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onCloseMobile }) {
  const { user } = useAuth();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      <aside className={`app-sidebar ${isOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <div className="sidebar-content">
          <div className="sidebar-group">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <Home size={20} className="sidebar-icon" />
              <span className="sidebar-label">Home</span>
            </NavLink>

            <NavLink
              to="/subscriptions"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <Users2 size={20} className="sidebar-icon" />
              <span className="sidebar-label">Subscriptions</span>
            </NavLink>

            <NavLink
              to="/community"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <MessageSquare size={20} className="sidebar-icon" />
              <span className="sidebar-label">Community</span>
            </NavLink>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-group">
            <div className="sidebar-group-title">You</div>

            <NavLink
              to="/history"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <History size={20} className="sidebar-icon" />
              <span className="sidebar-label">History</span>
            </NavLink>

            <NavLink
              to="/liked"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <ThumbsUp size={20} className="sidebar-icon" />
              <span className="sidebar-label">Liked Videos</span>
            </NavLink>

            <NavLink
              to="/playlists"
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <ListVideo size={20} className="sidebar-icon" />
              <span className="sidebar-label">Playlists</span>
            </NavLink>
          </div>

          {user && (
            <>
              <div className="sidebar-divider" />

              <div className="sidebar-group">
                <div className="sidebar-group-title">Creator Hub</div>

                <NavLink
                  to="/studio"
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                  onClick={handleNavClick}
                >
                  <LayoutDashboard size={20} className="sidebar-icon" />
                  <span className="sidebar-label">Creator Studio</span>
                </NavLink>

                <NavLink
                  to="/upload"
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                  onClick={handleNavClick}
                >
                  <Video size={20} className="sidebar-icon" />
                  <span className="sidebar-label">Upload Video</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                  onClick={handleNavClick}
                >
                  <Settings size={20} className="sidebar-icon" />
                  <span className="sidebar-label">Settings</span>
                </NavLink>
              </div>
            </>
          )}

          <div className="sidebar-footer">
            <p className="sidebar-footer-text">
              VidTube © 2026<br />Built for creators & viewers.
            </p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />}
    </>
  );
}
