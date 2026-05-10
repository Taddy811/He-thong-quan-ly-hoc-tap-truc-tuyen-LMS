const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Mã ngành (VD: SE, AI)
  name: { type: String, required: true },               // Tên ngành
  description: { type: String },                        // Mô tả
  status: { type: String, default: 'Hoạt động' }        // Trạng thái
}, { timestamps: true });

module.exports = mongoose.model('Major', majorSchema);