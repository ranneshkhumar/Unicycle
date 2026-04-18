const Review = require('../models/Review');
const Item = require('../models/Item');
const Rental = require('../models/Rental');
const Notification = require('../models/Notification');

const createReview = async (req, res) => {
  try {
    const { rentalId, rating, comment } = req.body;
    const rental = await Rental.findById(rentalId).populate('item');
    if (!rental || rental.status !== 'completed') return res.status(400).json({ success: false, message: 'Rental not completed' });
    if (rental.renter.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only renter can review' });
    const existing = await Review.findOne({ rental: rentalId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
    const review = await Review.create({ rental: rentalId, item: rental.item._id, reviewer: req.user._id, reviewedUser: rental.owner, rating, comment });
    const itemReviews = await Review.find({ item: rental.item._id });
    const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
    await Item.findByIdAndUpdate(rental.item._id, { rating: avgRating.toFixed(1), totalRatings: itemReviews.length });
    await Notification.create({ recipient: rental.owner, type: 'review_received', message: `You received a ${rating}-star review for "${rental.item.title}"`, relatedItem: rental.item._id });
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId }).populate('reviewer', 'name profileImage university').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getItemReviews };