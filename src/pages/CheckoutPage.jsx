import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest, authHeaders, formatCurrency } from '../lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { token, cart, cartSubtotal, cartTax, cartTotal, updateQuantity, removeFromCart, clearCart } = useApp();
  const [status, setStatus] = useState('');

  const placeOrder = async () => {
    if (!cart.length) {
      setStatus('Your cart is empty.');
      return;
    }

    try {
      setStatus('Processing order...');
      const response = await apiRequest('/api/checkout', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          items: cart.map(item => item.name),
          total: cartTotal
        })
      });

      clearCart();
      navigate('/');
      window.alert(`Order Placed! ID: ${response.orderId}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="container-fluid max-w-custom pt-custom pb-5">
      <header className="mb-5 border-bottom border-light border-2 pb-5">
        <h1 className="display-5 fw-bold text-dark mb-3">Finalize your selection</h1>
        <p className="lead text-muted max-w-custom-sm">Review your curated essentials for your companion's wellness journey.</p>
      </header>

      <div className="row g-5">
        <div className="col-lg-7 d-flex flex-column gap-5">
          <section className="bg-surface-low rounded-4 p-4 p-md-5 shadow-sm border border-light border-2">
            <h2 className="h3 fw-bold mb-5 text-dark">Your Basket</h2>

            {cart.length ? cart.map(item => (
              <div key={item._id} className="d-flex flex-column flex-sm-row gap-4 align-items-sm-center border-bottom border-light border-2 pb-4 mb-4">
                <div className="ratio ratio-1x1 rounded-3 overflow-hidden shadow-sm flex-shrink-0" style={{ width: 100, height: 100 }}>
                  <img src={item.image} alt={item.name} className="object-fit-cover w-100 h-100" />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h3 className="h5 fw-bold text-dark mb-0">{item.name}</h3>
                    <span className="fs-5 fw-bold text-primary-custom ms-3">{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                  </div>
                  <p className="text-muted small mb-3">{item.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-inline-flex align-items-center bg-white rounded-pill px-2 py-1 shadow-sm border">
                      <button type="button" className="btn btn-sm btn-link text-primary-custom p-1" onClick={() => updateQuantity(item._id, -1)}><span className="material-symbols-outlined fs-6">remove</span></button>
                      <span className="fw-bold px-3 text-dark">{item.quantity}</span>
                      <button type="button" className="btn btn-sm btn-link text-primary-custom p-1" onClick={() => updateQuantity(item._id, 1)}><span className="material-symbols-outlined fs-6">add</span></button>
                    </div>
                    <button type="button" className="btn btn-link text-danger text-decoration-none fw-bold small p-0 d-flex align-items-center gap-1 opacity-75 hover-opacity-100" onClick={() => removeFromCart(item._id)}>
                      <span className="material-symbols-outlined fs-6">delete</span> Remove
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-5 text-center empty-state">
                <div className="mb-4 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: 80 }}>shopping_basket</span>
                </div>
                <h3 className="h4 fw-bold">Your basket is empty</h3>
                <p className="text-muted mb-4">Looks like you haven't added any essentials for your pet yet.</p>
                <Link to="/store" className="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold">Start Shopping</Link>
              </div>
            )}
          </section>

          <section className="bg-surface-low rounded-4 p-4 p-md-5 shadow-sm border border-light border-2 d-flex flex-column gap-5">
            <div>
              <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-3 text-dark">
                <span className="bg-primary-custom text-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>1</span>
                Shipping Information
              </h2>
              <div className="row g-4">
                <div className="col-md-6"><input type="text" className="form-control form-control-lg border-0 shadow-sm" placeholder="Full Name" /></div>
                <div className="col-md-6"><input type="email" className="form-control form-control-lg border-0 shadow-sm" placeholder="Email" /></div>
                <div className="col-12"><input type="text" className="form-control form-control-lg border-0 shadow-sm" placeholder="Street Address" /></div>
              </div>
            </div>
            <div>
              <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-3 text-dark">
                <span className="bg-primary-custom text-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>2</span>
                Payment Details
              </h2>
              <div className="row g-4">
                <div className="col-12"><input type="text" className="form-control form-control-lg border-0 shadow-sm" placeholder="Card Number" /></div>
                <div className="col-md-6"><input type="text" className="form-control form-control-lg border-0 shadow-sm" placeholder="MM / YY" /></div>
                <div className="col-md-6"><input type="password" className="form-control form-control-lg border-0 shadow-sm" placeholder="CVV" /></div>
              </div>
            </div>
          </section>
        </div>

        <aside className="col-lg-5">
          <div className="sticky-top" style={{ top: 100 }}>
            <div className="card border-0 bg-white rounded-4 p-4 p-md-5 shadow mb-4 editorial-shadow border border-light">
              <h2 className="h3 fw-bold mb-5 text-dark">Order Summary</h2>
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex justify-content-between text-muted fw-bold"><span>Subtotal</span><span className="text-dark">{formatCurrency(cartSubtotal)}</span></div>
                <div className="d-flex justify-content-between text-muted fw-bold"><span>Shipping</span><span className="text-success">Free</span></div>
                <div className="d-flex justify-content-between text-muted fw-bold"><span>Taxes (5%)</span><span className="text-dark">{formatCurrency(cartTax)}</span></div>
              </div>
              <div className="d-flex justify-content-between align-items-end pt-4 border-top border-light border-2 mb-4">
                <span className="fs-4 fw-bold text-dark">Total</span>
                <div className="text-end">
                  <span className="display-6 fw-bold text-primary-custom d-block mb-1">{formatCurrency(cartTotal)}</span>
                  <span className="small text-muted fw-bold">INR Includes GST</span>
                </div>
              </div>
              <button type="button" onClick={placeOrder} className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm text-uppercase mb-4">Place Order</button>
              <p className="small text-muted text-center mb-0">By placing order, you agree to our Terms.</p>
              {status ? <div className="mt-3 small text-muted text-center">{status}</div> : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}