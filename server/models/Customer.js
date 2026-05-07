const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Walk-in Customer',
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    isWalkin: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    dues: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for quick phone lookups
customerSchema.index({ phone: 1 });
customerSchema.index({ isWalkin: 1 });

module.exports = mongoose.model('Customer', customerSchema);
