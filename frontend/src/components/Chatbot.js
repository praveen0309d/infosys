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
  VolumeX
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
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en', 'ta', 'hi'
  const [speechInstance, setSpeechInstance] = useState(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?.id) {
      loadChatHistory();
    }
  }, [user?.id]);

  // Clean up speech synthesis on unmount
// Clean up speech synthesis on unmount
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
        timestamp: new Date().toISOString()
      };

      setMessages([...updatedMessages, botMessage]);
      setCurrentChatId(response.data.chat_id);
      await loadChatHistory();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInputMessage('');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    // Stop any ongoing speech
    if (speechInstance) {
      speechInstance.cancel();
      setIsSpeaking(false);
    }
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

  // Text-to-Speech function
// Text-to-Speech function
const speakText = (text, language = selectedLanguage) => {
  // Stop any ongoing speech
  stopSpeaking();

  if ('speechSynthesis' in window) {
    const speech = new SpeechSynthesisUtterance();
    
    // Set language based on selection
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
    { icon: Stethoscope, title: 'Symptom Checker', prompt: 'I have some symptoms I want to discuss' },
    { icon: Pill, title: 'Medication Info', prompt: 'Tell me about medications for' },
    { icon: Utensils, title: 'Nutrition Advice', prompt: 'I need nutrition and diet advice' },
    { icon: Dumbbell, title: 'Exercise Plan', prompt: 'Help me create an exercise routine' },
    { icon: Moon, title: 'Sleep Issues', prompt: 'I\'m having trouble with sleep' },
    { icon: Brain, title: 'Mental Health', prompt: 'I need mental health support' },
    { icon: Calendar, title: 'Book Appointment', prompt: 'How can I book an appointment?' },
    { icon: AlertTriangle, title: 'Emergency Help', prompt: 'I need emergency medical advice' }
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
              <div className="user-plan"></div>
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
            {/* Language Selector and TTS Controls */}
            {messages.length > 0 && (
              <div className="tts-controls">
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="language-select"
                  disabled={isSpeaking}
                >
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="hi">Hindi</option>
                </select>
                <button 
                  className={`header-btn tts-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => {
                    const lastBotMessage = [...messages].reverse().find(msg => msg.sender === 'bot');
                    if (lastBotMessage) {
                      toggleSpeech(lastBotMessage.text);
                    }
                  }}
                  disabled={!messages.some(msg => msg.sender === 'bot')}
                  title={isSpeaking ? 'Stop speaking' : 'Read last message'}
                >
                  {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            )}
            <button 
              className="header-btn new-chat-header-btn"
              onClick={handleNewChat}
              title="New Chat"
            >
              <Plus size={20} />
            </button>
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
                      >
                        <div className="action-icon">
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
                    <span>Knowledgeable responses</span>
                  </div>
                  <div className="feature-item">
                    <Zap size={16} className="feature-icon" />
                    <span>Instant answers</span>
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
                    <div className="message-text">{message.text}</div>
                    <div className="message-actions">
                      {message.sender === 'bot' && (
<button
  className="speak-btn"
  onClick={() => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(message.text);
    }
  }}
  title={isSpeaking ? 'Stop speaking' : 'Read this message'}
>
  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
</button>
                      )}
                    </div>
                    <div className="message-time">
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot-message">
                  <div className="message-content">
                    <div className="message-content">
                      <Loader2 size={16} className="spinner" />
                      <span>Wellness Assistant is thinking...</span>
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
                <Send size={16} />
              </button>
            </div>
            <div className="input-footer">
              <p>Wellness Assistant can make mistakes. Consider checking important information.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;