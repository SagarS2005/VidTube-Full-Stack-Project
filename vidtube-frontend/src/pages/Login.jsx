import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PlaySquare, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";
import getErrorMessage from "../api/getErrorMessage";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credentials = identifier.includes("@")
        ? { email: identifier.trim(), password }
        : { username: identifier.trim(), password };

      await login(credentials);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Check your username/email and password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-floating-toggle">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="brand-logo-link" style={{ justifyContent: "center" }}>
            <div className="brand-badge">
              <PlaySquare size={22} className="brand-icon" />
            </div>
            <span className="brand-name" style={{ fontSize: "1.4rem" }}>
              Vid<span className="brand-accent">Tube</span>
            </span>
          </Link>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle muted">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="alert-card alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form form-stack">
          <div>
            <label className="form-label">Email or Username</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                placeholder="name@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="row spread" style={{ marginBottom: 4 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spinner" /> Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="muted" style={{ margin: 0 }}>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
