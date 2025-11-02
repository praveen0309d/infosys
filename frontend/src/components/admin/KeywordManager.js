import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  MessageSquare,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../baseurl';
import './KeywordManager.css';

const KeywordManager = () => {
  const [keywords, setKeywords] = useState([]);
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ keyword: '', response: '' });
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch keywords
  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/keywords`);
      setKeywords(res.data);
      setFilteredKeywords(res.data);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    const filtered = keywords.filter(k =>
      k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.responses?.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredKeywords(filtered);
  }, [searchTerm, keywords]);

  // Add new keyword
  const addKeyword = async () => {
    if (!form.keyword.trim() || !form.response.trim()) {
      alert('Please fill both fields');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/admin/keywords`, form);
      setForm({ keyword: '', response: '' });
      setIsAdding(false);
      fetchKeywords();
    } catch (error) {
      console.error('Error adding keyword:', error);
      alert('Error adding keyword');
    }
  };

  // Delete keyword
  const deleteKeyword = async (id) => {
    if (!window.confirm('Are you sure you want to delete this keyword?')) return;

    try {
      await axios.delete(`${API_URL}/api/admin/keywords/${id}`);
      fetchKeywords();
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  };

  // Save edited keyword
  const saveEdit = async (id) => {
    if (!editingKeyword.keyword.trim() || editingKeyword.responses.some(r => !r.trim())) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/admin/keywords/${id}`, {
        keyword: editingKeyword.keyword,
        responses: editingKeyword.responses
      });
      setEditingKeyword(null);
      fetchKeywords();
    } catch (error) {
      console.error('Error updating keyword:', error);
    }
  };

  // Response management in edit mode
  const handleResponseChange = (idx, value) => {
    const updated = { ...editingKeyword };
    updated.responses[idx] = value;
    setEditingKeyword(updated);
  };

  const addNewResponse = () => {
    const updated = { ...editingKeyword };
    updated.responses.push('');
    setEditingKeyword(updated);
  };

  const removeResponse = (idx) => {
    if (editingKeyword.responses.length <= 1) {
      alert('Keyword must have at least one response');
      return;
    }
    
    const updated = { ...editingKeyword };
    updated.responses.splice(idx, 1);
    setEditingKeyword(updated);
  };

  // Copy response to clipboard
  const copyResponse = async (response, keywordId) => {
    try {
      await navigator.clipboard.writeText(response);
      setCopiedId(keywordId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  return (
    <div className="keyword-manager">
      {/* Header */}
      <div className="section-header">
        <div className="header-info">
          <h2>Keyword Management</h2>
          <p>Manage chatbot responses for specific keywords and phrases</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search keywords or responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={18} />
            Add Keyword
          </button>
        </div>
      </div>

      {/* Add Keyword Form */}
      {isAdding && (
        <div className="add-keyword-form">
          <h3>Add New Keyword</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Keyword/Phrase</label>
              <input
                type="text"
                placeholder="e.g., headache, chest pain, exercise advice"
                value={form.keyword}
                onChange={e => setForm({ ...form, keyword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Response</label>
              <textarea
                placeholder="Enter the chatbot's response..."
                value={form.response}
                onChange={e => setForm({ ...form, response: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={addKeyword}>
              <Save size={16} />
              Add Keyword
            </button>
            <button className="btn-cancel" onClick={() => setIsAdding(false)}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keywords List */}
      <div className="keywords-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading keywords...</p>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>No Keywords Found</h3>
            <p>{searchTerm ? 'Try adjusting your search terms' : 'Add your first keyword to get started'}</p>
          </div>
        ) : (
          <div className="keywords-list">
            {filteredKeywords.map(keyword => (
              <KeywordCard
                key={keyword._id}
                keyword={keyword}
                editingKeyword={editingKeyword}
                onEdit={setEditingKeyword}
                onSave={saveEdit}
                onCancel={() => setEditingKeyword(null)}
                onDelete={deleteKeyword}
                onResponseChange={handleResponseChange}
                onAddResponse={addNewResponse}
                onRemoveResponse={removeResponse}
                onCopyResponse={copyResponse}
                copiedId={copiedId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="stats-footer">
        <div className="stat-item">
          <MessageSquare size={16} />
          <span>{keywords.length} Keywords</span>
        </div>
        <div className="stat-item">
          <CheckCircle size={16} />
          <span>{keywords.reduce((acc, k) => acc + (k.responses?.length || 0), 0)} Total Responses</span>
        </div>
      </div>
    </div>
  );
};

// Keyword Card Component
const KeywordCard = ({ 
  keyword, 
  editingKeyword, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onResponseChange, 
  onAddResponse, 
  onRemoveResponse,
  onCopyResponse,
  copiedId
}) => {
  const isEditing = editingKeyword && editingKeyword._id === keyword._id;
  const currentKeyword = isEditing ? editingKeyword : keyword;

  return (
    <div className={`keyword-card ${isEditing ? 'editing' : ''}`}>
      {/* Header */}
      <div className="keyword-header">
        {isEditing ? (
          <input
            className="keyword-input"
            value={currentKeyword.keyword}
            onChange={(e) => onEdit({ ...currentKeyword, keyword: e.target.value })}
            placeholder="Enter keyword..."
          />
        ) : (
          <div className="keyword-title">
            <span className="keyword-text">{keyword.keyword}</span>
            <span className="response-count">
              {keyword.responses?.length || 0} response{keyword.responses?.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        <div className="keyword-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="btn-save-sm" onClick={() => onSave(keyword._id)}>
                <Save size={14} />
                Save
              </button>
              <button className="btn-cancel-sm" onClick={onCancel}>
                <X size={14} />
                Cancel
              </button>
            </div>
          ) : (
            <div className="view-actions">
              <button 
                className="btn-edit"
                onClick={() => onEdit({...keyword})}
                title="Edit Keyword"
              >
                <Edit3 size={14} />
              </button>
              <button 
                className="btn-delete"
                onClick={() => onDelete(keyword._id)}
                title="Delete Keyword"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responses */}
      <div className="responses-section">
        {isEditing ? (
          <div className="editing-responses">
            {currentKeyword.responses?.map((response, idx) => (
              <div key={idx} className="response-editor">
                <textarea
                  value={response}
                  onChange={(e) => onResponseChange(idx, e.target.value)}
                  placeholder="Enter response text..."
                  rows={2}
                />
                <button 
                  className="btn-remove-response"
                  onClick={() => onRemoveResponse(idx)}
                  disabled={currentKeyword.responses.length <= 1}
                  title="Remove response"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button className="btn-add-response" onClick={onAddResponse}>
              <Plus size={14} />
              Add Another Response
            </button>
          </div>
        ) : (
          <div className="response-list">
            {keyword.responses?.map((response, idx) => (
              <div key={idx} className="response-item">
                <div className="response-text">{response}</div>
                <button 
                  className={`btn-copy ${copiedId === keyword._id ? 'copied' : ''}`}
                  onClick={() => onCopyResponse(response, keyword._id)}
                  title="Copy to clipboard"
                >
                  {copiedId === keyword._id ? <CheckCircle size={12} /> : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="keyword-footer">
        <span className="create-date">
          Created: {new Date(keyword.created_at).toLocaleDateString()}
        </span>
        {keyword.updated_at && (
          <span className="update-date">
            Updated: {new Date(keyword.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default KeywordManager;