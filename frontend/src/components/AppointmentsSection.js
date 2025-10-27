import React, { useState } from 'react';
import './AppointmentsSection.css';

const AppointmentsSection = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const appointments = {
    upcoming: [
      { 
        id: 1, 
        doctor: 'Dr. Sarah Smith', 
        specialty: 'Cardiologist',
        date: '2024-02-15', 
        time: '10:00 AM', 
        type: 'General Checkup',
        status: 'confirmed',
        duration: '30 mins',
        location: 'Main Hospital - Floor 3'
      },
      { 
        id: 2, 
        doctor: 'Dr. Mike Johnson', 
        specialty: 'Dentist',
        date: '2024-02-20', 
        time: '2:30 PM', 
        type: 'Dental Cleaning',
        status: 'confirmed',
        duration: '45 mins',
        location: 'Dental Wing - Floor 1'
      }
    ],
    pending: [
      { 
        id: 3, 
        doctor: 'Dr. Emily Chen', 
        specialty: 'Dermatologist',
        date: '2024-03-01', 
        time: '11:15 AM', 
        type: 'Skin Consultation',
        status: 'pending',
        duration: '30 mins',
        location: 'Skin Clinic - Floor 2'
      }
    ],
    past: [
      { 
        id: 4, 
        doctor: 'Dr. Raj Patel', 
        specialty: 'General Physician',
        date: '2024-01-10', 
        time: '9:00 AM', 
        type: 'Follow-up',
        status: 'completed',
        duration: '20 mins',
        location: 'Main Hospital - Floor 2'
      }
    ]
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: 'confirmed', label: 'Confirmed', icon: '✅' },
      pending: { class: 'pending', label: 'Pending', icon: '⏳' },
      completed: { class: 'completed', label: 'Completed', icon: '✅' },
      cancelled: { class: 'cancelled', label: 'Cancelled', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const currentAppointments = appointments[activeTab];

  return (
    <div className="appointments-section">
      <div className="section-header">
        <div>
          <h1>My Appointments</h1>
          <p>Manage your medical appointments and consultations</p>
        </div>
        <button className="primary-btn large">
          Book New Appointment
        </button>
      </div>

      {/* Appointment Tabs */}
      <div className="appointment-tabs">
        <button 
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({appointments.upcoming.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({appointments.pending.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past ({appointments.past.length})
        </button>
      </div>

      {/* Appointments List */}
      <div className="appointments-container">
        {currentAppointments.length > 0 ? (
          currentAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div className="doctor-info">
                  <h3>{appointment.doctor}</h3>
                  <p className="specialty">{appointment.specialty}</p>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
              
              <div className="appointment-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Date & Time</span>
                    <span className="value">{appointment.date} at {appointment.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration</span>
                    <span className="value">{appointment.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type</span>
                    <span className="value">{appointment.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location</span>
                    <span className="value">{appointment.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="appointment-actions">
                {appointment.status === 'confirmed' && (
                  <>
                    <button className="action-btn primary">Join Video Call</button>
                    <button className="action-btn secondary">Reschedule</button>
                    <button className="action-btn outline">Cancel</button>
                  </>
                )}
                {appointment.status === 'pending' && (
                  <>
                    <button className="action-btn primary">Confirm</button>
                    <button className="action-btn outline">Reschedule</button>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <>
                    <button className="action-btn primary">View Summary</button>
                    <button className="action-btn outline">Book Follow-up</button>
                  </>
                )}
                <button className="action-btn ghost">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments found</h3>
            <p>You don't have any {activeTab} appointments scheduled.</p>
            <button className="primary-btn">Book Appointment</button>
          </div>
        )}
      </div>

      {/* Quick Booking */}
      <div className="quick-booking">
        <h2>Quick Book</h2>
        <div className="specialty-grid">
          <button className="specialty-btn">
            <span className="specialty-icon">❤️</span>
            <span className="specialty-name">Cardiology</span>
          </button>
          <button className="specialty-btn">
            <span className="specialty-icon">🧠</span>
            <span className="specialty-name">Neurology</span>
          </button>
          <button className="specialty-btn">
            <span className="specialty-icon">🦷</span>
            <span className="specialty-name">Dentistry</span>
          </button>
          <button className="specialty-btn">
            <span className="specialty-icon">👁️</span>
            <span className="specialty-name">Ophthalmology</span>
          </button>
          <button className="specialty-btn">
            <span className="specialty-icon">🦴</span>
            <span className="specialty-name">Orthopedics</span>
          </button>
          <button className="specialty-btn">
            <span className="specialty-icon">👶</span>
            <span className="specialty-name">Pediatrics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsSection;