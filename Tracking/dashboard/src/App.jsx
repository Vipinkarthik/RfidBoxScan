import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import IntermediatePage from './components/IntermediatePage';
import SmartBoxDashboard from './components/SmartBoxDashboard';
import MonitoringPage from './components/MonitoringPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
  <Route path="/intermediate" element={<IntermediatePage />} />
  <Route path="/dashboard" element={<SmartBoxDashboard />} />
  <Route path="/monitoring" element={<MonitoringPage/>}/>
      </Routes>
    </Router>
  );
}

export default App
