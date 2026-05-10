const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  classId: { type: String, required: true },
  className: { type: String, required: true },
  subjectName: { type: String },
  studentName: { type: String, required: true },
  date: { type: String, required: true }, // Ngày điểm danh (VD: 23/09/2025)
  status: { type: String, required: true }, // Có mặt, Vắng, Muộn
  note: { type: String },
  instructor: { type: String } // Tên giảng viên điểm danh
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);