import React, { useState, useEffect } from 'react';
import WalkInOrderPanel from './components/WalkInOrderPanel';
import { loginAdmin, fetchOrders, updateOrderStatus } from './api';

const styles = {
  app: { minHeight: '100vh', background: '#fdf6ec' },
  nav: {
    background: '#5a3e2b',
    color: '#fff',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  navTitle: { fontWeight: 700, fontSize: 20, letterSpacing: 0.5 },
  navTabs: { display: 'flex', gap: 8 },
  tab: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    transition: 'background 0.15s',
  },
  activeTab: { background: '#f5a623', color: '#fff' },
  loginContainer: {
    maxWidth: 400,
    margin: '80px auto',
    padding: 32,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  loginTitle: { textAlign: 'center', color: '#5a3e2b', marginBottom: 24, fontSize: 22 },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d4b896',
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 14,
    background: '#fffaf5',
    outline: 'none',
  },
  btn: {
    width: '100%',
    padding: 12,
    background: '#f5a623',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    color: '#c0392b',
    background: '#ffeaea',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 12,
    fontSize: 14,
  },
  ordersContainer: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 20,
  },
  orderCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    borderLeft: '4px solid #f5a623',
  },
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    background:
      status === 'pending'
        ? '#fff3cd'
        : status === 'preparing'
        ? '#cce5ff'
        : status === 'ready'
        ? '#d4edda'
        : status === 'delivered'
        ? '#d1ecf1'
        : '#f8d7da',
    color:
      status === 'pending'
        ? '#856404'
        : status === 'preparing'
        ? '#004085'
        : status === 'ready'
        ? '#155724'
        : status === 'delivered'
        ? '#0c5460'
        : '#721c24',
  }),
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('adminToken'))
  );
  const [activeTab, setActiveTab] = useState('walkin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await loginAdmin(username, password);
      localStorage.setItem('adminToken', res.data.token);
      setIsLoggedIn(true);
    } catch {
      setLoginError('Invalid username or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetchOrders();
      setOrders(res.data.orders || []);
    } catch {
      // fail silently; user can retry
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === 'orders') {
      loadOrders();
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, activeTab]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert('Failed to update status');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <h2 style={styles.loginTitle}>☕ Mr Smoothy Admin</h2>
        {loginError && <div style={styles.error}>{loginError}</div>}
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.btn} type="submit" disabled={loginLoading}>
            {loginLoading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <span style={styles.navTitle}>☕ Mr Smoothy</span>
        <div style={styles.navTabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'walkin' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('walkin')}
          >
            Walk-in Order
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('orders')}
          >
            All Orders
          </button>
          <button style={styles.tab} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {activeTab === 'walkin' && (
        <WalkInOrderPanel onOrderPlaced={() => {}} />
      )}

      {activeTab === 'orders' && (
        <div style={styles.ordersContainer}>
          <h2 style={{ color: '#5a3e2b', marginBottom: 16, marginTop: 20 }}>
            Active Orders
          </h2>
          {ordersLoading && orders.length === 0 ? (
            <p style={{ color: '#8a6040' }}>Loading orders…</p>
          ) : orders.length === 0 ? (
            <p style={{ color: '#8a6040' }}>No active orders.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} style={styles.orderCard}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <strong style={{ color: '#3d2b1f', fontSize: 16 }}>
                      {order.orderNumber}
                    </strong>
                    {order.isWalkin && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          background: '#f5a623',
                          color: '#fff',
                          borderRadius: 5,
                          padding: '2px 7px',
                          fontWeight: 700,
                        }}
                      >
                        WALK-IN
                      </span>
                    )}
                    <div style={{ color: '#8a6040', fontSize: 13, marginTop: 2 }}>
                      {order.customerName} • ₹{order.total}
                    </div>
                  </div>
                  <span style={styles.statusBadge(order.status)}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['pending', 'preparing', 'ready', 'delivered'].map((s) => (
                    <button
                      key={s}
                      disabled={order.status === s}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 6,
                        border: '1px solid #d4b896',
                        background: order.status === s ? '#f5a623' : '#fff',
                        color: order.status === s ? '#fff' : '#5a3e2b',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: order.status === s ? 'default' : 'pointer',
                      }}
                      onClick={() => handleStatusUpdate(order._id, s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
