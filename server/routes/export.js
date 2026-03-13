const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const { verifyAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

/**
 * GET /api/export/orders
 * Download all non-cancelled orders as an Excel (.xlsx) file.
 * Admin only.
 */
router.get('/orders', apiLimiter, verifyAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { status: { $ne: 'cancelled' } };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone isWalkin');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Mr Smoothy';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Orders');

    // Header row
    sheet.columns = [
      { header: 'Order #', key: 'orderNumber', width: 22 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Customer', key: 'customerName', width: 24 },
      { header: 'Phone', key: 'customerPhone', width: 16 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Items', key: 'items', width: 40 },
      { header: 'Subtotal (₹)', key: 'subtotal', width: 14 },
      { header: 'Handling (₹)', key: 'handling', width: 14 },
      { header: 'Total (₹)', key: 'total', width: 14 },
      { header: 'Payment', key: 'paymentMethod', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5A3E2B' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Data rows
    orders.forEach((order) => {
      const itemsSummary = order.items
        .map((i) => `${i.name} x${i.quantity}`)
        .join(', ');

      sheet.addRow({
        orderNumber: order.orderNumber,
        date: order.createdAt
          ? order.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          : '',
        customerName: order.customerName || 'Walk-in Customer',
        customerPhone: order.customerPhone || '-',
        type: order.isWalkin ? 'Walk-in' : 'Registered',
        items: itemsSummary,
        subtotal: order.subtotal,
        handling: order.handlingCharges || 0,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
      });
    });

    // Auto-filter on header row
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="mrsmoothy-orders-${Date.now()}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel export failed:', err);
    res.status(500).json({ success: false, message: 'Excel export failed' });
  }
});

module.exports = router;
