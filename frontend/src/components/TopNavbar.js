import React, { useState } from 'react';
import { 
  BarChart3, 
  Heart, 
  Calendar, 
  User, 
  MessageCircle, 
  LogOut,
  Menu 
} from 'lucide-react';
import './TopNavbar.css';

const TopNavbar = ({ activeSection, setActiveSection, setIsChatbotOpen, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'health', icon: Heart, label: 'Health Records' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="top-navbar">
      <div className="nav-container">
        {/* Logo/Brand */}
        <div className="nav-brand">
          <h2>Wellness Care</h2>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="nav-icon" size={20} />
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="nav-actions">
          <button 
            className="chatbot-btn"
            onClick={() => window.location.href = '/chatbot'}
          >
            <MessageCircle className="chat-icon" size={20} />
            <span className="chat-text">AI Assistant</span>
          </button>

          <button className="dropdown-item" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>

          <div className="user-menu">
            <div className="user-info">
              <div className="avatar-small">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span className="user-name">{user.name || 'User'}</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setIsMobileMenuOpen(false);
              }}
            >
              <item.icon className="nav-icon" size={20} />
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
          <button 
            className="mobile-nav-item chatbot-mobile-btn"
            onClick={() => {
              setIsChatbotOpen(true);
              setIsMobileMenuOpen(false);
            }}
          >
            <MessageCircle className="nav-icon" size={20} />
            <span className="nav-text">AI Assistant</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default TopNavbar;