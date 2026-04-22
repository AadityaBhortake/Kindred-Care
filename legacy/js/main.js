/**
 * main.js - Custom JavaScript for Pet Care Center
 * Includes functional Auth, Product Loading, and a Smart Cart System
 */

document.addEventListener('DOMContentLoaded', () => {

    initAuth();
    updateCartBadge(); // Initialize cart count on load

    // Horizontal Scroll with Mouse Wheel
    const container = document.getElementById('productCarousel');
    if (container) {
        container.addEventListener('wheel', (evt) => {
            if (evt.deltaY != 0) {
                evt.preventDefault();
                container.scrollLeft += evt.deltaY;
            }
        });
        loadDashboardProducts();
    }

    if (document.getElementById('storeProductGrid')) {
        loadStoreProducts();
    }

    if (document.getElementById('checkoutItemsList')) {
        loadCheckoutItems();
    }

    if (document.getElementById('myOrdersList') || document.getElementById('myBookingsList')) {
        loadUserHistory();
    }

    // Booking Integration
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('petcare_token');
            if (!token) return alert('Please sign in to book an appointment.');

            try {
                confirmBookingBtn.innerHTML = 'Processing... <span class="spinner-border spinner-border-sm"></span>';
                confirmBookingBtn.disabled = true;

                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        service: 'The Royal Treatment',
                        pet: 'Luna',
                        date: 'Tomorrow',
                        time: '10:30 AM',
                        total: 2949
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert(data.message);
                    confirmBookingBtn.innerHTML = 'Confirmed <span class="material-symbols-outlined">check_circle</span>';
                    confirmBookingBtn.classList.replace('btn-primary-custom', 'btn-success');
                }
            } catch (error) {
                alert('Connection error. Please try again.');
                confirmBookingBtn.disabled = false;
            }
        });
    }

    // Checkout Integration
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async () => {
            const cart = getCart();
            if(!cart.length) return alert('Your cart is empty!');

            const token = localStorage.getItem('petcare_token');
            if (!token) return alert('Please sign in to place an order.');

            try {
                placeOrderBtn.innerHTML = 'Processing... <span class="spinner-border spinner-border-sm"></span>';
                placeOrderBtn.disabled = true;

                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        items: cart.map(i => i.name),
                        total: calculateTotal(cart).total
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Order Placed! ID: ' + data.orderId);
                    clearCart();
                    window.location.href = '/';
                }
            } catch (error) {
                alert('Error placing order.');
                placeOrderBtn.disabled = false;
            }
        });
    }
});

// ── USER HISTORY ────────────────────────────────────────────────────────────

async function loadUserHistory() {
    console.log('📦 Loading user history...');
    const ordersList = document.getElementById('myOrdersList');
    const bookingsList = document.getElementById('myBookingsList');
    const token = localStorage.getItem('petcare_token');
    
    if (!token) {
        const msg = '<p class="text-danger text-center py-3">Please sign in to view history.</p>';
        if (ordersList) ordersList.innerHTML = msg;
        if (bookingsList) bookingsList.innerHTML = msg;
        return;
    }

    // Fetch Orders
    if (ordersList) {
        try {
            const res = await fetch('/api/my/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Fetch failed with status ' + res.status);
            const orders = await res.json();
            ordersList.innerHTML = orders.length ? orders.map(o => `
                <div class="p-3 bg-light rounded-3 mb-3 border order-row">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="fw-bold text-dark">${o.orderId}</span>
                        <span class="badge bg-secondary-light text-secondary-dark">${new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="small text-muted mb-2">${(o.items || []).join(', ')}</p>
                    <div class="fw-bold text-primary-custom">₹${(o.total || 0).toLocaleString()}</div>
                </div>
            `).join('') : '<p class="text-muted text-center py-3">No previous orders found.</p>';
        } catch(e) {
            console.error('Order fetch error:', e);
            ordersList.innerHTML = '<p class="text-danger text-center py-3">Failed to load orders.</p>';
        }
    }

    // Fetch Bookings
    if (bookingsList) {
        try {
            const res = await fetch('/api/my/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Fetch failed with status ' + res.status);
            const bookings = await res.json();
            bookingsList.innerHTML = bookings.length ? bookings.map(b => `
                <div class="p-3 bg-white rounded-3 mb-3 border shadow-sm appointment-card" style="border-left: 4px solid var(--primary) !important;">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h4 class="h6 fw-bold mb-0 text-primary-custom">${b.service}</h4>
                        <span class="small text-muted">${new Date(b.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="material-symbols-outlined fs-6 text-muted">calendar_today</span>
                        <span class="small fw-semibold">${b.date} at ${b.time}</span>
                    </div>
                    <div class="badge bg-success-light text-success fw-bold">${b.pet} • Confirmed</div>
                </div>
            `).join('') : '<p class="text-muted text-center py-3">No upcoming appointments.</p>';
        } catch(e) {
            console.error('Booking fetch error:', e);
            bookingsList.innerHTML = '<p class="text-danger text-center py-3">Failed to load appointments.</p>';
        }
    }
}

