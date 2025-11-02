import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  MessageSquare, 
  TrendingUp, 
  Star, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  Meh,
  Calendar,
  Download
} from 'lucide-react';
import API_URL from '../../baseurl';
import './AdminFeedbackAnalytics.css';

const AdminFeedbackAnalytics = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  useEffect(() => {
    fetchFeedbacks();
  }, [timeRange]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/text_feedbacks`);
      const data = await res.json();
      setFeedbacks(data);
      generateChartData(data);
      generateTimeSeriesData(data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (data) => {
    const positive = data.filter(f => f.rating >= 4).length;
    const neutral = data.filter(f => f.rating === 3).length;
    const negative = data.filter(f => f.rating <= 2).length;
    const avgRating = data.length ? (data.reduce((sum, f) => sum + f.rating, 0) / data.length).toFixed(1) : 0;
    const total = data.length;

    setChartData([
      { name: 'Positive', count: positive, color: '#10B981' },
      { name: 'Neutral', count: neutral, color: '#F59E0B' },
      { name: 'Negative', count: negative, color: '#EF4444' },
      { name: 'Average', count: parseFloat(avgRating), color: '#3B82F6' },
      { name: 'Total', count: total, color: '#8B5CF6' }
    ]);

    // Rating distribution for pie chart
    const ratingDist = [1, 2, 3, 4, 5].map(rating => ({
      name: `${rating} Star${rating > 1 ? 's' : ''}`,
      value: data.filter(f => f.rating === rating).length,
      rating: rating
    }));
    setRatingDistribution(ratingDist);
  };

  const generateTimeSeriesData = (data) => {
    // Mock time series data - replace with actual date-based aggregation
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        feedbacks: Math.floor(Math.random() * 10) + 1,
        avgRating: parseFloat((Math.random() * 2 + 3).toFixed(1))
      };
    }).reverse();

    setTimeSeriesData(last7Days);
  };

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <ThumbsUp size={16} className="textfe_icon-positive" />;
    if (rating === 3) return <Meh size={16} className="textfe_icon-neutral" />;
    return <ThumbsDown size={16} className="textfe_icon-negative" />;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10B981';
    if (rating === 3) return '#F59E0B';
    return '#EF4444';
  };

  const exportToCSV = () => {
    const headers = ['User Name', 'Rating', 'Feedback', 'Date'];
    const csvData = feedbacks.map(f => [
      f.user_name,
      f.rating,
      `"${f.feedback.replace(/"/g, '""')}"`,
      new Date(f.created_at).toLocaleString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="textfe_loading">
        <div className="textfe_spinner"></div>
        <p>Loading feedback analytics...</p>
      </div>
    );
  }

  return (
    <div className="textfe_container">
      {/* Header */}
      <div className="textfe_header">
        <div className="textfe_header-content">
          <MessageSquare size={32} className="textfe_header-icon" />
          <div>
            <h1 className="textfe_title">Feedback Analytics Dashboard</h1>
            <p className="textfe_subtitle">Comprehensive overview of user feedback and ratings</p>
          </div>
        </div>
        <div className="textfe_header-actions">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="textfe_time-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
          <button className="textfe_export-btn" onClick={exportToCSV}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="textfe_summary-grid">
        <div className="textfe_summary-card textfe_card-positive">
          <div className="textfe_summary-icon">
            <ThumbsUp size={24} />
          </div>
          <div className="textfe_summary-content">
            <h3>Positive Feedback</h3>
            <div className="textfe_summary-value">
              {chartData.find(d => d.name === 'Positive')?.count || 0}
            </div>
            <div className="textfe_summary-label">Rating 4-5 Stars</div>
          </div>
        </div>

        <div className="textfe_summary-card textfe_card-neutral">
          <div className="textfe_summary-icon">
            <Meh size={24} />
          </div>
          <div className="textfe_summary-content">
            <h3>Neutral Feedback</h3>
            <div className="textfe_summary-value">
              {chartData.find(d => d.name === 'Neutral')?.count || 0}
            </div>
            <div className="textfe_summary-label">3 Stars</div>
          </div>
        </div>

        <div className="textfe_summary-card textfe_card-negative">
          <div className="textfe_summary-icon">
            <ThumbsDown size={24} />
          </div>
          <div className="textfe_summary-content">
            <h3>Negative Feedback</h3>
            <div className="textfe_summary-value">
              {chartData.find(d => d.name === 'Negative')?.count || 0}
            </div>
            <div className="textfe_summary-label">Rating 1-2 Stars</div>
          </div>
        </div>

        <div className="textfe_summary-card textfe_card-total">
          <div className="textfe_summary-icon">
            <Users size={24} />
          </div>
          <div className="textfe_summary-content">
            <h3>Total Feedback</h3>
            <div className="textfe_summary-value">
              {chartData.find(d => d.name === 'Total')?.count || 0}
            </div>
            <div className="textfe_summary-label">All Ratings</div>
          </div>
        </div>

        <div className="textfe_summary-card textfe_card-rating">
          <div className="textfe_summary-icon">
            <Star size={24} />
          </div>
          <div className="textfe_summary-content">
            <h3>Average Rating</h3>
            <div className="textfe_summary-value">
              {chartData.find(d => d.name === 'Average')?.count || 0}
            </div>
            <div className="textfe_summary-label">Out of 5 Stars</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="textfe_charts-grid">
        {/* Feedback Distribution Bar Chart */}
        <div className="textfe_chart-card">
          <div className="textfe_chart-header">
            <h3>Feedback Distribution</h3>
            <p>Breakdown of feedback by sentiment</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.filter(d => !['Average', 'Total'].includes(d.name))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              >
                {chartData.filter(d => !['Average', 'Total'].includes(d.name)).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution Pie Chart */}
        <div className="textfe_chart-card">
          <div className="textfe_chart-header">
            <h3>Rating Distribution</h3>
            <p>Spread of star ratings</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ratingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Time Series Chart */}
        <div className="textfe_chart-card">
          <div className="textfe_chart-header">
            <h3>Feedback Trends</h3>
            <p>Daily feedback volume and ratings</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="feedbacks" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Feedback Count"
                dot={{ fill: '#3B82F6' }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgRating" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Avg Rating"
                strokeDasharray="3 3"
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="textfe_table-card">
        <div className="textfe_table-header">
          <h3>Recent Text Feedbacks</h3>
          <p>Detailed view of individual feedback entries</p>
        </div>
        <div className="textfe_table-container">
          <table className="textfe_table">
            <thead>
              <tr>
                <th>User</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length > 0 ? (
                feedbacks.map((feedback) => (
                  <tr key={feedback._id} className="textfe_table-row">
                    <td className="textfe_table-user">
                      <div className="textfe_user-info">
                        <Users size={14} />
                        <span>{feedback.user_name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="textfe_table-rating">
                      <div 
                        className="textfe_rating-badge"
                        style={{ backgroundColor: getRatingColor(feedback.rating) }}
                      >
                        {getRatingIcon(feedback.rating)}
                        <span>{feedback.rating}/5</span>
                      </div>
                    </td>
                    <td className="textfe_table-feedback">
                      <div className="textfe_feedback-text">
                        {feedback.feedback}
                      </div>
                    </td>
                    <td className="textfe_table-date">
                      <div className="textfe_date-info">
                        <Calendar size={12} />
                        <span>{new Date(feedback.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="textfe_table-empty">
                    <MessageSquare size={32} />
                    <p>No feedback available yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackAnalytics;