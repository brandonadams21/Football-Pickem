import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameList from './components/GameList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import Scoreboard from './components/Scoreboard';
import AdminViewPicks from './components/AdminViewPicks';
import Navbar from './components/Navbar';

function App() {
  return (
    <GeistProvider>
      <CssBaseline />
      <Router>
        <div className="App">
      <Navbar />
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/nfl" element={<Scoreboard league="nfl" />} />
            <Route path="/college" element={<Scoreboard league="college" />} />
            <Route path="/picks" element={<AdminViewPicks />} />
          </Routes>
        </div>
      </Router>
    </GeistProvider>
  );
}

export default App;
