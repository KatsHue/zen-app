const Profile = require('../models/Profile');

const ALLOWED_FIELDS = [
  'sex',
  'age',
  'heightCm',
  'activityLevel',
  'renalEnabled',
  'renalStageId',
  'dialysisModality',
  'activeGoalKey',
  'proteinGPerKg',
];

async function getProfile(req, res, next) {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
}

async function upsertProfile(req, res, next) {
  try {
    const update = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: update, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true, context: 'query' }
    );

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, upsertProfile };