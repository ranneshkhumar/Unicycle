const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['Books', 'Electronics', 'Lab Equipment', 'Clothing', 'Other'] },
  listingType: { type: String, required: true, enum: ['Rent', 'Sell', 'Free'], default: 'Rent' },
  pricePerDay: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  availableFrom: { type: Date, default: Date.now },
  availableTo: { type: Date },
  images: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAvailable: { type: Boolean, default: true },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair'], default: 'Good' },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalRentals: { type: Number, default: 0 },
  tags: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);