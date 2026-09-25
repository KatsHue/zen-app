const DailyLog = require('../models/DailyLog');
const { getWeekRange } = require('../utils/week');

function todayDateKeyUTC() {
  return new Date().toISOString().slice(0, 10);
}

async function upsertDailyLog(req, res, next) {
  try {
    const dateKey = req.body.date || todayDateKeyUTC();
    const update = {};
    if (req.body.kcalConsumed !== undefined) update.kcalConsumed = req.body.kcalConsumed;
    if (req.body.notes !== undefined) update.notes = req.body.notes;

    const entry = await DailyLog.findOneAndUpdate(
      { user: req.user._id, dateKey },
      { $set: update, $setOnInsert: { user: req.user._id, dateKey } },
      { new: true, upsert: true, runValidators: true, context: 'query' }
    );

    return res.status(200).json({ entry });
  } catch (error) {
    next(error);
  }
}

async function getMonthLogs(req, res, next) {
  try {
    const month = req.query.month;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Parámetro "month" inválido; usa el formato YYYY-MM.' });
    }

    const entries = await DailyLog.find({
      user: req.user._id,
      dateKey: { $regex: `^${month}` },
    }).sort({ dateKey: 1 });

    return res.status(200).json({ entries });
  } catch (error) {
    next(error);
  }
}

async function getWeekLogs(req, res, next) {
  try {
    const dateKey = req.query.date || todayDateKeyUTC();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return res.status(400).json({ message: 'Parámetro "date" inválido; usa el formato YYYY-MM-DD.' });
    }

    const { weekStart, weekEnd } = getWeekRange(dateKey);

    const entries = await DailyLog.find({
      user: req.user._id,
      dateKey: { $gte: weekStart, $lte: weekEnd },
    }).sort({ dateKey: 1 });

    const totalKcal = entries.reduce((sum, e) => sum + (e.kcalConsumed || 0), 0);

    return res.status(200).json({ weekStart, weekEnd, entries, totalKcal });
  } catch (error) {
    next(error);
  }
}

module.exports = { upsertDailyLog, getMonthLogs, getWeekLogs };