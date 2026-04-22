import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest, authHeaders, formatCurrency, formatDate } from '../lib/api';

export default function ProfilePage() {
  const { token, user, setSession } = useApp();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    apiRequest('/api/my/orders', { headers: authHeaders(token) }).then(setOrders).catch(() => setOrders([]));
    apiRequest('/api/my/bookings', { headers: authHeaders(token) }).then(setBookings).catch(() => setBookings([]));
  }, [token]);

  const updateEmail = async event => {
    event.preventDefault();

    try {
      const response = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ email })
      });

      const nextUser = { ...(user || {}), email };
      setSession({ token, user: nextUser });
      setEmailMessage(response.message || 'Updated successfully!');
    } catch (error) {
      setEmailMessage(error.message);
    }
  };

  const updatePassword = async event => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ password })
      });

      setPasswordMessage(response.message || 'Updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage(error.message);
    }
  };

  return (
    <div className="container max-w-custom pt-custom">
      <header className="profile-header shadow-lg mb-4 surface-card soft-hero p-4 p-md-5">
        <div className="row align-items-center position-relative z-1">
          <div className="col-md-7">
            <h1 className="display-5 fw-bold mb-2">{user?.name ? `${user.name}'s Account` : 'Your Account'}</h1>
            <p className="lead opacity-75 mb-0">Manage your credentials and view your pet's journey with us.</p>
          </div>
        </div>
      </header>

      <div className="settings-container px-3">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="glass-card p-4 surface-card mb-4">
              <h2 className="h5 fw-bold mb-4 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-primary-custom">alternate_email</span>
                Update Email Address
              </h2>
              <form onSubmit={updateEmail}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">New Email Address</label>
                  <input type="email" className="form-control form-control-premium" placeholder="Enter new email" value={email} onChange={event => setEmail(event.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary-custom w-100 rounded-pill py-2 fw-bold shadow-sm">Update Email</button>
              </form>
              {emailMessage ? <div className="status-msg d-block bg-success bg-opacity-10 text-success mt-3">{emailMessage}</div> : null}
            </div>

            <div className="glass-card p-4 surface-card">
              <h2 className="h5 fw-bold mb-4 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-primary-custom">lock</span>
                Change Password
              </h2>
              <form onSubmit={updatePassword}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">New Password</label>
                  <input type="password" className="form-control form-control-premium" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter new password" required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">Confirm New Password</label>
                  <input type="password" className="form-control form-control-premium" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Confirm password" required />
                </div>
                <button type="submit" className="btn btn-primary-custom w-100 rounded-pill py-2 fw-bold shadow-sm">Change Password</button>
              </form>
              {passwordMessage ? <div className="status-msg d-block bg-success bg-opacity-10 text-success mt-3">{passwordMessage}</div> : null}
            </div>
          </div>

          <div className="col-lg-7">
            <div className="row g-4">
              <div className="col-12">
                <div className="glass-card p-4 h-100 mb-0 surface-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h5 fw-bold mb-0 d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined text-primary-custom">calendar_month</span>
                      Upcoming Appointments
                    </h2>
                    <Link to="/booking" className="btn btn-sm btn-link text-primary-custom text-decoration-none p-0 fw-bold">New Booking</Link>
                  </div>
                  <div className="history-list d-flex flex-column gap-3">
                    {bookings.length ? bookings.map(item => (
                      <div key={item._id} className="p-3 bg-white rounded-3 border shadow-sm appointment-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h3 className="h6 fw-bold mb-0 text-primary-custom">{item.service}</h3>
                          <span className="small text-muted">{formatDate(item.createdAt)}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="material-symbols-outlined fs-6 text-muted">calendar_today</span>
                          <span className="small fw-semibold">{item.date} at {item.time}</span>
                        </div>
                        <div className="badge bg-success-light text-success fw-bold">{item.pet} • Confirmed</div>
                      </div>
                    )) : <p className="text-muted text-center py-4 mb-0">No upcoming appointments.</p>}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="glass-card p-4 h-100 mb-0 surface-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h5 fw-bold mb-0 d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined text-primary-custom">shopping_bag</span>
                      Recent Orders
                    </h2>
                    <Link to="/store" className="btn btn-sm btn-link text-primary-custom text-decoration-none p-0 fw-bold">Store</Link>
                  </div>
                  <div className="history-list d-flex flex-column gap-3">
                    {orders.length ? orders.map(item => (
                      <div key={item._id} className="p-3 bg-light rounded-3 mb-3 border order-row">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-dark">{item.orderId}</span>
                          <span className="badge bg-secondary-light text-secondary-dark">{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="small text-muted mb-2">{(item.items || []).join(', ')}</p>
                        <div className="fw-bold text-primary-custom">{formatCurrency(item.total || 0)}</div>
                      </div>
                    )) : <p className="text-muted text-center py-4 mb-0">No purchase history found.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}