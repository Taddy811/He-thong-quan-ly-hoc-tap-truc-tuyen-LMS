const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Mã môn (VD: PHP001)
  name: { type: String, required: true },               // Tên môn
  description: { type: String },                        // Mô tả
  status: { type: String, default: 'Hoạt động' }        // Trạng thái
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);