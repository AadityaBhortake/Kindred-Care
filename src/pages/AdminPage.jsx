import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiRequest, authHeaders, formatCurrency, formatDate } from '../lib/api';

export default function AdminPage() {
  const { token } = useApp();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStats = () => {
    apiRequest('/api/admin/stats', { headers: authHeaders(token) })
      .then(setPayload)
      .catch(fetchError => setError(fetchError.message));
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (error) {
    return (
      <div className="container pt-custom pb-5">
        <div className="surface-card p-5 text-center shadow-sm">
          <span className="material-symbols-outlined text-danger display-1 mb-4">error</span>
          <h2 className="fw-bold mb-3">Database Error</h2>
          <p className="text-muted mb-4">{error}</p>
          <button className="btn btn-primary-custom px-4 py-2 rounded-pill" onClick={fetchStats}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="container pt-custom pb-5 text-center">
        <div className="py-5">
          <div className="spinner-border text-primary-custom" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <p className="mt-3 text-muted fw-medium">Loading MongoDB Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const { stats, bookings, orders, grooming, products, users } = payload;

  const filteredOrders = orders.filter(o => 
    o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.items || []).join(', ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'orders', label: 'Orders', icon: 'shopping_bag', count: orders.length },
    { id: 'grooming', label: 'Grooming', icon: 'content_cut', count: grooming.length },
    { id: 'users', label: 'Users', icon: 'group', count: users.length }
  ];

  return (
    <div className="container-fluid max-w-custom pt-custom pb-5">
      {/* Header */}
      <header className="soft-hero surface-card p-4 p-md-5 mb-5 position-relative">
        <div className="row align-items-center">
          <div className="col-md-7">
            <span className="muted-label mb-2 d-block">Admin Control Panel</span>
            <h1 className="display-5 fw-bold mb-3 page-title text-primary-custom">Center Dashboard</h1>
            <p className="text-muted mb-0 max-w-custom-sm">
              Manage your pet care center's operations, monitor real-time orders, and track appointment schedules from one unified interface.
            </p>
          </div>
          <div className="col-md-5 text-md-end mt-4 mt-md-0">
             <div className="d-inline-flex align-items-center gap-3 p-3 bg-primary-custom text-white rounded-4 shadow-sm">
                <span className="material-symbols-outlined fs-1">database</span>
                <div className="text-start">
                  <div className="small opacity-75 fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>Database Status</div>
                  <div className="fw-bold fs-5">Connected</div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold transition-all ${
              activeTab === tab.id 
              ? 'btn-primary-custom shadow-sm' 
              : 'btn-secondary-light'
            }`}
          >
            <span className="material-symbols-outlined fs-5">{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && (
              <span className={`badge rounded-pill ms-1 ${activeTab === tab.id ? 'bg-white text-primary-custom' : 'bg-primary-custom text-white'}`} style={{fontSize: '0.7rem'}}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-container mt-4 animate-fade-in">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid mb-5">
              <div className="stat-card green">
                <div className="stat-label d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined fs-6">shopping_bag</span> Orders
                </div>
                <div className="stat-value">{stats.totalOrders}</div>
                <div className="mt-2 small text-muted">Completed store purchases</div>
              </div>
              <div className="stat-card red">
                <div className="stat-label d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined fs-6">content_cut</span> Grooming
                </div>
                <div className="stat-value">{stats.totalGrooming}</div>
                <div className="mt-2 small text-muted">Salon service requests</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-label d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined fs-6">payments</span> Revenue
                </div>
                <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                <div className="mt-2 small text-muted">Total earnings from shop</div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-8">
                <div className="surface-card p-4 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 fw-bold mb-0">Recent Shop Activity</h3>
                    <button onClick={() => setActiveTab('orders')} className="btn btn-link text-primary-custom fw-bold text-decoration-none small p-0">View All</button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle custom-table">
                      <thead className="bg-surface-low border-0">
                        <tr>
                          <th className="border-0 ps-3">Order ID</th>
                          <th className="border-0">Total</th>
                          <th className="border-0">Date</th>
                          <th className="border-0 pe-3 text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o._id}>
                            <td className="ps-3"><span className="fw-bold text-primary-custom">{o.orderId}</span></td>
                            <td>{formatCurrency(o.total)}</td>
                            <td className="text-muted small">{formatDate(o.createdAt)}</td>
                            <td className="pe-3 text-end">
                              <span className="badge bg-secondary-light text-secondary-dark rounded-pill py-2 px-3 fw-bold">Success</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                 <div className="surface-card p-4 h-100">
                    <h3 className="h5 fw-bold mb-4">Product Inventory</h3>
                    <div className="d-flex flex-column gap-3">
                      {products.slice(0, 4).map(p => (
                        <div key={p._id} className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg-surface transition-all border">
                          <img src={p.image} alt="" className="rounded-3" style={{width: '48px', height: '48px', objectFit: 'cover'}} />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-bold text-truncate small">{p.name}</div>
                            <div className="text-muted small">{formatCurrency(p.price)}</div>
                          </div>
                          <span className="material-symbols-outlined text-muted fs-5">chevron_right</span>
                        </div>
                      ))}
                      <div className="bg-tertiary-light p-3 rounded-4 mt-2">
                        <div className="d-flex align-items-center gap-3 text-tertiary-dark">
                          <span className="material-symbols-outlined">inventory_2</span>
                          <div>
                            <div className="fw-bold small">{products.length} Products</div>
                            <div className="small opacity-75">Currently in catalog</div>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-tab animate-fade-in">
            <div className="surface-card p-4 mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <h3 className="h5 fw-bold mb-0">Manage Orders</h3>
                <div className="position-relative" style={{width: '100%', maxWidth: '350px'}}>
                  <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-muted fs-5">search</span>
                  <input 
                    type="text" 
                    className="form-control rounded-pill ps-5 py-2 border-0 bg-surface-low" 
                    placeholder="Search by Order ID or Items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="surface-card p-0 overflow-hidden shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-surface-low border-0">
                    <tr style={{fontSize: '0.8rem'}}>
                      <th className="border-0 ps-4 py-3 text-uppercase fw-bold tracking-wider">Order ID</th>
                      <th className="border-0 py-3 text-uppercase fw-bold tracking-wider">Items Summary</th>
                      <th className="border-0 py-3 text-uppercase fw-bold tracking-wider">Total Charge</th>
                      <th className="border-0 py-3 text-uppercase fw-bold tracking-wider">Timestamp</th>
                      <th className="border-0 py-3 text-uppercase fw-bold tracking-wider">Customer ID</th>
                      <th className="border-0 pe-4 py-3 text-uppercase fw-bold tracking-wider text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map(o => (
                      <tr key={o._id} className="border-bottom-0">
                        <td className="ps-4"><div className="fw-bold text-primary-custom">{o.orderId}</div></td>
                        <td><div className="text-muted small text-truncate" style={{maxWidth: '250px'}}>{(o.items || []).join(', ') || 'Processing...'}</div></td>
                        <td><div className="fw-bold">{formatCurrency(o.total)}</div></td>
                        <td><div className="small text-muted">{formatDate(o.createdAt)}</div></td>
                        <td><div className="text-muted small truncate">...{String(o.userId || '').slice(-8)}</div></td>
                        <td className="pe-4 text-end">
                           <span className="badge bg-secondary-light text-secondary-dark rounded-pill py-2 px-3 fw-bold">Fulfilled</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <span className="material-symbols-outlined display-4 text-muted mb-3">receipt_long</span>
                          <p className="text-muted mb-0">No orders found matching "{searchTerm}"</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* GROOMING TAB */}
        {activeTab === 'grooming' && (
          <div className="grooming-tab animate-fade-in">
            <div className="surface-card p-4 mb-4 d-flex justify-content-between align-items-center bg-tertiary-light">
              <h3 className="h5 fw-bold mb-0 text-tertiary-dark">Grooming & Salon Requests</h3>
              <span className="material-symbols-outlined text-tertiary-dark">content_cut</span>
            </div>
            <div className="row g-4">
                {grooming.map(g => (
                    <div className="col-md-6 col-lg-4" key={g._id}>
                        <div className="surface-card p-4 h-100 card-hover">
                            <div className="d-flex justify-content-between mb-3">
                                <span className="badge bg-secondary-light text-secondary-dark rounded-pill px-3 py-2 fw-bold small">{g.service || 'Full Grooming'}</span>
                                <div className="text-muted small">{g.date}</div>
                            </div>
                            <h4 className="h5 fw-bold mb-2">{g.petName || g.pet || 'Guest Pet'}</h4>
                            <p className="small text-muted mb-4">{g.notes || 'No extra notes provided by the owner.'}</p>
                            <div className="pt-3 border-top d-flex justify-content-between align-items-center mt-auto">
                                <div className="muted-label" style={{fontSize: '0.65rem'}}>Owner: ...{String(g.userId || '').slice(-6)}</div>
                                <span className="material-symbols-outlined text-primary-custom">check_circle</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="users-tab animate-fade-in">
             <div className="surface-card p-5 text-center mb-5 bg-tertiary-light border-0">
               <h2 className="display-4 fw-bold text-tertiary-dark mb-3">{users.length}</h2>
               <p className="text-muted mb-0 fw-bold text-uppercase tracking-wider">Registered Pet Owners</p>
             </div>
             <div className="row g-4">
                {users.map(u => (
                    <div key={u._id} className="col-md-6 col-lg-4">
                        <div className="surface-card p-4 d-flex align-items-center gap-3">
                            <div className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '50px', height: '50px', flexShrink: 0}}>
                                {u.name ? u.name[0].toUpperCase() : 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <div className="fw-bold text-truncate">{u.name}</div>
                                <div className="text-muted small text-truncate">{u.email}</div>
                                <div className="mt-1"><span className={`badge rounded-pill small ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary-light text-secondary-dark'}`}>{u.role || 'user'}</span></div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}


      </div>

      <style>{`
        .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .stat-card.blue .stat-value { color: #0066ee; }
        .stat-card.green .stat-value { color: #2e7d32; }
        .stat-card.red .stat-value { color: #ba1a1a; }
        .stat-card.purple .stat-value { color: #6d28d9; }
        .custom-table tbody tr {
            transition: all 0.2s ease;
        }
        .custom-table tbody tr:hover {
            background-color: var(--surface-container-low);
        }
        .tracking-wider {
            letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
}