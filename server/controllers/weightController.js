const WeightLog = require('../models/WeightLog');

function todayDateKeyUTC() {
  return new Date().toISOString().slice(0, 10);
}

async function logWeight(req, res, next) {
  try {
    const { weightKg } = req.body;
    const dateKey = req.body.date || todayDateKeyUTC();

    const entry = await WeightLog.findOneAndUpdate(
      { user: req.user._id, dateKey },
      { $set: { weightKg } },
      { new: true, upsert: true, runValidators: true, context: 'query' }
    );

    return res.status(200).json({ entry });
  } catch (error) {
    next(error);
  }
}

async function getWeights(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 365);

    const entriesDesc = await WeightLog.find({ user: req.user._id })
      .sort({ dateKey: -1 })
      .limit(limit);

    const last7 = entriesDesc.slice(0, 7);
    const rollingAverage7d =
      last7.length > 0
        ? Math.round((last7.reduce((sum, e) => sum + e.weightKg, 0) / last7.length) * 10) / 10
        : null;

    return res.status(200).json({
      entries: [...entriesDesc].reverse(),
      latestWeightKg: entriesDesc[0]?.weightKg ?? null,
      rollingAverage7d,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { logWeight, getWeights };