const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String }, 
    email: { type: String, required: true, unique: true },
    phone: { type: String },    
    major: { type: String }, 
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Tự động mã hóa mật khẩu TRƯỚC khi lưu vào Database
userSchema.pre('save', async function () {
  // Nếu mật khẩu không bị thay đổi (ví dụ chỉ cập nhật tên) thì bỏ qua không mã hóa lại
  if (!this.isModified('password')) return;
  
  // Tiến hành mã hóa mật khẩu thô từ controller gửi sang 1 lần duy nhất
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); 
});

module.exports = mongoose.model('User', userSchema);