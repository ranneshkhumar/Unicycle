const Message = require('../models/Message');
const User = require('../models/User');

// Generate consistent conversation ID from two user IDs
const getConversationId = (userId1, userId2) => {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

// @route POST /api/messages
// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, relatedItemId } = req.body;
    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required' });
    }
    const conversationId = getConversationId(req.user._id, receiverId);
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      text,
      relatedItem: relatedItemId || null,
    });
    await message.populate('sender', 'name profileImage');
    await message.populate('receiver', 'name profileImage');
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/messages/:userId
// Get conversation between current user and another user
const getConversation = async (req, res) => {
  try {
    const conversationId = getConversationId(req.user._id, req.params.userId);
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .populate('relatedItem', 'title images')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/messages/inbox
// Get all conversations for current user
const getInbox = async (req, res) => {
  try {
    // Get all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .populate('relatedItem', 'title images')
      .sort({ createdAt: -1 });

    // Group by conversation - get latest message per conversation
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.conversation]) {
        conversations[msg.conversation] = msg;
      }
    });

    // Count unread
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.json({ success: true, conversations: Object.values(conversations), unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getConversation, getInbox };