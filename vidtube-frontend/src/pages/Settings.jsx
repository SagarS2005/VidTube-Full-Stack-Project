import { useState } from "react";
import {
  User,
  Mail,
  Camera,
  Image as ImageIcon,
  KeyRound,
  CheckCircle2,
  Loader2,
  Save,
  Sun,
  Moon,
  Check
} from "lucide-react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const toast = useToast();

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar & Cover
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [coverPreview, setCoverPreview] = useState(user?.coverImage || "");
  const [coverFile, setCoverFile] = useState(null);
  const [savingCover, setSavingCover] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Handle Profile Details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Full name and email are required");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.patch("/users/update-account", {
        fullName: fullName.trim(),
        email: email.trim(),
      });
      updateUser(res.data.data);
      toast.success("Account details updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Avatar Change
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;

    setSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await api.patch("/users/avatar", formData);
      updateUser({ avatar: res.data.data.avatar });
      setAvatarFile(null);
      toast.success("Avatar image updated!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload avatar"));
    } finally {
      setSavingAvatar(false);
    }
  };

  // Handle Cover Change
  const handleCoverFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveCover = async () => {
    if (!coverFile) return;

    setSavingCover(true);
    try {
      const formData = new FormData();
      formData.append("coverImage", coverFile);
      const res = await api.patch("/users/cover-image", formData);
      updateUser({ coverImage: res.data.data.coverImage });
      setCoverFile(null);
      toast.success("Channel banner cover updated!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload cover image"));
    } finally {
      setSavingCover(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await api.post("/users/change-password", {
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to change password"));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="settings-page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Account Settings</h1>
          <p className="muted" style={{ margin: 0 }}>
            Personalize your channel branding, personal information, and security.
          </p>
        </div>
      </div>

      <div className="settings-cards-stack">
        {/* Appearance & Theme Section */}
        <section className="settings-card">
          <div className="settings-card-header-row">
            <div>
              <h2 className="settings-card-title">Appearance & Theme</h2>
              <p className="settings-card-subtitle muted">
                Customize your visual experience. Choose between modern Dark and crisp Light themes.
              </p>
            </div>
            <span className="theme-current-badge">
              {isDark ? "Dark Theme Active" : "Light Theme Active"}
            </span>
          </div>

          <div className="theme-options-grid">
            {/* Dark Theme Option Card */}
            <button
              type="button"
              className={`theme-option-card ${isDark ? "active" : ""}`}
              onClick={() => {
                if (!isDark) {
                  setTheme("dark");
                  toast.success("Dark theme activated");
                }
              }}
            >
              <div className="theme-option-preview theme-preview-dark">
                <div className="preview-mini-header">
                  <div className="preview-mini-brand">
                    <div className="preview-dot dot-red" />
                    <div className="preview-line line-short" />
                  </div>
                  <div className="preview-mini-avatar" />
                </div>
                <div className="preview-mini-content">
                  <div className="preview-mini-sidebar">
                    <div className="preview-line line-sidebar active" />
                    <div className="preview-line line-sidebar" />
                    <div className="preview-line line-sidebar" />
                  </div>
                  <div className="preview-mini-body">
                    <div className="preview-mini-card">
                      <div className="preview-card-thumb" />
                      <div className="preview-line line-full" />
                      <div className="preview-line line-half" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="theme-option-info">
                <div className="row spread">
                  <div className="row" style={{ gap: 8 }}>
                    <div className="theme-icon-circle dark-circle">
                      <Moon size={16} />
                    </div>
                    <strong>Dark Theme</strong>
                  </div>
                  <div className={`theme-radio-circle ${isDark ? "selected" : ""}`}>
                    {isDark && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
                <p className="theme-option-desc muted">
                  Sleek dark interface with deep obsidian tones and high-contrast accents. Soft on the eyes in low light.
                </p>
              </div>
            </button>

            {/* Light Theme Option Card */}
            <button
              type="button"
              className={`theme-option-card ${!isDark ? "active" : ""}`}
              onClick={() => {
                if (isDark) {
                  setTheme("light");
                  toast.success("Light theme activated");
                }
              }}
            >
              <div className="theme-option-preview theme-preview-light">
                <div className="preview-mini-header">
                  <div className="preview-mini-brand">
                    <div className="preview-dot dot-red" />
                    <div className="preview-line line-short" />
                  </div>
                  <div className="preview-mini-avatar" />
                </div>
                <div className="preview-mini-content">
                  <div className="preview-mini-sidebar">
                    <div className="preview-line line-sidebar active" />
                    <div className="preview-line line-sidebar" />
                    <div className="preview-line line-sidebar" />
                  </div>
                  <div className="preview-mini-body">
                    <div className="preview-mini-card">
                      <div className="preview-card-thumb" />
                      <div className="preview-line line-full" />
                      <div className="preview-line line-half" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="theme-option-info">
                <div className="row spread">
                  <div className="row" style={{ gap: 8 }}>
                    <div className="theme-icon-circle light-circle">
                      <Sun size={16} />
                    </div>
                    <strong>Light Theme</strong>
                  </div>
                  <div className={`theme-radio-circle ${!isDark ? "selected" : ""}`}>
                    {!isDark && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
                <p className="theme-option-desc muted">
                  Bright, crisp aesthetic with clean white surfaces and sharp typography. Ideal for daytime viewing.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Channel Branding Section */}
        <section className="settings-card">
          <h2 className="settings-card-title">Channel Branding</h2>
          <p className="settings-card-subtitle muted">
            Your avatar and cover image will be visible on your channel and across videos.
          </p>

          {/* Cover Image Upload */}
          <div className="settings-cover-preview-wrapper">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover Preview" className="settings-cover-img" />
            ) : (
              <div className="settings-cover-placeholder">
                <ImageIcon size={32} className="muted" />
                <span className="muted">Upload channel banner image</span>
              </div>
            )}
            <label className="settings-cover-overlay-btn">
              <Camera size={16} />
              <span>{coverFile ? "Choose different banner" : "Upload Banner"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverFileSelect}
                style={{ display: "none" }}
              />
            </label>
          </div>
          {coverFile && (
            <div className="row spread" style={{ marginTop: 8 }}>
              <span className="muted" style={{ fontSize: "0.85rem" }}>
                Ready to upload: {coverFile.name}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveCover}
                disabled={savingCover}
              >
                {savingCover ? <Loader2 size={14} className="spinner" /> : "Save Banner"}
              </button>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="settings-avatar-row" style={{ marginTop: 24 }}>
            <div className="settings-avatar-wrapper">
              <img
                src={
                  avatarPreview ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.username || "user")}`
                }
                alt="Avatar"
                className="avatar avatar-xl"
              />
              <label className="settings-avatar-overlay-btn" title="Change Avatar">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div className="grow">
              <strong>Profile Photo</strong>
              <p className="muted" style={{ fontSize: "0.85rem", margin: "2px 0 8px" }}>
                Recommend square image at least 250x250 pixels.
              </p>
              {avatarFile && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAvatar}
                  disabled={savingAvatar}
                >
                  {savingAvatar ? <Loader2 size={14} className="spinner" /> : "Save Photo"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Basic Info Section */}
        <section className="settings-card">
          <h2 className="settings-card-title">Personal Information</h2>
          <form onSubmit={handleUpdateProfile} className="form-stack">
            <div>
              <label className="form-label">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="form-label">Username</label>
              <input value={`@${user?.username}`} disabled className="input-disabled" />
              <span className="muted" style={{ fontSize: "0.8rem", marginTop: 4, display: "block" }}>
                Username is permanent and used for channel URL.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ alignSelf: "flex-start", marginTop: 8 }}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <>
                  <Loader2 size={14} className="spinner" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Update Info
                </>
              )}
            </button>
          </form>
        </section>

        {/* Password Security Section */}
        <section className="settings-card">
          <h2 className="settings-card-title">Security & Password</h2>
          <form onSubmit={handleChangePassword} className="form-stack">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ alignSelf: "flex-start", marginTop: 8 }}
              disabled={savingPassword || !oldPassword || !newPassword}
            >
              {savingPassword ? (
                <>
                  <Loader2 size={14} className="spinner" /> Updating...
                </>
              ) : (
                <>
                  <KeyRound size={14} /> Change Password
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
