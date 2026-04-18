const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests, getIncomingRequests, acceptRequest, rejectRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/incoming', protect, getIncomingRequests);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);

module.exports = router;