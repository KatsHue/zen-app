const express = require('express');
const { getProfile, upsertProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { profileValidators } = require('../middleware/validators');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, profileValidators, upsertProfile);

module.exports = router;