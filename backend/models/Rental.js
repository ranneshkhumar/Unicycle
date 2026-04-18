const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  returnedAt: { type: Date },
  notes: { type: String, default: '' },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);