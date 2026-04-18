const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  type: { type: String, enum: ['item', 'user'], default: 'item' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);