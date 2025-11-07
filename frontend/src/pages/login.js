import React, { useState } from "react";
import axios from "axios";
import API_URL from "../baseurl";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const res = await axios.post(`${API_URL}api/login`, formData);

    // Store token and user data
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // ✅ Redirect based on user role
    const userRole = res.data.user?.role?.toLowerCase();
    if (userRole === "admin") {
      window.location.href = "/admindashboard";
    } else {
      window.location.href = "/dashboard";
    }

  } catch (err) {
    console.error(err);
    setErrors({
      submit: err.response?.data?.message || "Login failed. Please check your credentials.",
    });
  } finally {
    setIsLoading(false);
  }
};


  // Check for remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your Wellness Care account</p>
        </div>

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="login-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-label">Remember me</span>
            </label>
            
            <a href="/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="signup-link">
            Don't have an account? <a href="/signup" className="link">Create account</a>
          </div>
        </form>

        {/* Demo Credentials Section */}
        {/* <div className="demo-section">
          <div className="demo-header">
            <span className="demo-icon">💡</span>
            <span>Demo Credentials</span>
          </div>
          <div className="demo-credentials">
            <div className="demo-item">
              <strong>Email:</strong> demo@wellnesscare.com
            </div>
            <div className="demo-item">
              <strong>Password:</strong> demopass123
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;