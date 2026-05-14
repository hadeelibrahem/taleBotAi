import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../styles/index.css'; 
import LandingPage from './LandingPage';
import AboutUs from './AboutUs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;