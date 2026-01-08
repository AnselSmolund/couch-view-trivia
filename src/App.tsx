import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LobbyPage from './components/LobbyPage';
import TriviaPage from './components/TriviaPage';
import AdminPage from './components/AdminPage';
import LeaderboardPage from './components/LeaderboardPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/trivia" element={<TriviaPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;