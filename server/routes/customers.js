const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/customers - list all active customers
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const customers = await Customer.find({ status: 'active' }).sort({
      createdAt: -1,
    });
    res.json({ success: true, customers });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id - get a single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (err) {
    console.error('Error fetching customer:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch customer' });
  }
});

// POST /api/customers - register a new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!phone || !/^[7-9]\d{9}$/.test(phone)) {
      return res
        .status(400)
        .json({ success: false, message: 'A valid 10-digit phone number starting with 7, 8, or 9 is required' });
    }

    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Customer with this phone already exists', customer: existing });
    }

    const customer = await Customer.create({ name, phone, email });
    res.status(201).json({ success: true, customer });
  } catch (err) {
    console.error('Customer creation failed:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create customer' });
  }
});

// PATCH /api/customers/:id/fcm-token - update FCM token
router.patch('/:id/fcm-token', async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { fcmToken },
      { new: true }
    );
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (err) {
    console.error('FCM token update failed:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update FCM token' });
  }
});

module.exports = router;
