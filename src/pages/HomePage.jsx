import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest, authHeaders, formatCurrency } from '../lib/api';

export default function HomePage() {
  const { user, addToCart, token } = useApp();
  const [products, setProducts] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    apiRequest('/api/my/bookings', { headers: authHeaders(token) })
      .then(bookings => setNextBooking(bookings.length > 0 ? bookings[0] : null))
      .catch(() => setNextBooking(null));
  }, [token]);

  useEffect(() => {
    let active = true;

    apiRequest('/api/products')
      .then(data => {
        if (active) {
          setProducts(data);
        }
      })
      .catch(() => {
        if (active) {
          setProducts([]);
        }
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleAddToCart = useCallback((product) => {
    addToCart(product);
    setAddedId(product._id);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAddedId(null), 1200);
  }, [addToCart]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="container-fluid max-w-custom pt-custom pb-5" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: 'opacity 0.55s ease, transform 0.55s ease' }}>
      <header className="mb-5 position-relative soft-hero surface-card p-4 p-md-5">
        <div className="row position-relative z-1">
          <div className="col-md-8">
            <p className="muted-label mb-2">Dashboard</p>
            <h1 className="display-5 fw-bold mb-3 page-title">Welcome back, <span className="text-primary-custom">{firstName}!</span></h1>
            <p className="text-muted mb-0">Manage bookings, shop essentials, and keep your pets' care history in one place.</p>
          </div>
        </div>
      </header>

      <section className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="card card-custom h-100 overflow-hidden border-0 shadow-sm surface-card">
            <div className="row g-0 h-100">
              <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center position-relative z-2">
                {nextBooking ? (
                  <>
                    <span className="badge bg-secondary-light text-secondary-dark rounded-pill mb-4 w-auto align-self-start py-2 px-3 d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined fs-6">event</span> Upcoming Appointment
                    </span>
                    <h2 className="h2 fw-bold mb-3">{nextBooking.pet}'s {nextBooking.service}</h2>
                    <p className="text-muted mb-4">Professional care for your furry companion at our premier center.</p>
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-box-muted rounded-circle d-flex align-items-center justify-content-center">
                        <span className="material-symbols-outlined text-primary-custom">calendar_today</span>
                      </div>
                      <div>
                        <p className="mb-0 fw-bold fs-6">{nextBooking.date}</p>
                        <p className="mb-0 small text-muted">{nextBooking.time}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="badge bg-secondary-light text-secondary-dark rounded-pill mb-4 w-auto align-self-start py-2 px-3 d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined fs-6">spa</span> Premium Care
                    </span>
                    <h2 className="h2 fw-bold mb-3">Pamper Your Pet</h2>
                    <p className="text-muted mb-4">Book a luxury grooming session or a routine check-up with our expert caretakers today.</p>
                    <Link to="/booking" className="btn btn-primary-custom rounded-pill px-4 py-2 fw-bold">
                      Book Now <span className="material-symbols-outlined ms-2" style={{verticalAlign: 'middle'}}>arrow_forward</span>
                    </Link>
                  </>
                )}
              </div>
              <div className="col-md-6 min-h-300 position-relative">
                <img src="/assets/images/grooming_img.jpg" alt="Spa Day" className="img-fluid w-100 h-100 object-fit-cover position-absolute top-0 start-0 z-0" />
                <div className="gradient-overlay position-absolute w-100 h-100 z-1"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">
          <div className="card h-100 border-0 bg-surface-low rounded-4 p-4 position-relative overflow-hidden card-hover d-flex justify-content-center">
            <div className="position-relative z-2">
              <h3 className="h4 fw-bold mb-2">Need a refresh?</h3>
              <p className="text-muted small mb-4">Professional care for your furry companions at our premier center.</p>
              <Link to="/booking" className="btn btn-link text-primary-custom fw-bold text-decoration-none p-0 d-flex align-items-center gap-2 btn-arrow">
                Book Grooming <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <span className="material-symbols-outlined position-absolute giant-icon">pets</span>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="h3 fw-bold mb-1">Quick Reorder</h2>
            <p className="text-muted mb-0">Essentials Luna and Oliver love, powered by your history.</p>
          </div>
          <Link to="/store" className="btn btn-link text-primary-custom fw-bold text-decoration-none p-0 d-none d-md-flex align-items-center gap-1">
            See All Products <span className="material-symbols-outlined fs-6">arrow_forward</span>
          </Link>
        </div>

        <div className="d-flex flex-nowrap overflow-auto hide-scrollbar gap-4 pb-3">
          {products.length ? products.map(product => (
            <div key={product._id} className="product-card flex-shrink-0 card border bg-white rounded-4 p-3 hover-shadow">
              <div className="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden bg-white">
                <img src={product.image} className="object-fit-contain img-zoom" alt={product.name} />
              </div>
              <h3 className="h5 fw-bold mb-0">{product.name}</h3>
              <p className="small text-muted mb-3">{product.description}</p>
              <div className="d-flex justify-content-between align-items-center mt-auto">
                <span className="fs-5 fw-bolder">{formatCurrency(product.price)}</span>
                <button
                  type="button"
                  className={`btn icon-btn rounded-circle d-flex align-items-center justify-content-center transition-all ${
                    addedId === product._id ? 'btn-success-animation' : 'btn-secondary-light'
                  }`}
                  onClick={() => handleAddToCart(product)}
                  style={{ transition: 'background-color 0.3s ease, transform 0.3s ease' }}
                >
                  <span className={`material-symbols-outlined ${addedId === product._id ? 'cart-pop' : ''}`}>
                    {addedId === product._id ? 'check' : 'shopping_bag'}
                  </span>
                </button>
              </div>
            </div>
          )) : (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary-custom" role="status"></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}