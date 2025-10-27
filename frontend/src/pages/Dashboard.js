import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/TopNavbar';
import OverviewSection from '../components/OverviewSection';
import HealthRecordsSection from '../components/HealthRecordsSection';
import AppointmentsSection from '../components/AppointmentsSection';
import ProfileSection from '../components/ProfileSection';
import Chatbot from '../components/Chatbot';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection user={user} />;
      case 'health':
        return <HealthRecordsSection />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'profile':
        return <ProfileSection user={user} />;
      case 'chatbot':
        return <Chatbot user={user} />;
      default:
        return <OverviewSection user={user} />;
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <TopNavbar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setIsChatbotOpen={setIsChatbotOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {renderActiveSection()}
        </div>
      </main>

      {/* Chatbot */}
      {/* <Chatbot 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      /> */}
    </div>
  );
};

export default Dashboard;