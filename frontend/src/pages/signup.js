import React, { useState } from "react";
import axios from "axios";
import API_URL from "../baseurl";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
    emergencyContact: "",
    bloodGroup: "",
    address: "",
    medicalHistory: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (formData.age < 1 || formData.age > 120) {
      newErrors.age = "Age must be between 1 and 120";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.emergencyContact && !/^\d{10}$/.test(formData.emergencyContact)) {
      newErrors.emergencyContact = "Emergency contact must be 10 digits";
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
    setSuccessMessage("");

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        password: formData.password,
        emergencyContact: formData.emergencyContact,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        medicalHistory: formData.medicalHistory
      };

      const res = await axios.post(`${API_URL}api/signup`, submitData);
      
      setSuccessMessage(res.data.message);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        password: "",
        confirmPassword: "",
        emergencyContact: "",
        bloodGroup: "",
        address: "",
        medicalHistory: ""
      });

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

    } catch (err) {
      console.error(err);
      setErrors({ 
        submit: err.response?.data?.message || "Signup failed. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2 className="signup-title">Join Wellness Care</h2>
          <p className="signup-subtitle">Create your patient account</p>
        </div>


        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-grid">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'error' : ''}`}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

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

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input-field ${errors.phone ? 'error' : ''}`}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Age *</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    className={`input-field ${errors.age ? 'error' : ''}`}
                  />
                  {errors.age && <span className="error-text">{errors.age}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`input-field ${errors.gender ? 'error' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <span className="error-text">{errors.gender}</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="form-section">
              <h3 className="section-title">Medical Information</h3>

              <div className="input-group">
                <label className="input-label">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  placeholder="Emergency phone number"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className={`input-field ${errors.emergencyContact ? 'error' : ''}`}
                />
                {errors.emergencyContact && <span className="error-text">{errors.emergencyContact}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Address</label>
                <textarea
                  name="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="input-field textarea"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Medical History</label>
                <textarea
                  name="medicalHistory"
                  placeholder="Any pre-existing conditions, allergies, or medical history"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows="3"
                  className="input-field textarea"
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
              <h3 className="section-title">Security</h3>

              <div className="input-group">
                <label className="input-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${errors.password ? 'error' : ''}`}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
                  {successMessage && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}


          <div className="login-link">
            Already have an account? <a href="/login" className="link">Sign in here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;