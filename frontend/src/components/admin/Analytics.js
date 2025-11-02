import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  UserX, 
  MessageSquare, 
  Key, 
  Star,
  RefreshCw,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../baseurl';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import './Analytics.css';

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/analytics`);
      setStats(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration (replace with actual time-series data from your API)
  const getUserTrendData = () => {
    const baseData = [
      { date: 'Mon', users: stats?.total_users - 15 || 0, approved: stats?.approved_users - 10 || 0 },
      { date: 'Tue', users: stats?.total_users - 10 || 0, approved: stats?.approved_users - 7 || 0 },
      { date: 'Wed', users: stats?.total_users - 5 || 0, approved: stats?.approved_users - 3 || 0 },
      { date: 'Thu', users: stats?.total_users - 2 || 0, approved: stats?.approved_users - 1 || 0 },
      { date: 'Fri', users: stats?.total_users || 0, approved: stats?.approved_users || 0 },
    ];
    return baseData;
  };

  const userDistributionData = stats ? [
    { name: 'Approved', value: stats.approved_users, color: '#10B981' },
    { name: 'Pending', value: stats.pending_users, color: '#F59E0B' },
    { name: 'Rejected', value: stats.rejected_users, color: '#EF4444' }
  ] : [];

  const systemMetricsData = stats ? [
    { name: 'Users', value: stats.total_users, icon: Users },
    { name: 'Feedback', value: stats.feedback_count, icon: MessageSquare },
    { name: 'Keywords', value: stats.keyword_count, icon: Key },
    { name: 'Avg Rating', value: stats.average_feedback, icon: Star, isDecimal: true }
  ] : [];

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <AlertCircle size={48} />
        <h3>Unable to Load Analytics</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={fetchStats}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-info">
          <h2>Analytics Dashboard</h2>
          <p>Comprehensive overview of platform performance and user engagement</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
          <button className="refresh-btn" onClick={fetchStats} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        {systemMetricsData.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.name} className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: `${COLORS[index]}20`, color: COLORS[index] }}>
                <IconComponent size={24} />
              </div>
              <div className="metric-content">
                <h3>{metric.name}</h3>
                <div className="metric-value">
                  {metric.isDecimal ? metric.value.toFixed(1) : metric.value}
                  {metric.name === 'Avg Rating' && <span className="metric-suffix">/5</span>}
                </div>
                <div className="metric-trend">
                  <TrendingUp size={14} />
                  <span>+12% this week</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* User Growth Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>User Growth Trend</h3>
            <span className="chart-subtitle">Total vs Approved Users</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getUserTrendData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.2}
                name="Total Users"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="approved" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.2}
                name="Approved Users"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>User Distribution</h3>
            <span className="chart-subtitle">Approval Status Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                }
                labelLine={false}
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* System Metrics Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>System Overview</h3>
            <span className="chart-subtitle">Platform Metrics Comparison</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[stats]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="total_users" 
                name="Total Users" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="feedback_count" 
                name="Feedback Entries" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="keyword_count" 
                name="Keywords" 
                fill="#F59E0B" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Approval Rate Progress */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Approval Performance</h3>
            <span className="chart-subtitle">User Registration Efficiency</span>
          </div>
          <div className="progress-stats">
            <div className="progress-item">
              <div className="progress-label">
                <UserCheck size={16} />
                <span>Approval Rate</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(stats.approved_users / stats.total_users) * 100 || 0}%`,
                    backgroundColor: '#10B981'
                  }}
                ></div>
              </div>
              <div className="progress-value">
                {((stats.approved_users / stats.total_users) * 100 || 0).toFixed(1)}%
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-label">
                <UserX size={16} />
                <span>Rejection Rate</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(stats.rejected_users / stats.total_users) * 100 || 0}%`,
                    backgroundColor: '#EF4444'
                  }}
                ></div>
              </div>
              <div className="progress-value">
                {((stats.rejected_users / stats.total_users) * 100 || 0).toFixed(1)}%
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-label">
                <Users size={16} />
                <span>Pending Rate</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(stats.pending_users / stats.total_users) * 100 || 0}%`,
                    backgroundColor: '#F59E0B'
                  }}
                ></div>
              </div>
              <div className="progress-value">
                {((stats.pending_users / stats.total_users) * 100 || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="detailed-stats">
        <h3>Detailed Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total User Registrations</span>
            <span className="stat-value">{stats.total_users}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Approval Efficiency</span>
            <span className="stat-value">
              {((stats.approved_users / stats.total_users) * 100 || 0).toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Response Time</span>
            <span className="stat-value">2.3h</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">User Satisfaction</span>
            <span className="stat-value">{stats.average_feedback.toFixed(1)}/5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;