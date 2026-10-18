import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlaySquare,
  User,
  Mail,
  Lock,
  Camera,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";
import getErrorMessage from "../api/getErrorMessage";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setError("Please choose a profile avatar image (required).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("username", username.trim().toLowerCase());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);
      formData.append("avatar", avatarFile);
      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      await api.post("/users/register", formData);
      toast.success("Account created successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Username or email may already be registered."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-floating-toggle">
        <ThemeToggle />
      </div>
      <div className="auth-card auth-card-lg">
        <div className="auth-header">
          <Link to="/" className="brand-logo-link" style={{ justifyContent: "center" }}>
            <div className="brand-badge">
              <PlaySquare size={22} className="brand-icon" />
            </div>
            <span className="brand-name" style={{ fontSize: "1.4rem" }}>
              Vid<span className="brand-accent">Tube</span>
            </span>
          </Link>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle muted">Start uploading, watching, and subscribing today</p>
        </div>

        {error && (
          <div className="alert-card alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form form-stack">
          {/* Avatar and Cover previews */}
          <div className="register-images-row">
            <div className="register-avatar-picker">
              <div className="register-avatar-circle">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="avatar avatar-xl" />
                ) : (
                  <Camera size={24} className="muted" />
                )}
                <label className="register-avatar-badge" title="Upload avatar">
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                    required
                  />
                </label>
              </div>
              <span className="muted" style={{ fontSize: "0.8rem", marginTop: 4 }}>
                Avatar *
              </span>
            </div>

            <div className="register-cover-picker grow">
              {coverPreview ? (
                <div className="register-cover-preview">
                  <img src={coverPreview} alt="Cover" className="register-cover-img" />
                  <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer", marginTop: 4 }}>
                    Change banner
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              ) : (
                <label className="register-cover-placeholder">
                  <ImageIcon size={20} className="muted" />
                  <span className="muted" style={{ fontSize: "0.85rem" }}>
                    Optional Channel Banner
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Tony Stark"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Username *</label>
              <div className="input-with-icon">
                <span className="input-prefix">@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password *</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Choose a strong password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spinner" /> Creating account...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="muted" style={{ margin: 0 }}>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
