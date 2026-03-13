import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin JWT token to every request when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginAdmin = (username, password) =>
  api.post('/auth/login', { username, password });

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const fetchMenu = () => api.get('/menu');

// ─── Orders ───────────────────────────────────────────────────────────────────
export const fetchOrders = () => api.get('/orders');
export const fetchOrdersByCustomer = (customerId) =>
  api.get(`/orders/customer/${customerId}`);
export const fetchOrder = (id) => api.get(`/orders/${id}`);

/**
 * Place an order.
 *
 * For walk-in customers pass `isWalkin: true` and optionally a `customerName`.
 * A valid 10-digit phone is generated server-side if `customerPhone` is omitted.
 *
 * @param {Object} orderData
 * @param {boolean} [orderData.isWalkin]
 * @param {string}  [orderData.customerId]  - required for registered customers
 * @param {string}  [orderData.customerName]
 * @param {string}  [orderData.customerPhone]
 * @param {Array}   orderData.items
 * @param {string}  [orderData.paymentMethod]
 * @param {number}  [orderData.handlingCharges]
 * @param {string}  [orderData.notes]
 */
export const placeOrder = (orderData) => api.post('/orders', orderData);

export const updateOrderStatus = (id, status, cancelReason) =>
  api.patch(`/orders/${id}/status`, { status, cancelReason });

// ─── Customers ────────────────────────────────────────────────────────────────
export const fetchCustomers = () => api.get('/customers');
export const fetchCustomer = (id) => api.get(`/customers/${id}`);
export const registerCustomer = (data) => api.post('/customers', data);

export default api;
