const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  date: { type: String, required: true },       // Ngày (VD: 20/09/2025)
  dayOfWeek: { type: String },                  // Thứ (VD: Thứ bảy)
  note: { type: String },                       // Ghi chú
  status: { type: String, default: 'Chưa điểm danh' } // Chưa điểm danh / Đã điểm danh
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);