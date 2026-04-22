import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { user, cartCount, logout } = useApp();

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-md fixed-top custom-nav shadow-sm border-0">
        <div className="container-fluid max-w-custom">
          <Link className="navbar-brand brand-text" to="/">
            Kindred Care
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="collapse navbar-collapse justify-content-center flex-grow-1" id="navbarContent">
            <ul className="navbar-nav gap-3">
              <li className="nav-item"><NavLink className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`} to="/">Home</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`} to="/store">Store</NavLink></li>
              <li className="nav-item"><NavLink className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''}`} to="/booking">Booking</NavLink></li>
              {user?.role === 'admin' && (
                <li className="nav-item"><NavLink className={({ isActive }) => `nav-link ${isActive ? 'active-link' : ''} text-danger`} to="/admin">Admin Panel</NavLink></li>
              )}
            </ul>
          </div>

          <div className="d-flex align-items-center gap-3 d-none d-md-flex">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-sm fw-semibold text-primary-custom text-decoration-none">Sign In</Link>
                <Link to="/register" className="btn btn-sm btn-primary-custom rounded-pill px-3 py-2 fw-bold">Get Started</Link>
              </>
            ) : (
              <>
                <Link to="/checkout" className="btn icon-btn rounded-circle d-flex align-items-center justify-content-center position-relative text-decoration-none hover-bg-surface">
                  <span className="material-symbols-outlined text-primary-custom">shopping_cart</span>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    {cartCount}
                  </span>
                </Link>
                <div className="ps-3 d-flex align-items-center gap-2">
                  <div className="nav-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--on-surface)' }}>{user?.name || 'User'}</div>
                    <div className="d-flex gap-2 align-items-center">
                      <Link to="/profile" style={{ textDecoration: 'none', fontSize: '.72rem', color: 'var(--primary)', fontWeight: 600 }}>Settings</Link>
                      <button type="button" onClick={logout} style={{ background: 'none', border: 'none', padding: 0, fontSize: '.72rem', color: 'var(--danger)', fontWeight: 600 }}>Sign out</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="page-content pt-5">
        <Outlet />
      </main>

      <footer className="footer-custom pt-5 pb-4 mt-auto">
        <div className="container-fluid max-w-custom text-center">
          <div className="h4 fw-bold text-primary-custom mb-2">Kindred Care</div>
          <p className="text-muted small mb-3">&copy; 2026 Kindred Care Pet Center</p>
          <Link to="/admin-login" className="text-muted text-decoration-none small opacity-50 hover-opacity-100 fw-bold text-uppercase" style={{fontSize: '0.65rem', letterSpacing: '0.1em'}}>Authorized Admin Portal</Link>
        </div>
      </footer>
    </div>
  );
}