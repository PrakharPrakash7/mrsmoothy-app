const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    sizes: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    // Legacy single-price support
    price: { type: Number, default: 0 },
    availableAddons: [
      {
        name: { type: String, required: true },
        price: { type: Number, default: 0 },
      },
    ],
    isAvailable: { type: Boolean, default: true },
    handlingCap: { type: Number, default: 0 },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
