const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
});

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  size: { type: String, default: 'Regular' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  addons: [addonSchema],
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    // For walk-in customers we store basic info inline
    customerName: {
      type: String,
      default: 'Walk-in Customer',
    },
    customerPhone: {
      type: String,
      default: null,
    },
    isWalkin: {
      type: Boolean,
      default: false,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    handlingCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bharatpe', 'card', 'dues'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ isWalkin: 1, createdAt: -1 });

// Exclude cancelled orders by default in list queries
orderSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, status: { $ne: 'cancelled' } });
};

module.exports = mongoose.model('Order', orderSchema);
