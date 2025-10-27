import React, { useState } from 'react';
import './HealthRecordsSection.css';

const HealthRecordsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const records = [
    {
      id: 1,
      title: 'Medical History',
      description: 'Complete medical history and past conditions',
      category: 'history',
      date: '2024-01-15',
      type: 'document',
      icon: '📋'
    },
    {
      id: 2,
      title: 'Lab Results - Blood Test',
      description: 'Complete blood count and metabolic panel',
      category: 'labs',
      date: '2024-01-10',
      type: 'result',
      icon: '🧪'
    },
    {
      id: 3,
      title: 'Vaccination Records',
      description: 'Immunization history and vaccination schedule',
      category: 'vaccinations',
      date: '2023-12-20',
      type: 'record',
      icon: '💉'
    },
    {
      id: 4,
      title: 'Current Prescriptions',
      description: 'Active medications and dosage instructions',
      category: 'medications',
      date: '2024-01-12',
      type: 'prescription',
      icon: '💊'
    },
    {
      id: 5,
      title: 'MRI Scan Report',
      description: 'Brain MRI imaging and radiologist report',
      category: 'imaging',
      date: '2023-11-30',
      type: 'report',
      icon: '🖼️'
    },
    {
      id: 6,
      title: 'Allergy Information',
      description: 'Documented allergies and adverse reactions',
      category: 'allergies',
      date: '2024-01-05',
      type: 'information',
      icon: '⚠️'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Records', count: records.length },
    { id: 'labs', name: 'Lab Results', count: records.filter(r => r.category === 'labs').length },
    { id: 'history', name: 'Medical History', count: records.filter(r => r.category === 'history').length },
    { id: 'medications', name: 'Prescriptions', count: records.filter(r => r.category === 'medications').length },
    { id: 'imaging', name: 'Imaging', count: records.filter(r => r.category === 'imaging').length }
  ];

  const filteredRecords = activeCategory === 'all' 
    ? records 
    : records.filter(record => record.category === activeCategory);

  return (
    <div className="health-records-section">
      <div className="section-header">
        <div>
          <h1>Health Records</h1>
          <p>Access and manage your complete health information</p>
        </div>
        <button className="primary-btn large">
          Upload New Record
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-name">{category.name}</span>
            <span className="category-count">{category.count}</span>
          </button>
        ))}
      </div>

      {/* Records Grid */}
      <div className="records-grid">
        {filteredRecords.map(record => (
          <div key={record.id} className="record-card">
            <div className="record-header">
              <div className="record-icon">{record.icon}</div>
              <div className="record-info">
                <h3>{record.title}</h3>
                <p>{record.description}</p>
              </div>
              <div className="record-date">
                {record.date}
              </div>
            </div>
            <div className="record-actions">
              <button className="action-btn primary">View</button>
              <button className="action-btn secondary">Download</button>
              <button className="action-btn outline">Share</button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">👁️</div>
            <div className="activity-content">
              <p><strong>Lab results</strong> viewed by Dr. Smith</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📤</div>
            <div className="activity-content">
              <p><strong>Medical history</strong> shared with Specialist</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">➕</div>
            <div className="activity-content">
              <p><strong>New prescription</strong> added to your records</p>
              <span className="activity-time">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordsSection;