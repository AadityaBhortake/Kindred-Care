import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submitLogin = async event => {
    event.preventDefault();

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setSession({ token: response.token, user: response.user });
      navigate('/');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <form className="surface-card p-4 p-md-5 w-100" style={{ maxWidth: 460 }} onSubmit={submitLogin}>
        <p className="muted-label mb-2">Welcome back</p>
        <h1 className="h2 fw-bold page-title mb-2">Sign in</h1>
        <p className="text-muted mb-4">Access bookings, orders, and your pet's care history.</p>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input className="form-control form-control-lg" value={email} onChange={event => setEmail(event.target.value)} />
        </div>
        <div className="mb-4">
          <label className="form-label fw-semibold">Password</label>
          <input className="form-control form-control-lg" type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold">Sign In</button>
        {message ? <div className="alert alert-danger mt-3 mb-0">{message}</div> : null}

        <div className="d-flex flex-column gap-2 mt-4 pt-4 border-top">
          <p className="text-muted small mb-0">No account yet? <Link to="/register" className="text-primary-custom fw-bold text-decoration-none">Create one</Link></p>
          <p className="text-muted small mb-0">Staff member? <Link to="/admin-login" className="text-danger fw-bold text-decoration-none">Owner Login →</Link></p>
        </div>
      </form>
    </div>
  );
}