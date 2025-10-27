import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard.js';
import './App.css';
import ChatbotPage from './components/Chatbot';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/signup" 
            element={!isAuthenticated() ? <Signup /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;