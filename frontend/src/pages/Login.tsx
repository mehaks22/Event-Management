import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { LoginRequest, AuthResponse } from '../types';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await API.post<AuthResponse>('/auth/login', formData);
      const data = response.data as any;

      if (data.token) {
        localStorage.setItem('token', data.token);

        // Handle nested user objects if your backend wraps user data inside data.user
        const userInfo = data.user || data;

        if (userInfo.userId || userInfo.id) {
          localStorage.setItem('userId', String(userInfo.userId || userInfo.id));
        }

        const name = userInfo.fullName || userInfo.name || userInfo.username || 'User';

        // Safely catch role from various possible backend formats (role, roles array, userRole, authorities)
        let role = 'USER';
        if (userInfo.role) role = userInfo.role;
        else if (userInfo.userRole) role = userInfo.userRole;
        else if (Array.isArray(userInfo.roles) && userInfo.roles.length > 0) role = userInfo.roles[0];
        else if (Array.isArray(userInfo.authorities) && userInfo.authorities.length > 0) {
          role = typeof userInfo.authorities[0] === 'string' ? userInfo.authorities[0] : userInfo.authorities[0].authority;
        }

        localStorage.setItem('userName', name);
        localStorage.setItem('userRole', role.replace('ROLE_', '').toUpperCase());

        window.location.href = '/events';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Please sign in to access your account</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Added Register Link Option */}
        <div style={styles.registerContainer}>
          <span style={styles.registerText}>Don't have an account? </span>
          <Link to="/register" style={styles.registerLink}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#f8fafc',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '18px',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  button: {
    marginTop: '6px',
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  registerContainer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
  },
  registerText: {
    color: '#64748b',
  },
  registerLink: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none',
  },
};