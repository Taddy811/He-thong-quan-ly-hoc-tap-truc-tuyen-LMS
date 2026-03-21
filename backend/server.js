const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Tải các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

// 1. Bật chìa khóa CORS (Cho phép Frontend sau này gọi vào thoải mái)
app.use(cors());

// 2. Cho phép nhận dữ liệu dạng JSON
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/majors', require('./routes/majorRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
// 3. Kết nối với nhà kho MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Kết nối MongoDB thành công!'))
  .catch((err) => console.log('❌ Lỗi kết nối MongoDB:', err));

// 4. Tuyến đường Test cơ bản
app.get('/', (req, res) => {
  res.send('Chào mừng đến với API của LMS Pro!');
});

// 5. Mở cửa nhà bếp ở cổng 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy tại http://localhost:${PORT}`);
});