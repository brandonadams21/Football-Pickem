import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameList from './components/GameList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import Scoreboard from './components/Scoreboard';
import AdminViewPicks from './components/AdminViewPicks';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import { useLoggedIn } from './context/LoggedInContext'; // Context for logged-in state
import AuthRedirect from './context/AuthRedirect'; // Your redirect component

function App() {
  const { usertype } = useLoggedIn(); // Access the current user from the context

  return (
    <GeistProvider>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Route: Admin Dashboard */}
            <Route 
              path="/admin-dashboard" 
              element={usertype === 'admin' ? <AdminDashboard /> : <AuthRedirect />} 
            />

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
