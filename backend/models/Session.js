const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String },
  dateInput: { type: String },
  dayOfWeek: { type: String },
  note: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number },
  salaryEarned: { type: Number, default: 0 },
  status: { type: String, default: 'ongoing' },
  source: { type: String, enum: ['manual', 'qr'], default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
