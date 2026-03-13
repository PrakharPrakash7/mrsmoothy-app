import React, { useState, useEffect } from 'react';
import { fetchMenu, placeOrder } from '../api';

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: 20,
    fontFamily: "'Segoe UI', sans-serif",
    background: '#fdf6ec',
    minHeight: '100vh',
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#5a3e2b',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  label: { display: 'block', fontWeight: 600, marginBottom: 6, color: '#5a3e2b' },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d4b896',
    borderRadius: 8,
    fontSize: 15,
    marginBottom: 12,
    background: '#fffaf5',
    outline: 'none',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
    marginTop: 12,
  },
  menuCard: {
    border: '1px solid #e8d5b7',
    borderRadius: 10,
    padding: '12px 14px',
    cursor: 'pointer',
    background: '#fffdf9',
    transition: 'all 0.15s',
  },
  menuCardSelected: {
    border: '2px solid #f5a623',
    background: '#fff8ec',
  },
  itemName: { fontWeight: 600, color: '#3d2b1f', fontSize: 15 },
  itemPrice: { color: '#8a6040', fontSize: 13, marginTop: 4 },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid #d4b896',
    background: '#f5e6d0',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: '26px',
    textAlign: 'center',
    color: '#5a3e2b',
    fontWeight: 700,
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f0e0c8',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    fontSize: 18,
    color: '#3d2b1f',
    marginTop: 12,
    paddingTop: 12,
    borderTop: '2px solid #f5a623',
  },
  placeOrderBtn: {
    width: '100%',
    padding: '14px 0',
    background: '#f5a623',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 16,
    letterSpacing: 0.5,
    transition: 'background 0.2s',
  },
  placeOrderBtnDisabled: { background: '#d4b896', cursor: 'not-allowed' },
  error: {
    background: '#ffeaea',
    color: '#c0392b',
    border: '1px solid #f5b7b1',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 12,
    fontSize: 14,
  },
  success: {
    background: '#eafaf1',
    color: '#1e8449',
    border: '1px solid #a9dfbf',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 12,
    fontSize: 14,
  },
  badge: {
    display: 'inline-block',
    background: '#f5a623',
    color: '#fff',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 12,
    fontWeight: 600,
    marginLeft: 8,
  },
};

/**
 * WalkInOrderPanel
 *
 * Allows the admin to place an order for a walk-in customer without requiring
 * a registered account or phone number — the server generates a valid phone
 * automatically if none is supplied.
 */
export default function WalkInOrderPanel({ onOrderPlaced }) {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});       // { menuItemId: { item, qty } }
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMenu()
      .then((res) => setMenuItems(res.data.items || []))
      .catch(() => setError('Failed to load menu. Please refresh.'))
      .finally(() => setMenuLoading(false));
  }, []);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item._id];
      return {
        ...prev,
        [item._id]: {
          item,
          qty: existing ? existing.qty + 1 : 1,
        },
      };
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[itemId] && updated[itemId].qty > 1) {
        updated[itemId] = { ...updated[itemId], qty: updated[itemId].qty - 1 };
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const cartEntries = Object.values(cart);
  const subtotal = cartEntries.reduce(
    (sum, { item, qty }) => sum + (item.price || (item.sizes && item.sizes[0]?.price) || 0) * qty,
    0
  );

  const handlePlaceOrder = async () => {
    setError('');
    setSuccess('');

    if (cartEntries.length === 0) {
      setError('Please add at least one item to the order.');
      return;
    }

    setLoading(true);
    try {
      const items = cartEntries.map(({ item, qty }) => ({
        menuItemId: item._id,
        name: item.name,
        size: item.sizes && item.sizes[0] ? item.sizes[0].name : 'Regular',
        quantity: qty,
        price:
          item.sizes && item.sizes[0]
            ? item.sizes[0].price
            : item.price || 0,
        addons: [],
      }));

      /**
       * KEY FIX: Pass isWalkin=true so the server handles walk-in customer
       * creation correctly, generating a valid phone number if needed.
       * Do NOT pass a customerId for walk-in orders.
       */
      const orderPayload = {
        isWalkin: true,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || undefined, // server generates if missing
        items,
        paymentMethod,
        notes,
      };

      const res = await placeOrder(orderPayload);
      setSuccess(
        `✅ Order #${res.data.order.orderNumber} placed successfully!`
      );
      setCart({});
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      if (onOrderPlaced) onOrderPlaced(res.data.order);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        Walk-in Order
        <span style={styles.badge}>WALKIN</span>
      </h2>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Customer Info */}
      <div style={styles.section}>
        <h3 style={{ color: '#5a3e2b', marginBottom: 14 }}>Customer Info</h3>
        <label style={styles.label}>Name (optional)</label>
        <input
          style={styles.input}
          placeholder="Walk-in Customer"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <label style={styles.label}>Phone (optional — auto-generated if blank)</label>
        <input
          style={styles.input}
          placeholder="Auto-generated 10-digit number"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          maxLength={10}
          inputMode="numeric"
        />
      </div>

      {/* Menu */}
      <div style={styles.section}>
        <h3 style={{ color: '#5a3e2b', marginBottom: 4 }}>Select Items</h3>
        {menuLoading ? (
          <p style={{ color: '#8a6040' }}>Loading menu…</p>
        ) : (
          <div style={styles.menuGrid}>
            {menuItems.map((item) => {
              const inCart = cart[item._id];
              const price =
                item.sizes && item.sizes[0]
                  ? item.sizes[0].price
                  : item.price || 0;
              return (
                <div
                  key={item._id}
                  style={{
                    ...styles.menuCard,
                    ...(inCart ? styles.menuCardSelected : {}),
                  }}
                >
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemPrice}>₹{price}</div>
                  <div style={styles.qtyControl}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => handleRemoveFromCart(item._id)}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                      {inCart ? inCart.qty : 0}
                    </span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => handleAddToCart(item)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart summary */}
      {cartEntries.length > 0 && (
        <div style={styles.section}>
          <h3 style={{ color: '#5a3e2b', marginBottom: 10 }}>Order Summary</h3>
          {cartEntries.map(({ item, qty }) => {
            const price =
              item.sizes && item.sizes[0]
                ? item.sizes[0].price
                : item.price || 0;
            return (
              <div key={item._id} style={styles.cartItem}>
                <span style={{ color: '#3d2b1f' }}>
                  {item.name} × {qty}
                </span>
                <span style={{ color: '#5a3e2b', fontWeight: 600 }}>
                  ₹{price * qty}
                </span>
              </div>
            );
          })}
          <div style={styles.total}>
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>
        </div>
      )}

      {/* Payment & Notes */}
      <div style={styles.section}>
        <label style={styles.label}>Payment Method</label>
        <select
          style={{ ...styles.input, marginBottom: 12 }}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="bharatpe">BharatPe</option>
          <option value="card">Card</option>
          <option value="dues">Dues</option>
        </select>
        <label style={styles.label}>Notes (optional)</label>
        <input
          style={styles.input}
          placeholder="Any special instructions…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        style={{
          ...styles.placeOrderBtn,
          ...(loading || cartEntries.length === 0
            ? styles.placeOrderBtnDisabled
            : {}),
        }}
        onClick={handlePlaceOrder}
        disabled={loading || cartEntries.length === 0}
      >
        {loading ? 'Placing Order…' : 'Place Walk-in Order'}
      </button>
    </div>
  );
}
