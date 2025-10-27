import React from 'react';
import './OverviewSection.css';

const OverviewSection = ({ user }) => {
  // Mock data for dashboard
  const healthMetrics = {
    heartRate: { value: 72, unit: 'BPM', status: 'normal', trend: 'stable' },
    bloodPressure: { value: '120/80', unit: 'mmHg', status: 'normal', trend: 'stable' },
    weight: { value: 68, unit: 'kg', status: 'normal', trend: 'down' },
    bmi: { value: 22.2, unit: '', status: 'healthy', trend: 'stable' },
    sleep: { value: 7.5, unit: 'hours', status: 'good', trend: 'up' },
    steps: { value: 8452, unit: 'steps', status: 'good', trend: 'up' }
  };

  const upcomingAppointments = [
    { 
      id: 1, 
      doctor: 'Dr. Sarah Smith', 
      specialty: 'Cardiologist',
      date: '2024-02-15', 
      time: '10:00 AM', 
      type: 'General Checkup',
      status: 'confirmed'
    },
    { 
      id: 2, 
      doctor: 'Dr. Mike Johnson', 
      specialty: 'Dentist',
      date: '2024-02-20', 
      time: '2:30 PM', 
      type: 'Dental Cleaning',
      status: 'confirmed'
    }
  ];

  const recentMedications = [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', nextDose: '2:00 PM' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', nextDose: '8:00 AM' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      normal: '#10b981',
      healthy: '#10b981',
      good: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getTrendIcon = (trend) => {
    const icons = {
      up: '↗️',
      down: '↘️',
      stable: '→'
    };
    return icons[trend] || '→';
  };

  return (
    <div className="overview-section">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's your health overview for today</p>
        </div>
        <div className="welcome-actions">
          <button className="primary-btn">Book Appointment</button>
          <button className="secondary-btn">View Reports</button>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="section">
        <h2 className="section-title">Health Metrics</h2>
        <div className="metrics-grid">
          {Object.entries(healthMetrics).map(([key, metric]) => (
            <div key={key} className="metric-card">
              <div className="metric-header">
                <h3 className="metric-name">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                <span 
                  className="metric-status"
                  style={{ color: getStatusColor(metric.status) }}
                >
                  {metric.status}
                </span>
              </div>
              <div className="metric-value">
                {metric.value}
                <span className="metric-unit">{metric.unit}</span>
              </div>
              <div className="metric-trend">
                <span className="trend-icon">{getTrendIcon(metric.trend)}</span>
                <span className="trend-text">Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Upcoming Appointments */}
        <div className="content-card">
          <div className="card-header">
            <h3>Upcoming Appointments</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="appointments-list">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-info">
                  <div className="appointment-main">
                    <h4>{appointment.doctor}</h4>
                    <p className="appointment-specialty">{appointment.specialty}</p>
                  </div>
                  <div className="appointment-details">
                    <span className="appointment-type">{appointment.type}</span>
                    <span className="appointment-time">
                      {appointment.date} at {appointment.time}
                    </span>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button className="action-btn primary">Join</button>
                  <button className="action-btn secondary">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Medications */}
        <div className="content-card">
          <div className="card-header">
            <h3>Current Medications</h3>
            <button className="view-all-btn">Manage</button>
          </div>
          <div className="medications-list">
            {recentMedications.map((med, index) => (
              <div key={index} className="medication-item">
                <div className="medication-info">
                  <h4>{med.name}</h4>
                  <p>{med.dosage} • {med.frequency}</p>
                  <span className="medication-next">
                    Next dose: {med.nextDose}
                  </span>
                </div>
                <div className="medication-status">
                  <div className="status-indicator active"></div>
                  <span>Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="content-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <span className="action-icon">📋</span>
              <span className="action-text">Health Report</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">💊</span>
              <span className="action-text">Medication Refill</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">🏥</span>
              <span className="action-text">Find Doctor</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📞</span>
              <span className="action-text">Emergency</span>
            </button>
          </div>
        </div>

        {/* Health Tips */}
        <div className="content-card health-tips">
          <div className="card-header">
            <h3>Health Tips</h3>
          </div>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">💧</span>
              <div className="tip-content">
                <h4>Stay Hydrated</h4>
                <p>Drink at least 8 glasses of water today</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🚶</span>
              <div className="tip-content">
                <h4>Daily Walk</h4>
                <p>You're close to your 10,000 steps goal!</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">😴</span>
              <div className="tip-content">
                <h4>Sleep Well</h4>
                <p>Great sleep duration last night</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;