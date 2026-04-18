const User = require('../models/User');
const Item = require('../models/Item');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const items = await Item.find({ owner: req.params.id, isActive: true });
    res.json({ success: true, user, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, university, bio } = req.body;
    const updates = { name, university, bio };
    if (req.file) updates.profileImage = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateProfile };