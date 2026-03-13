const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { verifyAdmin } = require('../middleware/auth');
const { generateWalkinPhone, buildOrderNumber } = require('../utils/helpers');

/**
 * Generate a unique order number: e.g. ORD-20260313-0042
 */
async function generateOrderNumber() {
  const count = await Order.countDocuments();
  return buildOrderNumber(count);
}

// GET /api/orders - list all non-cancelled orders (admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone isWalkin');
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - get a single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'customer',
      'name phone isWalkin'
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// GET /api/orders/customer/:customerId - get orders for a specific customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.params.customerId,
      status: { $ne: 'cancelled' },
    }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch orders' });
  }
});

/**
 * POST /api/orders - create a new order
 *
 * Walk-in customer handling:
 *   - If isWalkin is true (or no customerId), treat as walk-in.
 *   - Generate a valid 10-digit phone if none is provided.
 *   - Store customer info inline on the order without requiring a DB customer record.
 *   - Optionally create a temporary Customer document for tracking.
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      isWalkin,
      items,
      paymentMethod,
      notes,
      handlingCharges,
    } = req.body;

    // ---------- Validate items ----------
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Order must have at least one item' });
    }

    // ---------- Resolve customer ----------
    let resolvedCustomerId = null;
    let resolvedCustomerName = 'Walk-in Customer';
    let resolvedCustomerPhone = null;
    let resolvedIsWalkin = Boolean(isWalkin) || !customerId;

    if (resolvedIsWalkin) {
      // Walk-in order: generate phone if not provided
      resolvedCustomerName = customerName || 'Walk-in Customer';
      resolvedCustomerPhone = customerPhone || generateWalkinPhone();

      // Create a temporary Customer record so the order can be linked.
      // NOTE: We look up by the generated phone to avoid duplicates within
      // the same session, but we do NOT use the cancelled-orders filter here —
      // walk-in customers are always active.
      try {
        let walkinCustomer = await Customer.findOne({
          phone: resolvedCustomerPhone,
          isWalkin: true,
        });

        if (!walkinCustomer) {
          walkinCustomer = await Customer.create({
            name: resolvedCustomerName,
            phone: resolvedCustomerPhone,
            isWalkin: true,
            status: 'active',
          });
        }
        resolvedCustomerId = walkinCustomer._id;
      } catch (customerErr) {
        // Non-fatal: log and continue without a linked customer record.
        console.error(
          'Walk-in customer record creation failed (non-fatal):',
          customerErr
        );
      }
    } else {
      // Registered customer order
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid customer ID' });
      }

      // Fetch the customer — do NOT filter by cancelled status here, as
      // the customer document itself is never "cancelled"; only orders are.
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: 'Customer not found' });
      }

      resolvedCustomerId = customer._id;
      resolvedCustomerName = customer.name;
      resolvedCustomerPhone = customer.phone;
    }

    // ---------- Calculate totals ----------
    let subtotal = 0;
    const processedItems = items.map((item) => {
      const addonTotal = (item.addons || []).reduce(
        (sum, a) => sum + (Number(a.price) || 0),
        0
      );
      const itemSubtotal =
        (Number(item.price) + addonTotal) * Number(item.quantity);
      subtotal += itemSubtotal;
      return {
        menuItemId: item.menuItemId,
        name: item.name,
        size: item.size || 'Regular',
        quantity: Number(item.quantity),
        price: Number(item.price),
        addons: item.addons || [],
        subtotal: itemSubtotal,
      };
    });

    const resolvedHandlingCharges = Number(handlingCharges) || 0;
    const total = subtotal + resolvedHandlingCharges;

    // ---------- Create the order ----------
    const orderNumber = await generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      customer: resolvedCustomerId,
      customerName: resolvedCustomerName,
      customerPhone: resolvedCustomerPhone,
      isWalkin: resolvedIsWalkin,
      items: processedItems,
      subtotal,
      handlingCharges: resolvedHandlingCharges,
      total,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
      status: 'pending',
    });

    const populatedOrder = await Order.findById(order._id).populate(
      'customer',
      'name phone isWalkin'
    );

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: err.message,
    });
  }
});

// PATCH /api/orders/:id/status - update order status (admin)
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid status' });
    }

    const update = { status };
    if (status === 'cancelled') {
      update.cancelledAt = new Date();
      update.cancelReason = cancelReason || 'Cancelled by admin';
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate('customer', 'name phone isWalkin');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('Status update failed:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update order status' });
  }
});

// DELETE /api/orders/:id - cancel an order (soft delete)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: req.body.reason || 'Cancelled',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    console.error('Order cancellation failed:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to cancel order' });
  }
});

module.exports = router;
