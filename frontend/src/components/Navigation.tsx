import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/authStore';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const storedName = localStorage.getItem('userName');
  const displayName = storedName && storedName !== 'undefined' && storedName !== 'null' ? storedName : 'User';

  const isAuthenticated = Boolean(token && token !== 'null' && token !== 'undefined');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={{ backgroundColor: '#0f172a', color: '#fff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Event Hub
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
              Hello, {displayName}
            </span>
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '0.375rem 0.75rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Logout
            </button>
          </div>
        ) : !isAuthPage ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.875rem' }}>
              Login
            </Link>
            <Link to="/register" style={{ backgroundColor: '#4f46e5', color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
              Register
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;