const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const mongoose = require('mongoose');

const secretKey = 'LMS_QR_SECRET_2026'; // Phải khớp với khóa bên file instructor

exports.scanQRCode = async (req, res) => {
  try {
    const { token, studentName } = req.body;

    // 1. Giải mã QR
    const decoded = jwt.verify(token, secretKey);

    // 2. Tìm ca học hiện tại
    const session = await Session.findById(decoded.sessionId).populate('classId');
    if (!session) return res.status(404).json({ message: 'Ca dạy không tồn tại!' });
    if (session.status === 'completed') return res.status(400).json({ message: 'Ca dạy này đã kết thúc!' });

    const cls = session.classId;

    // 3. Format ngày chuẩn (DD/MM/YYYY)
    const dateObj = new Date(session.startTime);
    const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

    // 4. Lưu vào bảng Attendance (Điểm danh)
    const Attendance = mongoose.model('Attendance'); 

    // Kiểm tra xem sinh viên đã điểm danh ca này chưa
    const existing = await Attendance.findOne({ classId: cls._id, date: dateStr, studentName: studentName });

    if (existing) {
      if (existing.status === 'Có mặt') return res.status(200).json({ message: 'Bạn đã điểm danh ca này rồi!' });
      existing.status = 'Có mặt';
      existing.note = 'Điểm danh bằng QR';
      await existing.save();
    } else {
      // Nếu chưa có tên trong danh sách, tạo mới
      await Attendance.create({
        classId: cls._id,
        className: cls.name,
        subjectName: cls.subject,
        date: dateStr,
        studentName: studentName,
        status: 'Có mặt',
        note: 'Điểm danh bằng QR'
      });
    }

    res.status(200).json({ message: '✅ Điểm danh thành công!', className: cls.name });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: '❌ Mã QR đã quá 60 giây! Vui lòng xin Giảng viên mã mới.' });
    }
    res.status(500).json({ message: 'Mã QR không hợp lệ!' });
  }
};