const express = require('express');
const router = express.Router();
const { getMyRentals, getLendingRentals, markReturned, getRental } = require('../controllers/rentalController');
const { protect } = require('../middleware/auth');

router.get('/my-rentals', protect, getMyRentals);
router.get('/lending', protect, getLendingRentals);
router.get('/:id', protect, getRental);
router.put('/:id/return', protect, markReturned);

module.exports = router;