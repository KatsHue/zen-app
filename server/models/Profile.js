const mongoose = require('mongoose');

const ACTIVITY_LEVELS = [
  'none',
  'walk_occasional',
  'walk_3_4',
  'walk_5',
  'walk_strength_2',
  'walk_strength_3',
  'walk_20k_5',
];

const RENAL_STAGES = ['g1', 'g2', 'g3a', 'g3b', 'g4', 'g5'];
const DIALYSIS_MODALITIES = ['none', 'hemodialysis', 'peritoneal'];
const GOAL_KEYS = ['maintenance', 'deficit_0_5', 'deficit_0_8', 'deficit_1', 'recomp'];

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    sex: { type: String, enum: ['male', 'female'], default: 'female' },
    age: { type: Number, min: 10, max: 119 },
    heightCm: { type: Number, min: 100, max: 259 },
    activityLevel: { type: String, enum: ACTIVITY_LEVELS, default: 'none' },
    renalEnabled: { type: Boolean, default: false },
    renalStageId: { type: String, enum: RENAL_STAGES, default: 'g1' },
    dialysisModality: { type: String, enum: DIALYSIS_MODALITIES, default: 'none' },
    activeGoalKey: { type: String, enum: GOAL_KEYS, default: 'maintenance' },
    proteinGPerKg: { type: Number, min: 1.0, max: 3.0, default: 1.8 },
  },
  { timestamps: true }
);

profileSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Profile', profileSchema);
module.exports.ACTIVITY_LEVELS = ACTIVITY_LEVELS;
module.exports.RENAL_STAGES = RENAL_STAGES;
module.exports.DIALYSIS_MODALITIES = DIALYSIS_MODALITIES;
module.exports.GOAL_KEYS = GOAL_KEYS;