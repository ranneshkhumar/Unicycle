const Rental = require('../models/Rental');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

const getMyRentals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { renter: req.user._id };
    if (status) query.status = status;
    const rentals = await Rental.find(query).populate('item', 'title images pricePerDay category').populate('owner', 'name profileImage university').sort({ createdAt: -1 });
    res.json({ success: true, rentals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLendingRentals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;
    const rentals = await Rental.find(query).populate('item', 'title images pricePerDay category').populate('renter', 'name profileImage university rating').sort({ createdAt: -1 });
    res.json({ success: true, rentals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markReturned = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('item');
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });
    if (rental.owner.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    rental.status = 'completed';
    rental.returnedAt = new Date();
    await rental.save();
    await Item.findByIdAndUpdate(rental.item._id, { isAvailable: true });
    await Notification.create({ recipient: rental.renter, type: 'item_returned', message: `"${rental.item.title}" marked as returned. Please leave a review!`, relatedItem: rental.item._id });
    res.json({ success: true, message: 'Rental completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('item').populate('renter', 'name profileImage university').populate('owner', 'name profileImage university');
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });
    res.json({ success: true, rental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyRentals, getLendingRentals, markReturned, getRental };