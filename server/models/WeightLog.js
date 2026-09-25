const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 20,
      max: 400,
    },
  },
  { timestamps: true }
);

weightLogSchema.index({ user: 1, dateKey: 1 }, { unique: true });

weightLogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('WeightLog', weightLogSchema);