// ── CART SYSTEM ─────────────────────────────────────────────────────────────

function getCart() {
    return JSON.parse(localStorage.getItem('petcare_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('petcare_cart', JSON.stringify(cart));
    updateCartBadge();
}

function clearCart() {
    localStorage.removeItem('petcare_cart');
    updateCartBadge();
}

/**
 * Smart Add to Cart
 * Handles both dynamic (JSON) and static (Scraped) buttons
 */
function addToCart(arg1, arg2) {
    let product;
    let btn;

    if (typeof arg1 === 'string' && (arg1.startsWith('%7B') || arg1.startsWith('{'))) {
        // DYNAMIC item (JSON provided)
        try {
            product = JSON.parse(decodeURIComponent(arg1));
            btn = arg2;
        } catch (e) {
            console.error('Invalid JSON in addToCart');
            return;
        }
    } else {
        // STATIC item (Scrape from DOM)
        btn = arg1;
        const card = btn.closest('.card') || btn.closest('.product-card') || document.body;
        
        // Find price (priority: fw-bold teal text, then biggest number)
        const priceText = card.querySelector('.text-primary-custom.fw-bold, .display-5, .fs-5')?.innerText || '0';
        const name = card.querySelector('h1, h2, h3, h4, .h5')?.innerText || 'Product';
        
        product = {
            _id: 'static-' + name.replace(/\s+/g, '-').toLowerCase(),
            name: name,
            price: parseInt(priceText.replace(/[^0-9]/g, '') || '0'),
            image: card.querySelector('img')?.src || '',
            description: card.querySelector('p')?.innerText || ''
        };
    }

    const cart = getCart();
    const existing = cart.find(item => item.name === product.name); // Match by name for static safety
    
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart(cart);

    // Visual feedback
    if (btn) {
        const icon = btn.querySelector('.material-symbols-outlined');
        const originalHTML = btn.innerHTML;
        
        btn.classList.add('btn-success-animation');
        btn.innerHTML = btn.innerHTML.includes('Add to Cart') 
            ? '<span class="material-symbols-outlined">check_circle</span> Added' 
            : '<span class="material-symbols-outlined">check_circle</span>';

        // Animate the cart badge too
        const badge = document.getElementById('cartCountBadge');
        if (badge) {
            badge.classList.remove('cart-pop');
            void badge.offsetWidth; // Trigger reflow
            badge.classList.add('cart-pop');
        }

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('btn-success-animation');
        }, 1500);
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item._id !== productId);
    saveCart(cart);
    if (document.getElementById('checkoutItemsList')) loadCheckoutItems();
}

function updateQuantity(productId, delta) {
    let cart = getCart();
    const item = cart.find(i => i._id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i._id !== productId);
        }
    }
    saveCart(cart);
    if (document.getElementById('checkoutItemsList')) loadCheckoutItems();
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('#cartCountBadge');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.parentElement.style.display = 'flex'; // Ensure icon container is shown
    });
}

function calculateTotal(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05);
    return { subtotal, tax, total: subtotal + tax };
}

// ── RENDER FUNCTIONS ────────────────────────────────────────────────────────

