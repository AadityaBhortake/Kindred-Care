import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('petcare_token') || '');
  const [user, setUser] = useState(() => readJSON('petcare_user', null));
  const [cart, setCart] = useState(() => readJSON('petcare_cart', []));

  useEffect(() => {
    if (token) {
      localStorage.setItem('petcare_token', token);
    } else {
      localStorage.removeItem('petcare_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('petcare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('petcare_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('petcare_cart', JSON.stringify(cart));
  }, [cart]);

  const session = useMemo(() => ({ token, user }), [token, user]);

  const setSession = nextSession => {
    setToken(nextSession?.token || '');
    setUser(nextSession?.user || null);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setCart([]);
  };

  const addToCart = product => {
    setCart(currentCart => {
      const existing = currentCart.find(item => item._id === product._id || item.name === product.name);

      if (existing) {
        return currentCart.map(item => item._id === existing._id || item.name === existing.name
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item);
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = productId => {
    setCart(currentCart => currentCart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(currentCart => currentCart
      .map(item => item._id === productId ? { ...item, quantity: (item.quantity || 1) + delta } : item)
      .filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (item.quantity || 1)), 0);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + cartTax;

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        session,
        cart,
        cartCount,
        cartSubtotal,
        cartTax,
        cartTotal,
        setSession,
        logout,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }

  return context;
}