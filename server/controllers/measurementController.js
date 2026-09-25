const MeasurementLog = require('../models/MeasurementLog');

function currentMonthKeyUTC() {
  return new Date().toISOString().slice(0, 7);
}

async function upsertMeasurement(req, res, next) {
  try {
    const monthKey = req.body.month || currentMonthKeyUTC();
    const update = {};
    ['chestCm', 'waistCm', 'hipCm', 'abdomenCm'].forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const entry = await MeasurementLog.findOneAndUpdate(
      { user: req.user._id, monthKey },
      { $set: update, $setOnInsert: { user: req.user._id, monthKey } },
      { new: true, upsert: true, runValidators: true, context: 'query' }
    );

    return res.status(200).json({ entry });
  } catch (error) {
    next(error);
  }
}

async function getMeasurements(req, res, next) {
  try {
    const entries = await MeasurementLog.find({ user: req.user._id }).sort({ monthKey: 1 });
    return res.status(200).json({ entries });
  } catch (error) {
    next(error);
  }
}

module.exports = { upsertMeasurement, getMeasurements };