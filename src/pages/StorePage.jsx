import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest, formatCurrency } from '../lib/api';

const CATEGORIES = ['All Supplies', 'Food', 'Accessories', 'Health'];

export default function StorePage() {
  const { addToCart } = useApp();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Supplies');
  const [addedId, setAddedId] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    apiRequest('/api/products').then(setProducts).catch(() => setProducts([]));
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

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== 'All Supplies') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    const query = search.trim().toLowerCase();
    if (!query) return filtered;

    return filtered.filter(product =>
      [product.name, product.description, product.category].filter(Boolean).some(field => field.toLowerCase().includes(query))
    );
  }, [products, search, activeCategory]);

  return (
    <div className="container-fluid max-w-custom pt-custom pb-5" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: 'opacity 0.55s ease, transform 0.55s ease' }}>
      <div className="row justify-content-center mb-5">
        <div className="col-lg-8">
          <div className="position-relative shadow-sm rounded-pill">
            <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-4 text-primary-custom">search</span>
            <input
              type="text"
              className="form-control form-control-lg rounded-pill ps-5 pe-5 border-0 bg-surface-low shadow-sm py-3"
              placeholder="Search for premium pet health products..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-5">
        <aside className="col-lg-3">
          <div className="sticky-top" style={{ top: '100px' }}>
            <section className="mb-5">
              <h2 className="h5 fw-bold text-primary-custom mb-4">Categories</h2>
              <ul className="list-unstyled d-flex flex-column gap-3">
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button
                      type="button"
                      className={`btn btn-link p-0 text-decoration-none border-0 text-start ${activeCategory === cat ? 'text-primary-custom fw-bold' : 'text-muted fw-bold hover-primary'}`}
                      onClick={() => setActiveCategory(cat)}
                      style={{ transition: 'color 0.2s ease' }}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

          </div>
        </aside>

        <section className="col-lg-9">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h1 className="display-6 fw-bold mb-2">The Store</h1>
              <p className="text-muted mb-0">Curated health & wellness essentials for your companion.</p>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-5">
            {filteredProducts.map(product => (
              <div className="col" key={product._id}>
                <div className="card h-100 border-0 bg-transparent">
                  <div className="ratio rounded-4 overflow-hidden mb-3 position-relative bg-white" style={{ '--bs-aspect-ratio': '125%' }}>
                    <img style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={product.image} alt={product.name} />
                    <button type="button" className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-2 text-primary-custom z-2" style={{ width: 40, height: 40 }}>
                      <span className="material-symbols-outlined">favorite</span>
                    </button>
                  </div>
                  <div className="card-body p-0 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h2 className="h6 fw-bold mb-0 flex-grow-1 pe-2"><Link to="/store" className="text-decoration-none text-dark hover-primary-text">{product.name}</Link></h2>
                      <span className="fw-bold text-primary-custom fs-6">{formatCurrency(product.price)}</span>
                    </div>
                    <p className="small text-muted mb-4">{product.description}</p>
                    <button
                      type="button"
                      className={`btn rounded-pill w-100 d-flex align-items-center justify-content-center gap-2 py-2 mt-auto text-uppercase fw-bold shadow-sm ${addedId === product._id ? 'btn-success-animation' : 'btn-primary-custom'
                        }`}
                      style={{ letterSpacing: '1px', fontSize: '0.8rem', transition: 'background-color 0.3s ease, transform 0.3s ease' }}
                      onClick={() => handleAddToCart(product)}
                    >
                      <span className={`material-symbols-outlined ${addedId === product._id ? 'cart-pop' : ''}`}>
                        {addedId === product._id ? 'check' : 'shopping_cart'}
                      </span>
                      {addedId === product._id ? 'Added!' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}