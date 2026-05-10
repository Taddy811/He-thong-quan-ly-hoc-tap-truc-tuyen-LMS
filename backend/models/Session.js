const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  startTime: { type: Date }, // Thời điểm giáo viên bấm "Bắt đầu dạy"
  endTime: { type: Date },   // Thời điểm giáo viên bấm "Kết thúc ca"
  duration: { type: Number }, // Tổng số phút dạy (tính toán khi kết thúc)
  salaryEarned: { type: Number, default: 0 }, // Tiền lương buổi đó
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);