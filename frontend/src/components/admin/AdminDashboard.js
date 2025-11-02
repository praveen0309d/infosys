import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Add this import
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Key, 
  LogOut, 
  TrendingUp,
  Shield,
  Activity,
  BarChart3,
  UserCheck,
  UserX
} from 'lucide-react';
import UserManagement from './UserManagement';
import KeywordManager from './KeywordManager';
import FeedbackMonitor from './FeedbackMonitor';
import Analytics from './Analytics';
import TextFeedback from './TextFeedback.js';
import './AdminDashboard.css';
import API_URL from '../../baseurl';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    total_users: 0,
    approved_users: 0,
    pending_users: 0,
    rejected_users: 0,
    feedback_count: 0,
    keyword_count: 0,
    average_feedback: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate(); // ✅ Initialize navigation

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login', { replace: true }); // ✅ ensures immediate navigation
  window.location.reload(); // ✅ forces React state reset
};

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/analytics`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'TextFeedback', label: 'TextFeedback', icon: MessageSquare },
    { id: 'keywords', label: 'Keywords', icon: Key },
    { id: 'feedback', label: 'Feedback', icon: ThumbsUp },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'keywords':
        return <KeywordManager />;
      case 'feedback':
        return <FeedbackMonitor />;
      case 'analytics':
        return <Analytics />;
      case 'TextFeedback':
        return <TextFeedback />;
      default:
        return (
          <div className="dashboard-overview">
            <div className="stats-grid">
              <StatCard icon={Users} title="Total Users" value={stats.total_users} change={`${stats.approved_users} approved`} color="#3B82F6" />
              <StatCard icon={UserCheck} title="Approved Users" value={stats.approved_users} change={`${Math.round((stats.approved_users / stats.total_users) * 100) || 0}% rate`} color="#10B981" />
              <StatCard icon={Activity} title="Pending Approval" value={stats.pending_users} change="Awaiting review" color="#F59E0B" />
              <StatCard icon={UserX} title="Rejected Users" value={stats.rejected_users} change="Not approved" color="#EF4444" />
              <StatCard icon={MessageSquare} title="Total Feedback" value={stats.feedback_count} change="User ratings" color="#8B5CF6" />
              <StatCard icon={Key} title="Keywords" value={stats.keyword_count} change="Response pairs" color="#EC4899" />
              <StatCard icon={ThumbsUp} title="Avg. Rating" value={stats.average_feedback} change="/5 stars" color="#06B6D4" isDecimal={true} />
              <StatCard icon={BarChart3} title="Approval Rate" value={Math.round((stats.approved_users / stats.total_users) * 100) || 0} change="% approved" color="#84CC16" isPercentage={true} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin_dash">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <Shield size={28} />
            <span>Wellness Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <h1>Wellness Assistant Admin</h1>
            <div className="header-stats">
              <div className="stat-badge">
                <Users size={16} />
                <span>{stats.total_users} Total Users</span>
              </div>
              <div className="stat-badge">
                <UserCheck size={16} />
                <span>{stats.approved_users} Approved</span>
              </div>
              <div className="stat-badge">
                <Activity size={16} />
                <span>{stats.pending_users} Pending</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, change, color, isDecimal = false, isPercentage = false }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
      <Icon size={24} />
    </div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-value">
        {isDecimal ? value.toFixed(1) : value}
        {isPercentage && '%'}
      </div>
      <div className="stat-change" style={{ color: change.includes('approved') ? '#10B981' : '#6B7280' }}>
        {change}
      </div>
    </div>
  </div>
);

export default AdminDashboard;
