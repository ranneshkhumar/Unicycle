const Request = require('../models/Request');
const Rental = require('../models/Rental');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

const createRequest = async (req, res) => {
  try {
    const { itemId, startDate, endDate, message } = req.body;
    const item = await Item.findById(itemId);
    if (!item || !item.isActive || !item.isAvailable) return res.status(400).json({ success: false, message: 'Item not available' });
    if (item.owner.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot rent your own item' });
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (totalDays <= 0) return res.status(400).json({ success: false, message: 'Invalid date range' });
    const request = await Request.create({ item: itemId, requester: req.user._id, owner: item.owner, startDate: start, endDate: end, totalDays, totalAmount: totalDays * item.pricePerDay, message });
    await Notification.create({ recipient: item.owner, type: 'request_received', message: `${req.user.name} requested to rent "${item.title}"`, relatedItem: item._id, relatedRequest: request._id });
    await request.populate(['item', 'requester', 'owner']);
    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id }).populate('item', 'title images pricePerDay category').populate('owner', 'name profileImage').sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id }).populate('item', 'title images pricePerDay category').populate('requester', 'name profileImage university rating').sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('item');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.owner.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });
    const rental = await Rental.create({ item: request.item._id, renter: request.requester, owner: request.owner, startDate: request.startDate, endDate: request.endDate, totalDays: request.totalDays, totalAmount: request.totalAmount, request: request._id, notes: request.message });
    request.status = 'accepted';
    request.rental = rental._id;
    await request.save();
    await Item.findByIdAndUpdate(request.item._id, { isAvailable: false });
    await Notification.create({ recipient: request.requester, type: 'request_accepted', message: `Your request for "${request.item.title}" was accepted!`, relatedItem: request.item._id, relatedRequest: request._id });
    res.json({ success: true, message: 'Request accepted', rental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('item');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.owner.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    request.status = 'rejected';
    await request.save();
    await Notification.create({ recipient: request.requester, type: 'request_rejected', message: `Your request for "${request.item.title}" was not accepted.`, relatedItem: request.item._id, relatedRequest: request._id });
    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, getIncomingRequests, acceptRequest, rejectRequest };