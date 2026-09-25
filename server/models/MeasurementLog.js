const mongoose = require('mongoose');

const measurementLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    monthKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
    chestCm: { type: Number, min: 0, max: 300 },
    waistCm: { type: Number, min: 0, max: 300 },
    hipCm: { type: Number, min: 0, max: 300 },
    abdomenCm: { type: Number, min: 0, max: 300 },
  },
  { timestamps: true }
);

measurementLogSchema.index({ user: 1, monthKey: 1 }, { unique: true });

measurementLogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('MeasurementLog', measurementLogSchema);