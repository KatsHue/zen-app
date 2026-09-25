const express = require('express');
const { logWeight, getWeights } = require('../controllers/weightController');
const { protect } = require('../middleware/authMiddleware');
const { weightValidators } = require('../middleware/validators');

const router = express.Router();

router.get('/', protect, getWeights);
router.post('/', protect, weightValidators, logWeight);

module.exports = router;