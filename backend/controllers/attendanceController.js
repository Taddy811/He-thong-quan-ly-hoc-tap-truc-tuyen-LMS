const Attendance = require('../models/Attendance');

const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Hàm lưu điểm danh siêu tốc (Lưu 1 lúc nhiều sinh viên, nếu điểm danh lại thì ghi đè)
const saveAttendance = async (req, res) => {
  try {
    const { classId, className, subjectName, date, instructor, records } = req.body;
    
    // Tạo danh sách lệnh cập nhật/thêm mới cho Mongo
    const operations = records.map(record => ({
      updateOne: {
        filter: { classId, date, studentName: record.studentName }, // Tìm đúng Lớp, Ngày, Sinh viên
        update: { 
          $set: { classId, className, subjectName, date, instructor, studentName: record.studentName, status: record.status, note: record.note } 
        },
        upsert: true // Có thì ghi đè sửa lại, chưa có thì thêm mới
      }
    }));

    await Attendance.bulkWrite(operations); // Chạy 1 lệnh lưu tất cả
    res.status(200).json({ message: 'Lưu điểm danh thành công!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { getAttendance, saveAttendance };