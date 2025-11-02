import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  X, 
  Trash2, 
  User, 
  ArrowLeft,
  Send,
  Bot,
  Sparkles,
  Shield,
  Zap,
  Stethoscope,
  Pill,
  Utensils,
  Dumbbell,
  Moon,
  Brain,
  Calendar,
  AlertTriangle,
  Loader2,
  Volume2,
  VolumeX,
  Heart,
  TrendingUp,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import API_URL from '../baseurl';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [speechInstance, setSpeechInstance] = useState(null);
  const [userEmotion, setUserEmotion] = useState('neutral');
  const [symptomSeverity, setSymptomSeverity] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(null);
  const [healthAnalytics, setHealthAnalytics] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // axios interceptor for authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?.id) {
      loadChatHistory();
      loadHealthAnalytics();
    }
  }, [user?.id]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/history?user_id=${user.id}`);
      setChatHistory(response.data.chats || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const loadHealthAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/health`);
      setHealthAnalytics(response.data);
    } catch (error) {
      console.error('Error loading health analytics:', error);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/${chatId}`);
      setMessages(response.data.messages || []);
      setCurrentChatId(chatId);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat/send`, {
        user_id: user.id,
        message: inputMessage,
        chat_id: currentChatId
      });

      const botMessage = {
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        emotion: response.data.emotion,
        entities: response.data.entities,
        severity_score: response.data.severity_score,
        language: response.data.language
      };

      setMessages([...updatedMessages, botMessage]);
      setCurrentChatId(response.data.chat_id);
      setUserEmotion(response.data.emotion);
      setSymptomSeverity(response.data.severity_score);
      
      await loadChatHistory();
      await loadHealthAnalytics();

      // Auto-show appointment modal for high severity
      if (response.data.severity_score >= 7) {
        setTimeout(() => setShowAppointmentModal(true), 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMessage]);
      
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInputMessage('');
    setUserEmotion('neutral');
    setSymptomSeverity(0);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    stopSpeaking();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/search?user_id=${user.id}&q=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await axios.delete(`${API_URL}/api/chat/${chatId}`);
        await loadChatHistory();
        if (currentChatId === chatId) {
          handleNewChat();
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };


