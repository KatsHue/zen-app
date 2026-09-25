const express = require('express');
const { upsertDailyLog, getMonthLogs, getWeekLogs } = require('../controllers/dailyLogController');
const { protect } = require('../middleware/authMiddleware');
const { dailyLogValidators } = require('../middleware/validators');

const router = express.Router();

router.get('/month', protect, getMonthLogs);
router.get('/week', protect, getWeekLogs);
router.post('/', protect, dailyLogValidators, upsertDailyLog);

module.exports = router;