import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import logog from "../../assests/logog.png";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(formData);
      if (response.user) {
        login(response.user);
        navigate("/dashboard");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      // Handle different types of errors
      if (err.data) {
        // Backend validation errors with detailed messages
        setError(err.data.message || "Login failed");
      } else if (err.message) {
        // Network or other errors
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div
          className="auth-logo"
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            className="logo-icon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              background: "#f0fff4",
              borderRadius: "12px",
              marginBottom: "15px",
              border: "2px solid #c6f6d5",
            }}
          >
            <img
              src={logog}
              alt="GeoPlanet Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
          </div>
          <h1
            style={{
              color: "#2d3748",
              fontSize: "24px",
              fontWeight: 700,
              margin: "0 0 5px 0",
            }}
          >
            GeoPlanet Solution
          </h1>
          <p
            className="company-tagline"
            style={{
              color: "#718096",
              fontSize: "14px",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Pvt. Ltd.
          </p>
        </div>

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to your account</p>
        </div>

        {error && (
          <div className="message error-message">
            <span className="message-icon">⚠️</span>
            <div className="message-content">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email"></label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className={error ? "error-input" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password"></label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className={error ? "error-input" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="forgot-password-link">
              <Link to="/forgot-password" className="forgot-link">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              Remember me
            </label>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>

        <div className="auth-footer">
          <p>
            <Link to="/register" className="auth-link">
              Create a new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;