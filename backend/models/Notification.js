const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['request_received', 'request_accepted', 'request_rejected', 'item_returned', 'review_received'], required: true },
  message: { type: String, required: true },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);