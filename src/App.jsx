import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import Policies from './pages/Policies';
import Policyholders from './pages/Policyholders';

// A simple PrivateRoute component to protect routes.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/claims" element={<PrivateRoute><Claims /></PrivateRoute>} />
        <Route path="/policies" element={<PrivateRoute><Policies /></PrivateRoute>} />
        <Route path="/policyholders" element={<PrivateRoute><Policyholders /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;