const handleFeedback = async (messageIndex, rating, comments = '') => {
  // Prevent duplicate feedback for the same message
  if (feedbackGiven[messageIndex]) return;

  try {
    await axios.post(`${API_URL}/api/chat/feedback`, {
      chat_id: currentChatId,
      message_index: messageIndex,
      rating: rating,
      comments: comments
    });

    // Update only the clicked message feedback
    setFeedbackGiven(prev => ({
      ...prev,
      [messageIndex]: rating
    }));
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
};


  const handleBookAppointment = async (appointmentData) => {
    try {
      const response = await axios.post(`${API_URL}/api/appointment/book`, appointmentData);
      setShowAppointmentModal(false);
      // Add confirmation message to chat
      const confirmationMessage = {
        text: `Appointment request submitted! Your reference ID: ${response.data.appointment_id}. We'll contact you shortly.`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  const handleAddMedication = async (medicationData) => {
    try {
      const response = await axios.post(`${API_URL}/api/medication/reminder`, medicationData);
      setShowMedicationModal(false);
      // Add confirmation message to chat
      const confirmationMessage = {
        text: `Medication reminder set for ${medicationData.name}! You'll receive reminders as scheduled.`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  // Text-to-Speech function
  const speakText = (text, language = selectedLanguage) => {
    stopSpeaking();

    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance();
      
      const languageMap = {
        'en': 'en-US',
        'ta': 'ta-IN',
        'hi': 'hi-IN'
      };
      
      speech.text = text;
      speech.lang = languageMap[language] || 'en-US';
      speech.rate = 0.8;
      speech.pitch = 1;
      speech.volume = 1;

      speech.onstart = () => {
        setIsSpeaking(true);
        setSpeechInstance(speech);
      };

      speech.onend = () => {
        setIsSpeaking(false);
        setSpeechInstance(null);
      };

      speech.onerror = () => {
        setIsSpeaking(false);
        setSpeechInstance(null);
        console.error('Speech synthesis error');
      };

      window.speechSynthesis.speak(speech);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechInstance(null);
    }
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(text);
    }
  };

  const quickActions = [
    { 
      icon: Stethoscope, 
      title: 'Symptom Checker', 
      prompt: 'I have some symptoms I want to discuss',
    },
    { 
      icon: Pill, 
      title: 'Medication Info', 
      prompt: 'Tell me about medications for common conditions',
    },
    { 
      icon: Utensils, 
      title: 'Nutrition Advice', 
      prompt: 'I need nutrition and diet advice for better health',
    },
    { 
      icon: Dumbbell, 
      title: 'Exercise Plan', 
      prompt: 'Help me create an exercise routine for weight loss',
    },
    { 
      icon: Moon, 
      title: 'Sleep Issues', 
      prompt: 'I\'m having trouble with sleep and fatigue',
    },
    { 
      icon: Brain, 
      title: 'Mental Health', 
      prompt: 'I need mental health support and coping strategies',
    },
    { 
      icon: Calendar, 
      title: 'Book Appointment', 
      prompt: 'How can I book an appointment with a doctor?',
    },
    { 
      icon: AlertTriangle, 
      title: 'Emergency Help', 
      prompt: 'I need emergency medical advice right now',
    }
  ];

  const handleQuickAction = (prompt) => {
    setInputMessage(prompt);
    setTimeout(() => {
      document.querySelector('.message-input')?.focus();
    }, 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (score) => {
    if (score >= 8) return '#dc2626';
    if (score >= 5) return '#f59e0b';
    return '#10b981';
  };

  const getEmotionIcon = (emotion) => {
    const emotionIcons = {
      happy: '😊',
      sad: '😔',
      distressed: '😥',
      calm: '😌',
      neutral: '😐'
    };
    return emotionIcons[emotion] || '😐';
  };

  return (
    <div className="chatbot-page">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`chatbot-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Health Overview Card */}

        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={18} className="plus-icon" />
          <span>New chat</span>
          <span className="new-chat-shortcut">⌘N</span>
        </button>

        {/* Search Chats */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <Loader2 size={16} className="search-spinner" />
              )}
            </div>
          </form>
        </div>

        {/* Search Results or Recent Chats */}
        <div className="chats-section">
          <div className="section-header">
            <h3>{searchQuery ? 'Search Results' : 'Recent chats'}</h3>
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="chats-list">
            {(searchQuery ? searchResults : chatHistory).map((chat) => (
              <div 
                key={chat.chat_id || chat.id}
                className={`chat-item ${currentChatId === (chat.chat_id || chat.id) ? 'active' : ''}`}
                onClick={() => loadChat(chat.chat_id || chat.id)}
              >
                <MessageSquare size={16} className="chat-icon" />
                <div className="chat-info">
                  <div className="chat-title">
                    {chat.title || 'New Chat'}
                  </div>
                  <div className="chat-preview">
                    {searchQuery ? chat.preview : chat.last_message}
                  </div>
                  <div className="chat-meta">
                    {formatDate(chat.updated_at)}
                    {chat.message_count && ` • ${chat.message_count} messages`}
                    {searchQuery && chat.match_count > 0 && ` • ${chat.match_count} matches`}
                  </div>
                </div>
                <button 
                  className="delete-chat-btn"
                  onClick={(e) => handleDeleteChat(chat.chat_id || chat.id, e)}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {!searchQuery && chatHistory.length === 0 && (
              <div className="empty-state">
                <MessageSquare size={32} className="empty-icon" />
                <p>No chats yet</p>
                <p>Start a new conversation!</p>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="empty-state">
                <Search size={32} className="empty-icon" />
                <p>No results found for "{searchQuery}"</p>
                <p>Try different keywords</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="user-profile-section">
          <div className="user-profile">
            <div className="avatar-small">
              {user.name?.charAt(0)?.toUpperCase() || <User size={14} />}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name || 'User'}</div>
              <div className="user-plan">Premium Health</div>
            </div>
          </div>
          <button 
            className="back-to-dashboard"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chatbot-main">
        {/* Header */}
        <div className="chat-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <MessageSquare size={20} />
          </button>
          <div className="header-title">
            <h1>Wellness Assistant</h1>
            <p>Your AI health companion</p>
          </div>
          <div className="header-actions">
            {/* Emotion & Severity Indicators */}
            {messages.length > 0 && (
              <div className="health-indicators">
                {userEmotion && userEmotion !== 'neutral' && (
                  <div className="emotion-indicator">
                    <span className="emotion-emoji">{getEmotionIcon(userEmotion)}</span>
                    <span className="emotion-text">{userEmotion}</span>
                  </div>
                )}
                {symptomSeverity > 0 && (
                  <div 
                    className="severity-indicator"
                    style={{ color: getSeverityColor(symptomSeverity) }}
                  >
                    <AlertTriangle size={14} />
                    <span>Severity: {symptomSeverity}/10</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-center">
              <div className="welcome-content">
                <div className="welcome-icon">
                  <Bot size={64} />
                </div>
                <h1 className="welcome-title">How can I help you today?</h1>
                <p className="welcome-subtitle">Ask me anything about health, wellness, or medical concerns</p>
                
                <div className="quick-actions-grid">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <button 
                        key={index}
                        className="quick-action-card"
                        onClick={() => handleQuickAction(action.prompt)}
                        style={{ '--action-color': action.color }}
                      >
                        <div className="action-icon" style={{ backgroundColor: action.color }}>
                          <IconComponent size={20} />
                        </div>
                        <div className="action-title">{action.title}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="welcome-features">
                  <div className="feature-item">
                    <Shield size={16} className="feature-icon" />
                    <span>Private and secure</span>
                  </div>
                  <div className="feature-item">
                    <Sparkles size={16} className="feature-icon" />
                    <span>AI-powered insights</span>
                  </div>
                  <div className="feature-item">
                    <Zap size={16} className="feature-icon" />
                    <span>Instant answers</span>
                  </div>
                  <div className="feature-item">
                    <Heart size={16} className="feature-icon" />
                    <span>Health tracking</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-list">
{messages.map((message, index) => (
  <div
    key={index}
    className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
  >
    <div className="message-content">

      {/* ENTITY TAGS */}
      {message.sender === 'bot' && message.entities && message.entities.length > 0 && (
        <div className="entities-tags">
          {message.entities.slice(0, 3).map((entity, idx) => (
            <span key={idx} className="entity-tag">{entity}</span>
          ))}
        </div>
      )}

      {/* MESSAGE TEXT */}
<div
  className="message-text"
  dangerouslySetInnerHTML={{
    __html: message.text
      .replace(/\n/g, '<br>')
      .replace(/\*(.*?)\*/g, '<b>$1</b>')
      .replace(/🔍/g, '<span class="emoji">🔍</span>')
      .replace(/⚕️/g, '<span class="emoji">⚕️</span>')
  }}
/>



      {/* MESSAGE ACTIONS */}
      <div className="message-actions">
        {message.sender === 'bot' && (
          <>
            {/* SPEAK BUTTON */}
            <button
              className="speak-btn"
              onClick={() => toggleSpeech(message.text)}
              title={isSpeaking ? 'Stop speaking' : 'Read this message'}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* FEEDBACK BUTTONS */}
            <div className="feedback-options">
              <button
                className={`thumb-btn ${feedbackGiven[index] === 5 ? 'active' : ''}`}
                onClick={() => handleFeedback(index, 5)}
                disabled={!!feedbackGiven[index]}
                title="Helpful"
              >
                <ThumbsUp size={18} />
              </button>

              <button
                className={`thumb-btn ${feedbackGiven[index] === 1 ? 'active' : ''}`}
                onClick={() => handleFeedback(index, 1)}
                disabled={!!feedbackGiven[index]}
                title="Not helpful"
              >
                <ThumbsDown size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* TIMESTAMP & SEVERITY */}
      <div className="message-time">
        {formatDate(message.timestamp)}
        {message.severity_score > 0 && (
          <span 
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(message.severity_score) }}
          >
            Severity: {message.severity_score}/10
          </span>
        )}
      </div>

    </div>
  </div>
))}


              
              {isLoading && (
                <div className="message bot-message">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <Loader2 size={16} className="spinner" />
                      {/* <span>typing...</span> */}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="input-section">
          <form onSubmit={handleSendMessage} className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Message Wellness Assistant..."
                className="message-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default ChatbotPage;