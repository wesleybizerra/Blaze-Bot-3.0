import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import HistoryPage from './pages/History';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;