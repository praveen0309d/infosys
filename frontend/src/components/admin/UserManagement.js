import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../baseurl';
import './UserManagement.css';

const UserManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [editPatient, setEditPatient] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    age: '', 
    gender: '', 
    phone: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch data
  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/users/pending`);
      setPendingUsers(res.data);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/patients`);
      setPatients(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchPatients();
  }, []);

  // User approval actions
  const approveUser = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/approve/${id}`);
      fetchPendingUsers();
      fetchPatients();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const rejectUser = async (id) => {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/admin/users/reject/${id}`);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  // Patient management
  const deletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/admin/patients/${id}`);
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const handleEdit = (patient) => {
    setEditPatient(patient._id);
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      age: patient.age || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
    });
  };

  const saveChanges = async () => {
    try {
      await axios.put(`${API_URL}/api/admin/patients/${editPatient}`, formData);
      setEditPatient(null);
      fetchPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const cancelEdit = () => {
    setEditPatient(null);
    setFormData({ name: '', email: '', age: '', gender: '', phone: '' });
  };

  // Filter and search
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'approved' && patient.is_approved) ||
      (filterStatus === 'pending' && !patient.is_approved);
    
    return matchesSearch && matchesFilter;
  });

  const refreshData = () => {
    fetchPendingUsers();
    fetchPatients();
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-info">
          <h2>User Management</h2>
          <p>Manage user approvals and patient records</p>
        </div>
        <button className="refresh-btn" onClick={refreshData} disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Users size={16} />
            Pending Users ({pendingUsers.length})
          </button>
          <button
            className={`tab ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <UserCheck size={16} />
            All Patients ({patients.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="tab-content">
        {/* Pending Users Tab */}
        {activeTab === 'pending' && (
          <div className="pending-users">
            {isLoading ? (
              <div className="loading-state">
                <RefreshCw size={24} className="spinning" />
                <p>Loading pending users...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} />
                <h3>No Pending Users</h3>
                <p>All registration requests have been processed</p>
              </div>
            ) : (
              <div className="users-grid">
                {pendingUsers.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    onApprove={approveUser}
                    onReject={rejectUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="patients-section">
            {/* Search and Filter */}
            <div className="controls-row">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <Filter size={16} />
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <RefreshCw size={24} className="spinning" />
                <p>Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                <UserCheck size={48} />
                <h3>No Patients Found</h3>
                <p>{searchTerm ? 'Try adjusting your search terms' : 'No patients registered yet'}</p>
              </div>
            ) : (
              <div className="patients-table-container">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Contact</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <PatientRow
                        key={patient._id}
                        patient={patient}
                        onEdit={handleEdit}
                        onDelete={deletePatient}
                        isEditing={editPatient === patient._id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit Modal */}
            {editPatient && (
              <div className="edit-modal-overlay">
                <div className="edit-modal">
                  <h3>Edit Patient Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Enter age"
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn-primary" onClick={saveChanges}>
                      Save Changes
                    </button>
                    <button className="btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// User Card Component
const UserCard = ({ user, onApprove, onReject }) => (
  <div className="user-card">
    <div className="user-avatar">
      <Users size={20} />
    </div>
    <div className="user-info">
      <h4>{user.name || 'Unknown User'}</h4>
      <p className="user-email">{user.email}</p>
      <div className="user-meta">
        <span>Registered: {new Date(user.created_at).toLocaleDateString()}</span>
      </div>
    </div>
    <div className="user-actions">
      <button 
        className="btn-success" 
        onClick={() => onApprove(user._id)}
        title="Approve User"
      >
        <CheckCircle size={16} />
        Approve
      </button>
      <button 
        className="btn-danger" 
        onClick={() => onReject(user._id)}
        title="Reject User"
      >
        <XCircle size={16} />
        Reject
      </button>
    </div>
  </div>
);

// Patient Row Component
const PatientRow = ({ patient, onEdit, onDelete, isEditing }) => (
  <tr className={isEditing ? 'editing' : ''}>
    <td>
      <div className="patient-info">
        <div className="patient-avatar">
          <UserCheck size={16} />
        </div>
        <div>
          <div className="patient-name">{patient.name || 'Unknown'}</div>
          <div className="patient-email">{patient.email}</div>
        </div>
      </div>
    </td>
    <td>
      <div className="contact-info">
        {patient.phone && (
          <div className="phone">{patient.phone}</div>
        )}
      </div>
    </td>
    <td>
      <div className="patient-details">
        {patient.age && <span>Age: {patient.age}</span>}
        {patient.gender && <span>Gender: {patient.gender}</span>}
      </div>
    </td>
    <td>
      <span className={`status-badge ${patient.is_approved ? 'approved' : 'pending'}`}>
        {patient.is_approved ? 'Approved' : 'Pending'}
      </span>
    </td>
    <td>
      <div className="action-buttons">
        <button 
          className="btn-edit"
          onClick={() => onEdit(patient)}
          title="Edit Patient"
        >
          <Edit3 size={14} />
        </button>
        <button 
          className="btn-delete"
          onClick={() => onDelete(patient._id)}
          title="Delete Patient"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </td>
  </tr>
);

export default UserManagement;