const express = require('express');
const { upsertMeasurement, getMeasurements } = require('../controllers/measurementController');
const { protect } = require('../middleware/authMiddleware');
const { measurementValidators } = require('../middleware/validators');

const router = express.Router();

router.get('/', protect, getMeasurements);
router.post('/', protect, measurementValidators, upsertMeasurement);

module.exports = router;