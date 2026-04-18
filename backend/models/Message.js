const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: String, required: true }, // conversationId = sorted userId1_userId2
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);