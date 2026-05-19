const mongoose = require('mongoose');

const salaryHistorySchema = new mongoose.Schema(
  {
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: String, required: true }, 
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, default: 120 }, 
    salaryEarned: { type: Number, default: 400000 } 
  },
  { timestamps: true }
);

module.exports = mongoose.models.SalaryHistory || mongoose.model('SalaryHistory', salaryHistorySchema);