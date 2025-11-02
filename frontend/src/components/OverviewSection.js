import React from 'react';
import { 
  Calendar, 
  Clock, 
  Download, 
  Heart, 
  Activity, 
  Scale, 
  Moon, 
  TrendingUp,
  TrendingDown,
  Minus,
  Pill,
  Stethoscope,
  Phone,
  FileText,
  User,
  Droplets,
  Footprints,
  Bed
} from 'lucide-react';
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
    if (trend === 'up') return <TrendingUp size={16} className="overview_trend-icon overview_trend-up" />;
    if (trend === 'down') return <TrendingDown size={16} className="overview_trend-icon overview_trend-down" />;
    return <Minus size={16} className="overview_trend-icon overview_trend-stable" />;
  };

  const getMetricIcon = (key) => {
    const icons = {
      heartRate: <Heart size={20} />,
      bloodPressure: <Activity size={20} />,
      weight: <Scale size={20} />,
      bmi: <TrendingUp size={20} />,
      sleep: <Moon size={20} />,
      steps: <Footprints size={20} />
    };
    return icons[key] || <Activity size={20} />;
  };

  return (
    <div className="overview_container">
      {/* Welcome Banner */}
      <div className="overview_welcome-banner">
        <div className="overview_welcome-content">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your health overview for today</p>
        </div>
        <div className="overview_welcome-actions">
          <button className="overview_primary-btn">
            <Calendar size={16} />
            Book Appointment
          </button>
          <button className="overview_secondary-btn">
            <FileText size={16} />
            View Reports
          </button>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="overview_section">
        <h2 className="overview_section-title">Health Metrics</h2>
        <div className="overview_metrics-grid">
          {Object.entries(healthMetrics).map(([key, metric]) => (
            <div key={key} className="overview_metric-card">
              <div className="overview_metric-header">
                <div className="overview_metric-icon">
                  {getMetricIcon(key)}
                </div>
                <span 
                  className="overview_metric-status"
                  style={{ color: getStatusColor(metric.status) }}
                >
                  {metric.status}
                </span>
              </div>
              <div className="overview_metric-value">
                {metric.value}
                <span className="overview_metric-unit">{metric.unit}</span>
              </div>
              <div className="overview_metric-trend">
                {getTrendIcon(metric.trend)}
                <span className="overview_trend-text">Today</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="overview_content-grid">
        {/* Upcoming Appointments */}
        <div className="overview_content-card">
          <div className="overview_card-header">
            <h3>Upcoming Appointments</h3>
            <button className="overview_view-all-btn">View All</button>
          </div>
          <div className="overview_appointments-list">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="overview_appointment-item">
                <div className="overview_appointment-info">
                  <div className="overview_appointment-main">
                    <h4>{appointment.doctor}</h4>
                    <p className="overview_appointment-specialty">{appointment.specialty}</p>
                  </div>
                  <div className="overview_appointment-details">
                    <span className="overview_appointment-type">{appointment.type}</span>
                    <span className="overview_appointment-time">
                      <Calendar size={14} />
                      {appointment.date} at {appointment.time}
                    </span>
                  </div>
                </div>
                <div className="overview_appointment-actions">
                  <button className="overview_action-btn overview_primary">Join</button>
                  <button className="overview_action-btn overview_secondary">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Medications */}
        <div className="overview_content-card">
          <div className="overview_card-header">
            <h3>Current Medications</h3>
            <button className="overview_view-all-btn">Manage</button>
          </div>
          <div className="overview_medications-list">
            {recentMedications.map((med, index) => (
              <div key={index} className="overview_medication-item">
                <div className="overview_medication-info">
                  <h4>{med.name}</h4>
                  <p>{med.dosage} • {med.frequency}</p>
                  <span className="overview_medication-next">
                    <Clock size={14} />
                    Next dose: {med.nextDose}
                  </span>
                </div>
                <div className="overview_medication-status">
                  <div className="overview_status-indicator overview_active"></div>
                  <span>Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="overview_content-card">
          <div className="overview_card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="overview_quick-actions-grid">
            <button className="overview_quick-action-btn">
              <FileText size={20} className="overview_action-icon" />
              <span className="overview_action-text">Health Report</span>
            </button>
            <button className="overview_quick-action-btn">
              <Pill size={20} className="overview_action-icon" />
              <span className="overview_action-text">Medication Refill</span>
            </button>
            <button className="overview_quick-action-btn">
              <Stethoscope size={20} className="overview_action-icon" />
              <span className="overview_action-text">Find Doctor</span>
            </button>
            <button className="overview_quick-action-btn">
              <Phone size={20} className="overview_action-icon" />
              <span className="overview_action-text">Emergency</span>
            </button>
          </div>
        </div>

        {/* Health Tips */}
        <div className="overview_content-card overview_health-tips">
          <div className="overview_card-header">
            <h3>Health Tips</h3>
          </div>
          <div className="overview_tips-list">
            <div className="overview_tip-item">
              <Droplets size={20} className="overview_tip-icon" />
              <div className="overview_tip-content">
                <h4>Stay Hydrated</h4>
                <p>Drink at least 8 glasses of water today</p>
              </div>
            </div>
            <div className="overview_tip-item">
              <Footprints size={20} className="overview_tip-icon" />
              <div className="overview_tip-content">
                <h4>Daily Walk</h4>
                <p>You're close to your 10,000 steps goal!</p>
              </div>
            </div>
            <div className="overview_tip-item">
              <Bed size={20} className="overview_tip-icon" />
              <div className="overview_tip-content">
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