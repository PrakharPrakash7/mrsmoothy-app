const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/menu - list all available menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({
      category: 1,
      name: 1,
    });
    res.json({ success: true, items });
  } catch (err) {
    console.error('Error fetching menu:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch menu items' });
  }
});

// GET /api/menu/:id - get single menu item
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, item });
  } catch (err) {
    console.error('Error fetching menu item:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch menu item' });
  }
});

// POST /api/menu - create a menu item (admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error('Menu item creation failed:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create menu item' });
  }
});

// PATCH /api/menu/:id - update a menu item (admin)
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, item });
  } catch (err) {
    console.error('Menu item update failed:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update menu item' });
  }
});

// DELETE /api/menu/:id - delete a menu item (admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    console.error('Menu item deletion failed:', err);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete menu item' });
  }
});

module.exports = router;
