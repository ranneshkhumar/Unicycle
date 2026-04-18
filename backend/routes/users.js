const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/:id', getUserProfile);
router.put('/profile/update', protect, upload.single('profileImage'), updateProfile);

module.exports = router;