import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Channel from "./pages/Channel";
import Community from "./pages/Community";
import PlaylistDetail from "./pages/PlaylistDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Upload from "./pages/Upload";
import Studio from "./pages/Studio";
import History from "./pages/History";
import LikedVideos from "./pages/LikedVideos";
import Subscriptions from "./pages/Subscriptions";
import Playlists from "./pages/Playlists";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Pages without layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main App Layout */}
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/watch/:videoId" element={<Watch />} />
              <Route path="/channel/:username" element={<Channel />} />
              <Route path="/community" element={<Community />} />
              <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/upload" element={<Upload />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/history" element={<History />} />
                <Route path="/liked" element={<LikedVideos />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
