const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  subject: { type: String, required: true },            
  major: { type: String, required: true },              
  instructor: { type: String, required: true },         
  startDate: { type: String },                          
  shift: { type: String },                              
  totalSessions: { type: Number },                      // Số buổi học
  maxStudents: { type: Number },                        // Sĩ số tối đa
  room: { type: String },                               
  scheduleDays: { type: [String] },                     // Ngày học trong tuần (Thứ 2, Thứ 3...)
  students: { type: [String] },                         // Danh sách sinh viên tham gia
  onlineLink: { type: String },                         // Link học online
  description: { type: String },                        // Mô tả
  status: { type: String, default: 'Hoạt động' }        
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);