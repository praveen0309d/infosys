import React, { useState } from 'react';
import './ProfileSection.css';

const ProfileSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    emergencyContact: user?.emergencyContact || '',
    address: user?.address || '',
    medicalHistory: user?.medicalHistory || '',
    allergies: user?.allergies || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // Update localStorage or context with new data
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const profileFields = [
    { label: 'Full Name', key: 'name', type: 'text', editable: true },
    { label: 'Email', key: 'email', type: 'email', editable: false },
    { label: 'Phone Number', key: 'phone', type: 'tel', editable: true },
    { label: 'Age', key: 'age', type: 'number', editable: true },
    { label: 'Gender', key: 'gender', type: 'select', editable: true, options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    { label: 'Blood Group', key: 'bloodGroup', type: 'select', editable: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
    { label: 'Emergency Contact', key: 'emergencyContact', type: 'tel', editable: true }
  ];

  return (
    <div className="profile-section">
      <div className="section-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and preferences</p>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="primary-btn large"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="secondary-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                className="primary-btn large"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header">
            <div className="avatar-large">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.name || 'User'}</h2>
              <p>Patient since {new Date().getFullYear()}</p>
              <div className="profile-stats">
                <div className="stat">
                  <strong>12</strong>
                  <span>Appointments</span>
                </div>
                <div className="stat">
                  <strong>5</strong>
                  <span>Medications</span>
                </div>
                <div className="stat">
                  <strong>8</strong>
                  <span>Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-details-grid">
          {/* Personal Information */}
          <div className="profile-card">
            <h3>Personal Information</h3>
            <div className="details-grid">
              {profileFields.map(field => (
                <div key={field.key} className="detail-field">
                  <label>{field.label}</label>
                  {isEditing && field.editable ? (
                    field.type === 'select' ? (
                      <select
                        name={field.key}
                        value={formData[field.key]}
                        onChange={handleInputChange}
                        className="edit-input"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.key}
                        value={formData[field.key]}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    )
                  ) : (
                    <div className="field-value">
                      {formData[field.key] || 'Not specified'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Medical Information */}
          <div className="profile-card">
            <h3>Medical Information</h3>
            <div className="medical-fields">
              <div className="detail-field full-width">
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="edit-textarea"
                    rows="3"
                  />
                ) : (
                  <div className="field-value">
                    {formData.address || 'Not specified'}
                  </div>
                )}
              </div>
              <div className="detail-field full-width">
                <label>Medical History</label>
                {isEditing ? (
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    className="edit-textarea"
                    rows="3"
                    placeholder="Any pre-existing conditions, surgeries, or chronic illnesses"
                  />
                ) : (
                  <div className="field-value">
                    {formData.medicalHistory || 'No medical history recorded'}
                  </div>
                )}
              </div>
              <div className="detail-field full-width">
                <label>Allergies</label>
                {isEditing ? (
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    className="edit-textarea"
                    rows="2"
                    placeholder="List any known allergies or adverse reactions"
                  />
                ) : (
                  <div className="field-value">
                    {formData.allergies || 'No known allergies'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="profile-card">
            <h3>Account Settings</h3>
            <div className="settings-list">
              <button className="settings-item">
                <span className="settings-icon">🔒</span>
                <div className="settings-content">
                  <h4>Change Password</h4>
                  <p>Update your account password</p>
                </div>
                <span className="settings-arrow">→</span>
              </button>
              <button className="settings-item">
                <span className="settings-icon">🔔</span>
                <div className="settings-content">
                  <h4>Notification Preferences</h4>
                  <p>Manage how you receive notifications</p>
                </div>
                <span className="settings-arrow">→</span>
              </button>
              <button className="settings-item">
                <span className="settings-icon">📱</span>
                <div className="settings-content">
                  <h4>Connected Devices</h4>
                  <p>Manage your connected health devices</p>
                </div>
                <span className="settings-arrow">→</span>
              </button>
              <button className="settings-item">
                <span className="settings-icon">📄</span>
                <div className="settings-content">
                  <h4>Privacy Settings</h4>
                  <p>Control your data sharing preferences</p>
                </div>
                <span className="settings-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="profile-card emergency-contacts">
            <h3>Emergency Contacts</h3>
            <div className="emergency-list">
              <div className="emergency-item">
                <div className="emergency-icon">🚨</div>
                <div className="emergency-content">
                  <h4>Primary Emergency Contact</h4>
                  <p>{formData.emergencyContact || 'Not set'}</p>
                </div>
                <button className="edit-emergency-btn">Edit</button>
              </div>
              <div className="emergency-item">
                <div className="emergency-icon">🏥</div>
                <div className="emergency-content">
                  <h4>Hospital Emergency</h4>
                  <p>123-456-7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;