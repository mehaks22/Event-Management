import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store/store';
import { Navbar } from './components/Navigation';

// Import Views / Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './components/EventList';

export const App: React.FC = () => {
  const token = localStorage.getItem('token');

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route
                path="/register"
                element={<Register onSuccess={() => (window.location.href = '/login')} />}
              />

              {/* Main Dashboard */}
              <Route path="/events" element={<EventList />} />

              {/* Dynamic Root & Catch-all */}
              <Route
                path="/"
                element={token ? <Navigate to="/events" replace /> : <Navigate to="/login" replace />}
              />
              <Route
                path="*"
                element={token ? <Navigate to="/events" replace /> : <Navigate to="/login" replace />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
};

export default App;