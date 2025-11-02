import React, { useEffect, useState } from 'react';
import { 
  Star, 
  Search, 
  User, 
  MessageSquare, 
  Calendar,
  RefreshCw,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Download
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../baseurl';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import './FeedbackMonitor.css';

const FeedbackMonitor = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/feedback`);
      const fbData = res.data || [];
      setFeedbacks(fbData);
      setFilteredFeedbacks(fbData);

      prepareRatingChart(fbData);
      prepareTrendChart(fbData);
      prepareSentimentData(fbData);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Filter feedbacks based on search and rating
  useEffect(() => {
    let filtered = feedbacks;

    if (searchTerm) {
      filtered = filtered.filter(fb =>
        fb.chat_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.feedback_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(fb => fb.rating === parseInt(ratingFilter));
    }

    setFilteredFeedbacks(filtered);
  }, [searchTerm, ratingFilter, feedbacks]);

  // Bar chart for rating distribution
  const prepareRatingChart = (data) => {
    const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    data.forEach(fb => {
      const r = Math.round(fb.rating);
      if (r >= 1 && r <= 5) counts[r]++;
    });
    const formatted = Object.entries(counts).map(([rating, count]) => ({
      rating: `⭐ ${rating}`,
      count,
      fill: getRatingColor(Number(rating))
    }));
    setRatingData(formatted);
  };

  // Line chart for feedback trend over time
  const prepareTrendChart = (data) => {
    const trendMap = {};
    data.forEach(fb => {
      if (fb.created_at) {
        const date = new Date(fb.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        if (!trendMap[date]) trendMap[date] = 0;
        trendMap[date]++;
      }
    });
    const formatted = Object.entries(trendMap).map(([date, count]) => ({
      date, count
    }));
    formatted.sort((a, b) => new Date(a.date) - new Date(b.date));
    setTrendData(formatted.slice(-7)); // Last 7 days
  };

  // Pie chart for sentiment ratio
  const prepareSentimentData = (data) => {
    const positive = data.filter(fb => fb.rating >= 4).length;
    const negative = data.filter(fb => fb.rating <= 2).length;
    const neutral = data.filter(fb => fb.rating === 3).length;
    
    const formatted = [
      { name: 'Positive (4-5★)', value: positive, color: '#10B981' },
      { name: 'Neutral (3★)', value: neutral, color: '#F59E0B' },
      { name: 'Negative (1-2★)', value: negative, color: '#EF4444' }
    ];
    setSentimentData(formatted);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10B981';
    if (rating >= 3) return '#F59E0B';
    return '#EF4444';
  };

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <ThumbsUp size={16} />;
    if (rating <= 2) return <ThumbsDown size={16} />;
    return <TrendingUp size={16} />;
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  // Stats calculation
  const stats = {
    total: feedbacks.length,
    average: feedbacks.reduce((acc, fb) => acc + fb.rating, 0) / feedbacks.length || 0,
    positive: feedbacks.filter(fb => fb.rating >= 4).length,
    negative: feedbacks.filter(fb => fb.rating <= 2).length
  };

  return (
    <div className="feedback-monitor">
      {/* Header */}
      <div className="section-header">
        <div className="header-info">
          <h2>Feedback Analytics</h2>
          <p>Monitor user feedback and satisfaction metrics</p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={fetchFeedbacks}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={16} />
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <MessageSquare size={16} />
            Detailed Feedback
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* Stats Cards */}
          <div className="stats-grid">
            <StatCard
              icon={Star}
              title="Total Feedback"
              value={stats.total}
              change="All ratings"
              color="#3B82F6"
            />
            <StatCard
              icon={TrendingUp}
              title="Average Rating"
              value={stats.average.toFixed(1)}
              change="/5 stars"
              color="#10B981"
            />
            <StatCard
              icon={ThumbsUp}
              title="Positive (4-5★)"
              value={stats.positive}
              change={`${Math.round((stats.positive / stats.total) * 100) || 0}%`}
              color="#10B981"
            />
            <StatCard
              icon={ThumbsDown}
              title="Negative (1-2★)"
              value={stats.negative}
              change={`${Math.round((stats.negative / stats.total) * 100) || 0}%`}
              color="#EF4444"
            />
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Rating Distribution */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Rating Distribution</h3>
                <span className="chart-subtitle">User rating frequency</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                  >
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feedback Trend */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Feedback Trend</h3>
                <span className="chart-subtitle">Last 7 days</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8B5CF6" 
                    strokeWidth={3} 
                    dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#7C3AED' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment Ratio */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Sentiment Analysis</h3>
                <span className="chart-subtitle">Rating distribution</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="details-tab">
          {/* Filters */}
          <div className="filters-row">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by Chat ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <Filter size={16} />
              <select 
                value={ratingFilter} 
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Feedback Cards Grid */}
          {isLoading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading feedback data...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} />
              <h3>No Feedback Found</h3>
              <p>{searchTerm || ratingFilter !== 'all' ? 'Try adjusting your filters' : 'No feedback data available yet'}</p>
            </div>
          ) : (
            <div className="feedback-cards-grid">
              {filteredFeedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.feedback_id}
                  feedback={feedback}
                  getRatingColor={getRatingColor}
                  getRatingIcon={getRatingIcon}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
      <Icon size={24} />
    </div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      <div className="stat-change">{change}</div>
    </div>
  </div>
);

// Feedback Card Component (Square Cards)
const FeedbackCard = ({ feedback, getRatingColor, getRatingIcon }) => (
  <div className="feedback-card">
    <div className="card-header">
      <div className="rating-display" style={{ color: getRatingColor(feedback.rating) }}>
        {getRatingIcon(feedback.rating)}
        <span className="rating-text">{feedback.rating}/5</span>
      </div>
      <div className="feedback-id">
        ID: {feedback.feedback_id?.substring(0, 8)}...
      </div>
    </div>

    <div className="card-content">
      <div className="info-row">
        <MessageSquare size={14} />
        <span className="label">Chat ID:</span>
        <span className="value">{feedback.chat_id?.substring(0, 12)}...</span>
      </div>
      
      <div className="info-row">
        <User size={14} />
        <span className="label">Message Index:</span>
        <span className="value">#{feedback.message_index}</span>
      </div>
    </div>

    <div className="card-footer">
      <div className="timestamp">
        <Calendar size={12} />
        <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
      </div>
      <div className={`rating-badge ${feedback.rating >= 4 ? 'positive' : feedback.rating <= 2 ? 'negative' : 'neutral'}`}>
        {feedback.rating} ★
      </div>
    </div>
  </div>
);

export default FeedbackMonitor;