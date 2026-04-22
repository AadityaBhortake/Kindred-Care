import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../lib/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setSession } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.user.role !== 'admin') {
        throw new Error('Access denied. This portal is for authorized administrators only.');
      }

      setSession({ token: response.token, user: response.user });
      navigate('/admin');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex flex-column align-items-center justify-content-center py-5">
      <div className="surface-card p-5 w-100 shadow-lg border-0" style={{ maxWidth: 480, borderRadius: '2rem' }}>
        <div className="text-center mb-4">
          <div className="bg-primary-custom text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: 64, height: 64 }}>
            <span className="material-symbols-outlined fs-2">admin_panel_settings</span>
          </div>
          <h1 className="h3 fw-bold text-primary-custom">Admin Management</h1>
          <p className="text-muted small">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold small text-uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" 
              className="form-control-premium form-control" 
              placeholder="admin@kindredcare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase tracking-wider">Secure Password</label>
            <input 
              type="password" 
              className="form-control-premium form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <>
                <span className="material-symbols-outlined fs-5">lock_open</span>
                Access Dashboard
              </>
            )}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 rounded-4 bg-danger text-white small d-flex align-items-center gap-2 animate-fade-in shadow-sm">
            <span className="material-symbols-outlined fs-5">warning</span>
            {message}
          </div>
        )}

        <div className="mt-5 text-center pt-3 border-top">
          <button onClick={() => navigate('/login')} className="btn btn-link text-muted text-decoration-none small fw-medium">
            ← Switch to User Login
          </button>
        </div>
      </div>
      
      <p className="mt-4 text-muted small opacity-50">&copy; 2026 Admin Infrastructure System</p>

      <style>{`
        .form-control-premium {
          background-color: #f8f9fa;
          border: 2.5px solid transparent;
          border-radius: 12px;
          padding: 14px 18px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .form-control-premium:focus {
          background-color: #fff;
          border-color: var(--primary);
          box-shadow: 0 8px 24px rgba(0, 102, 110, 0.1);
        }
        .tracking-wider {
          letter-spacing: 0.1em;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
