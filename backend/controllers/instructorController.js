const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const secretKey = process.env.QR_SECRET || 'LMS_QR_SECRET_2026'; // Khóa bảo mật tạo QR

const formatDate = (date = new Date()) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

// 1. Chấm công: Bắt đầu ca dạy
const startSession = async (req, res) => {
  try {
    const { classId, instructorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: 'Dữ liệu lớp học hoặc giảng viên không hợp lệ' });
    }

    const session = await Session.create({
      classId,
      instructorId,
      date: formatDate(),
      startTime: new Date(),
      source: 'qr'
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Tạo mã QR (Hết hạn sau 60s)
const generateQR = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Mã ca dạy không hợp lệ' });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Không tìm thấy ca dạy' });
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Ca dạy này đã kết thúc' });
    }

    const token = jwt.sign({ sessionId: session._id.toString() }, secretKey, { expiresIn: '60s' });
    res.json({ qrToken: token, sessionId: session._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Kết thúc dạy & Tính lương
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    
    if (!session) return res.status(404).json({ message: 'Không tìm thấy ca dạy' });

    const endTime = new Date();
    const diffMs = endTime - session.startTime;
    const durationMinutes = Math.floor(diffMs / 60000); // Đổi ra phút
    
    // Giả sử: 200,000 VNĐ / 60 phút (Bạn có thể đổi số này tùy ý)
    const ratePerMinute = 200000 / 60;
    const totalSalary = Math.round(durationMinutes * ratePerMinute);

    session.endTime = endTime;
    session.duration = durationMinutes;
    session.salaryEarned = totalSalary;
    session.status = 'completed';
    
    await session.save();
    res.json({ message: "Đã hoàn thành ca dạy!", session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Lịch sử lớp đã dạy
const getTeachingHistory = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const history = await Session.find({ instructorId, status: 'completed' })
      .populate('classId', 'name subject room')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { startSession, generateQR, endSession, getTeachingHistory };
