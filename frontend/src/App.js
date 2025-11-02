import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import './App.css';
import ChatbotPage from './components/Chatbot';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const getUserRole = () => {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).role;
    }
    return null;
  };

  return (
    <Router>
      <div className="App">
        <Routes>

          {/* ---------- LOGIN ---------- */}
          <Route
            path="/login"
            element={!isAuthenticated() ? <Login /> : (
              getUserRole() === 'admin'
                ? <Navigate to="/admindashboard" />
                : <Navigate to="/dashboard" />
            )}
          />

          {/* ---------- SIGNUP ---------- */}
          <Route
            path="/signup"
            element={!isAuthenticated() ? <Signup /> : <Navigate to="/dashboard" />}
          />

          {/* ---------- PATIENT DASHBOARD ---------- */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated()
                ? (getUserRole() === 'patient'
                    ? <Dashboard />
                    : <Navigate to="/admindashboard" />)
                : <Navigate to="/login" />
            }
          />

          {/* ---------- ADMIN DASHBOARD ---------- */}
<Route
  path="/admindashboard"
  element={
    isAuthenticated()
      ? (getUserRole() === 'admin'
          ? <AdminDashboard />
          : <Navigate to="/dashboard" />)
      : <Navigate to="/login" />
  }
/>


          {/* ---------- CHATBOT ---------- */}
          <Route path="/chatbot" element={<ChatbotPage />} />

          {/* ---------- DEFAULT ---------- */}
          <Route path="/" element={<Navigate to="/login" />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
