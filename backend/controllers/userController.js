const mongoose = require('mongoose');
const User = require('../models/User'); // Model gốc
const SalaryHistory = require('../models/SalaryHistory');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');

// =================================================================
// 1. HÀM THÊM MỚI NGƯỜI DÙNG THỦ CÔNG (Mật khẩu chữ thường)
// =================================================================
exports.createUser = async (req, res) => {
  try {
    const { username, name, email, phone, major, role, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã tồn tại trên hệ thống!' });
    }

    const newUser = new User({
      username,
      name,
      email,
      phone,
      major,
      role,
      password: password || '123456' // Mặc định 123456 nếu không nhập
    });

    await newUser.save();
    res.status(201).json({ message: 'Thêm người dùng thành công!', user: newUser });
  } catch (error) {
    res.status(500).json({ message: `Lỗi thêm người dùng: ${error.message}` });
  }
};

// =================================================================
// 2. HÀM NẠP NGƯỜI DÙNG TỪ FILE EXCEL (hash mật khẩu trước khi lưu)
// =================================================================
exports.importUsers = async (req, res) => {
  try {
    const { users } = req.body; 

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Danh sách dữ liệu Excel trống!' });
    }

    const preparedUsers = await Promise.all(users.map(async (u) => ({
      username: u.username || u.email.split('@')[0],
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      major: u.major || '',
      role: u.role || 'student',
      password: await bcrypt.hash(String(u.password || '123456'), 10)
    })));

    await User.insertMany(preparedUsers);
    res.status(200).json({ message: `Nạp thành công ${preparedUsers.length} người dùng từ file Excel!` });
  } catch (error) {
    res.status(500).json({ message: `Lỗi nạp file Excel: ${error.message}` });
  }
};

// =================================================================
// 3. HÀM CẬP NHẬT THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU
// =================================================================
exports.updateProfile = async (req, res) => {
  try {
    const { userId, name, oldPassword, newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Mã tài khoản không hợp lệ!' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });

    if (name) user.name = name;

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại!' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác!' });
      }

      user.password = newPassword; 
    }

    await user.save();

    res.status(200).json({
      message: 'Cập nhật tài khoản thành công!',
      user: { id: user._id, _id: user._id, username: user.username, email: user.email, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error("Lỗi Backend:", error);
    res.status(500).json({ message: `Lỗi Backend: ${error.message}` });
  }
};

// =================================================================
// 4. HÀM LẤY LỊCH SỬ LƯƠNG BẤT TỬ (QUÉT BÙ ĐIỂM DANH CŨ)
// =================================================================
exports.getInstructorSalaryHistory = async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Chống lỗi crash màn hình khi ID sai cấu trúc
    if (!instructorId || instructorId === 'undefined' || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(200).json([]);
    }

    const User = mongoose.models.User || mongoose.models.user || require('../models/User');
    const instructorUser = await User.findById(instructorId);

    if (instructorUser) {
      const cleanName = instructorUser.name.replace(/(ThS\.|TS\.|Thạc sĩ|Tiến sĩ)\s*/i, '').trim();
      
      const allAttendances = await Attendance.find({ 
        instructor: { $regex: new RegExp(cleanName, 'i') } 
      });

      const uniqueSessions = {};
      allAttendances.forEach(att => {
        const key = `${att.classId}_${att.date}`;
        if (!uniqueSessions[key]) {
          uniqueSessions[key] = { classId: att.classId, date: att.date };
        }
      });

      const sessionList = Object.values(uniqueSessions);

      for (const session of sessionList) {
        if (session.classId && mongoose.Types.ObjectId.isValid(session.classId)) {
          const isSalaryExist = await SalaryHistory.findOne({
            instructorId: instructorId,
            classId: session.classId,
            date: session.date
          });

          if (!isSalaryExist) {
            const standardDuration = 120;
            const standardSalary = 400000;
            const mockTime = new Date();

            await SalaryHistory.create({
              instructorId: instructorId,
              classId: session.classId,
              date: session.date,
              startTime: mockTime,
              endTime: new Date(mockTime.getTime() + standardDuration * 60000),
              duration: standardDuration,
              salaryEarned: standardSalary
            });
          }
        }
      }
    }

    const history = await SalaryHistory.find({ instructorId })
      .populate('classId') 
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    console.error("Lỗi lấy lịch sử lương:", error);
    res.status(500).json({ message: `Lỗi Backend: ${error.message}` });
  }
};
