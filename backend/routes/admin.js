const express = require('express');
const router = express.Router();
const { getDashboard, getAllUsers, getAllItems, removeItem, toggleUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/items', protect, adminOnly, getAllItems);
router.delete('/items/:id', protect, adminOnly, removeItem);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;