import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import './index.css';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          <Route 
            path="/signup" 
            element={!token ? <Signup /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/login" 
            element={!token ? <Login /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/forgot-password" 
            element={!token ? <ForgotPassword /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/home" 
            element={token ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={token ? "/home" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;