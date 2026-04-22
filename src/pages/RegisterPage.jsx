import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest } from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setSession } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submitRegister = async event => {
    event.preventDefault();

    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      setSession({ token: response.token, user: response.user });
      navigate('/');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <form className="surface-card p-4 p-md-5 w-100" style={{ maxWidth: 520 }} onSubmit={submitRegister}>
        <p className="muted-label mb-2">Join Kindred Care</p>
        <h1 className="h2 fw-bold page-title mb-2">Create account</h1>
        <p className="text-muted mb-4">Book services, order essentials, and manage care from one place.</p>

        <div className="mb-3">
          <label className="form-label fw-semibold">Full name</label>
          <input className="form-control form-control-lg" value={name} onChange={event => setName(event.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input className="form-control form-control-lg" value={email} onChange={event => setEmail(event.target.value)} />
        </div>
        <div className="mb-4">
          <label className="form-label fw-semibold">Password</label>
          <input className="form-control form-control-lg" type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold">Create Account</button>
        {message ? <div className="alert alert-danger mt-3 mb-0">{message}</div> : null}

        <p className="text-muted small mt-4 mb-0">Already have an account? <Link to="/login" className="text-primary-custom fw-bold text-decoration-none">Sign in</Link></p>
      </form>
    </div>
  );
}