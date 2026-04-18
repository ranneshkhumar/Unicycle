const User = require('../models/User');
const Item = require('../models/Item');
const Rental = require('../models/Rental');

const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments({ isActive: true });
    const totalRentals = await Rental.countDocuments();
    const activeRentals = await Rental.countDocuments({ status: 'active' });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentItems = await Item.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).populate('owner', 'name');
    res.json({ success: true, stats: { totalUsers, totalItems, totalRentals, activeRentals }, recentUsers, recentItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    await Item.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getAllUsers, getAllItems, removeItem, toggleUserStatus };