async function loadDashboardProducts() {
    const carousel = document.getElementById('productCarousel');
    if (!carousel) return;

    try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error();
        const products = await res.json();
        
        if (products.length > 0) {
            carousel.innerHTML = products.map(p => {
                const pData = encodeURIComponent(JSON.stringify(p));
                return `
                <div class="product-card flex-shrink-0 card border bg-white rounded-4 p-3 hover-shadow">
                    <div class="ratio ratio-1x1 mb-4 rounded-3 overflow-hidden bg-surface-low">
                        <img src="${p.image}" class="object-fit-cover img-zoom" alt="${p.name}">
                    </div>
                    <h4 class="h5 fw-bold mb-0">${p.name}</h4>
                    <p class="small text-muted mb-3">${p.description}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="fs-5 fw-bolder">₹${p.price.toLocaleString('en-IN')}</span>
                        <button class="btn btn-secondary-light icon-btn rounded-circle d-flex" onclick="addToCart('${pData}', this)">
                            <span class="material-symbols-outlined">shopping_bag</span>
                        </button>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (err) {
        console.warn('Dashboard cards remains static due to fetch error.');
    }
}

async function loadStoreProducts() {
    const grid = document.getElementById('storeProductGrid');
    if (!grid) return;

    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        grid.innerHTML = products.map(p => {
            const pData = encodeURIComponent(JSON.stringify(p));
            return `
            <div class="col">
                <div class="card h-100 border-0 bg-transparent">
                    <div class="ratio rounded-4 overflow-hidden mb-3 position-relative" style="--bs-aspect-ratio: 125%;">
                        <img style="width: 100%; height: 100%; object-fit: cover;" src="${p.image}" alt="${p.name}">
                        <button class="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-2 text-primary-custom z-2" style="width:40px;height:40px;">
                            <span class="material-symbols-outlined">favorite</span>
                        </button>
                    </div>
                    <div class="card-body p-0 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h3 class="h6 fw-bold mb-0 flex-grow-1 pe-2">
                                <a href="product.html" class="text-decoration-none text-dark hover-primary-text">${p.name}</a>
                            </h3>
                            <span class="fw-bold text-primary-custom fs-6">₹${p.price.toLocaleString('en-IN')}</span>
                        </div>
                        <p class="small text-muted mb-4">${p.description}</p>
                        <button class="btn btn-primary-custom rounded-pill w-100 d-flex align-items-center justify-content-center gap-2 py-2 mt-auto text-uppercase fw-bold shadow-sm" style="letter-spacing:1px; font-size:0.8rem;" onclick="addToCart('${pData}', this)">
                            <span class="material-symbols-outlined">shopping_cart</span> Add to Cart
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (err) {}
}

function loadCheckoutItems() {
    const list = document.getElementById('checkoutItemsList');
    if (!list) return;

    const cart = getCart();
    if (!cart.length) {
        list.innerHTML = `
            <div class="py-5 text-center">
                <div class="mb-4 opacity-25">
                    <span class="material-symbols-outlined" style="font-size: 80px;">shopping_basket</span>
                </div>
                <h3 class="h4 fw-bold">Your basket is empty</h3>
                <p class="text-muted mb-4">Looks like you haven't added any essentials for your pet yet.</p>
                <a href="store.html" class="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold">START SHOPPING</a>
            </div>`;
        updateCheckoutSummary(0, 0, 0);
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="d-flex flex-column flex-sm-row gap-4 align-items-sm-center border-bottom border-light border-2 pb-4 mb-4">
            <div class="ratio ratio-1x1 rounded-3 overflow-hidden shadow-sm flex-shrink-0" style="width: 100px; height: 100px;">
                <img src="${item.image}" alt="${item.name}" class="object-fit-cover w-100 h-100">
            </div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <h3 class="h5 fw-bold text-dark mb-0">${item.name}</h3>
                    <span class="fs-5 fw-bold text-primary-custom ms-3">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
                <p class="text-muted small mb-3">${item.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-inline-flex align-items-center bg-white rounded-pill px-2 py-1 shadow-sm border">
                        <button class="btn btn-sm btn-link text-primary-custom p-1" onclick="updateQuantity('${item._id}', -1)"><span class="material-symbols-outlined fs-6">remove</span></button>
                        <span class="fw-bold px-3 text-dark">${item.quantity}</span>
                        <button class="btn btn-sm btn-link text-primary-custom p-1" onclick="updateQuantity('${item._id}', 1)"><span class="material-symbols-outlined fs-6">add</span></button>
                    </div>
                    <button class="btn btn-link text-danger text-decoration-none fw-bold small p-0 d-flex align-items-center gap-1 opacity-75 hover-opacity-100" onclick="removeFromCart('${item._id}')">
                        <span class="material-symbols-outlined fs-6">delete</span> Remove
                    </button>
                </div>
            </div>
        </div>`).join('');

    const totals = calculateTotal(cart);
    updateCheckoutSummary(totals.subtotal, totals.tax, totals.total);
}

function updateCheckoutSummary(sub, tax, total) {
    const subEl = document.getElementById('summarySubtotal');
    const taxEl = document.getElementById('summaryTax');
    const totEl = document.getElementById('summaryTotal');

    if (subEl) subEl.textContent = '₹' + sub.toLocaleString('en-IN');
    if (taxEl) taxEl.textContent = '₹' + tax.toLocaleString('en-IN');
    if (totEl) totEl.textContent = '₹' + total.toLocaleString('en-IN');
}

// ── AUTH & NAVBAR ───────────────────────────────────────────────────────────

function initAuth() {
    const token = localStorage.getItem('petcare_token');
    const user = JSON.parse(localStorage.getItem('petcare_user') || 'null');

    const navGuest = document.getElementById('navGuest');
    const navUser = document.getElementById('navUser');
    const navUserName = document.getElementById('navUserName');
    const navAvatar = document.getElementById('navAvatar');
    const welcomeName = document.getElementById('welcomeName');

    if (token && user) {
        if (navGuest) navGuest.style.display = 'none';
        if (navUser) navUser.style.display = 'flex';
        if (navUserName) navUserName.textContent = user.name || 'User';
        if (navAvatar) navAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();
        if (welcomeName) {
            const firstName = user.name ? user.name.split(' ')[0] : 'there';
            welcomeName.textContent = firstName + '!';
        }
    } else {
        if (navGuest) navGuest.style.display = 'flex';
        if (navUser) navUser.style.display = 'none';
        if (welcomeName) welcomeName.textContent = 'there!';
    }
}

function logout() {
    localStorage.removeItem('petcare_token');
    localStorage.removeItem('petcare_user');
    window.location.reload();
}
