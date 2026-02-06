import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";

import logog from "../../assests/logog.png";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    contact_number: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  // Frontend basic validation
  const validateForm = () => {
    const errors = {};

    if (formData.password !== formData.confirmPassword) {
      errors.password = ["Passwords do not match"];
    }
    if (formData.password.length < 6) {
      errors.password = [...(errors.password || []), "Password must be at least 6 characters"];
    }
    if (formData.username.length < 3) {
      errors.username = ["Username must be at least 3 characters"];
    }
    if (formData.contact_number && !/^\d{10,15}$/.test(formData.contact_number)) {
      errors.contact_number = ["Contact number must be 10-15 digits"];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFieldErrors({});
  setSuccess("");

  if (!validateForm()) return;

  setLoading(true);

  try {
    const { confirmPassword, ...registrationData } = formData;
    const response = await api.register(registrationData);

    setSuccess(response.message);
    setTimeout(() => navigate("/login"), 2000);
  } catch (err) {
    // Handle different types of errors
    if (err.data) {
      // Backend validation errors with detailed messages
      const data = err.data;
      const errors = {};

      // Handle field-specific rules from backend
      if (data.rules) {
        errors.username = Array.isArray(data.rules) ? data.rules : [data.rules];
      }
      
      // Handle other backend error messages
      if (data.message && !data.rules) {
        errors.general = [data.message];
      }

      setFieldErrors(errors);
    } else if (err.message) {
      // Network or other errors
      setFieldErrors({ general: [err.message] });
    } else {
      setFieldErrors({ general: ["An unexpected error occurred"] });
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo" style={{ textAlign: "center", marginBottom: "30px" }}>
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
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "12px" }}
            />
          </div>
          <h1 style={{ color: "#2d3748", fontSize: "24px", fontWeight: 700, margin: "0 0 5px 0" }}>
            GeoPlanet Solution
          </h1>
          <p style={{ color: "#718096", fontSize: "14px", margin: 0, fontWeight: 500 }}>Pvt. Ltd.</p>
        </div>

        <div className="auth-header">
          <h2>Create Your Account</h2>
          <p>Join our task management platform to get started</p>
        </div>

        {/* General Error */}
        {fieldErrors.general && (
          <div className="message error-message">
            <span className="message-icon">⚠️</span>
            <div className="message-content">
              <strong>Error</strong>
              <ul>
                {fieldErrors.general.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="message success-message">
            <span className="message-icon">✅</span>
            <div className="message-content">
              <strong>Success</strong>
              <p>{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="form-group">
            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contact Number */}
          <div className="form-group">
            <input
              type="text"
              name="contact_number"
              placeholder="Enter your contact number"
              value={formData.contact_number}
              onChange={handleChange}
              required
            />
            {fieldErrors.contact_number && (
              <ul style={{ color: "red", marginTop: "5px" }}>
                {fieldErrors.contact_number.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Username */}
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {fieldErrors.username && (
              <ul style={{ color: "red", marginTop: "5px" }}>
                {fieldErrors.username.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && (
              <ul style={{ color: "red", marginTop: "5px" }}>
                {fieldErrors.email.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {fieldErrors.password && (
              <ul style={{ color: "red", marginTop: "5px" }}>
                {fieldErrors.password.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Terms & Service */}
          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" required />
              <span className="checkmark"></span>I agree to the{" "}
              <Link to="/terms" className="terms-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="terms-link">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <>
                <span className="loading-spinner"></span> Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link">
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
