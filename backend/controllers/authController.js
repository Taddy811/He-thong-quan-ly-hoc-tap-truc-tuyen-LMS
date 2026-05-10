const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, major, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    // ĐÃ SỬA: Mặc định phải là 'student' để đảm bảo an toàn
    const finalRole = role === "" || !role ? "student" : role;

    const user = await User.create({
      name, username, email, phone, major, password, role: finalRole
    });

    res.status(201).json({ message: `Đăng ký thành công!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hàm import danh sách người dùng (Excel)
const importUsersBulk = async (req, res) => {
  try {
    const usersData = req.body; // Nhận mảng dữ liệu từ Frontend

    if (!usersData || !Array.isArray(usersData) || usersData.length === 0) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    // Tạo mật khẩu mặc định (ví dụ: 123456)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // ĐÃ SỬA: Xóa chữ "usersToInsert =" bị dư
    const bulkOps = usersData.map(user => ({
      updateOne: {
        filter: { email: user.email }, // Kiểm tra trùng email
        update: { 
          $setOnInsert: { 
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            major: user.major || "",
            role: user.role, // Đã chuẩn để lấy từ Excel
            username: user.username,
            password: hashedPassword
          } 
        },
        upsert: true // Chỉ thêm mới nếu chưa có
      }
    }));

    // Thực thi lệnh chèn hàng loạt
    const result = await User.bulkWrite(bulkOps);

    res.status(201).json({ 
      message: 'Nhập dữ liệu thành công!', 
      insertedCount: result.upsertedCount 
    });

  } catch (error) {
    console.error("Lỗi import:", error);
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({ $or: [{ email: loginId }, { username: loginId }] });

    if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không chính xác!' });

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.status(200).json({ message: 'Đã xoá người dùng thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, username, email, phone, major, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, username, email, phone, major, role },
      { new: true } 
    ).select('-password');
    
    if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.status(200).json({ message: 'Cập nhật thành công!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================================
// HÀM LIÊN KẾT DATA: QUÊN MẬT KHẨU
// =====================================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
        return res.status(404).json({ message: "Email này chưa được đăng ký trong hệ thống!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'td27790@gmail.com', 
        pass: 'cucxshpmohypltnp' 
      }
    });

    const mailOptions = {
      from: 'Hệ thống LMS E-LEARNING <td27790@gmail.com>', 
      to: user.email,
      subject: 'Mã khôi phục mật khẩu - LMS E-LEARNING',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
          <h3 style="color: #5b51d8;">Xin chào ${user.name || user.username},</h3>
          <p>Bạn vừa yêu cầu khôi phục mật khẩu tài khoản hệ thống.</p>
          <p>Mã OTP xác nhận của bạn là:</p>
          <div style="font-size: 32px; font-weight: bold; color: #5b51d8; background: #f0f7ff; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: red; font-size: 14px;"><i>* Lưu ý: Mã này sẽ hết hạn sau 15 phút. Tuyệt đối không chia sẻ mã này.</i></p>
          <p>Trân trọng,<br>Đội ngũ LMS E-LEARNING xin cảm ơn!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Mã OTP đã được gửi về email đăng ký của bạn!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================================
// HÀM LIÊN KẾT DATA: XÁC NHẬN OTP & ĐỔI MẬT KHẨU
// =====================================================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({
      email: email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn!" });

    user.password = newPassword; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công! Hãy đăng nhập lại." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  deleteUser, 
  updateUser, 
  forgotPassword, 
  resetPassword,
  importUsersBulk 
};