const Attendance = require('../models/Attendance');
const User = require('../models/User');
const SalaryHistory = require('../models/SalaryHistory');
const mongoose = require('mongoose');

// =================================================================
// 1. HÀM LẤY TOÀN BỘ DANH SÁCH ĐIỂM DANH (Sắp xếp mới nhất lên đầu)
// =================================================================
const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// =================================================================
// 2. HÀM LƯU ĐIỂM DANH SIÊU TỐC VÀ TỰ ĐỘNG CỘNG LƯƠNG GIẢNG VIÊN
// =================================================================
const saveAttendance = async (req, res) => {
  try {
    // Nhận toàn bộ dữ liệu điểm danh và instructorId từ Frontend gửi lên
    const { classId, className, subjectName, date, instructor, instructorId, records } = req.body;
    
    if (!classId || !date || !records || records.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu điểm danh gửi lên không hợp lệ!' });
    }

    // BƯỚC A: Tạo danh sách lệnh cập nhật/thêm mới hàng loạt cho MongoDB (bulkWrite)
    const operations = records.map(record => ({
      updateOne: {
        filter: { classId, date, studentName: record.studentName }, // Khóa chính: Lớp, Ngày, Sinh viên
        update: { 
          $set: { 
            classId, 
            className, 
            subjectName, 
            date, 
            instructor, 
            studentName: record.studentName, 
            status: record.status, 
            note: record.note || '-' 
          } 
        },
        upsert: true // Nếu có rồi thì ghi đè trạng thái, chưa có thì tự động tạo mới
      }
    }));

    // Thực thi lưu tất cả sinh viên trong đúng 1 request duy nhất
    await Attendance.bulkWrite(operations); 

    // BƯỚC B: LOGIC TỰ ĐỘNG CỘNG LƯƠNG THÔNG MINH (CÓ CHẾ ĐỘ CỨU HỘ)
    let finalInstructorId = instructorId;

    // CỨU HỘ: Nếu ID trống, hoặc dính chuỗi "undefined", hoặc không đúng cấu trúc ObjectId
    if (!finalInstructorId || finalInstructorId === 'undefined' || !mongoose.Types.ObjectId.isValid(finalInstructorId)) {
      console.log(`[Cứu hộ] ID giảng viên không hợp lệ ("${instructorId}"). Tiến hành tìm theo tên: ${instructor}`);
      
      // Tìm tài khoản trong bảng User dựa trên tên giảng viên gửi lên
      const foundUser = await User.findOne({ name: instructor, role: 'instructor' });
      if (foundUser) {
        finalInstructorId = foundUser._id;
        console.log(`[Cứu hộ thành công] Đã tìm thấy _id chuẩn: ${finalInstructorId}`);
      } else {
        // Dự phòng trường hợp tên trên màn hình có chữ học vị "ThS. " nhưng DB không có
        const cleanName = instructor.replace(/(ThS\.|TS\.|Thạc sĩ|Tiến sĩ)\s*/i, '').trim();
        const foundUserByRegex = await User.findOne({ 
          name: { $regex: new RegExp(cleanName, 'i') }, 
          role: 'instructor' 
        });
        if (foundUserByRegex) {
          finalInstructorId = foundUserByRegex._id;
          console.log(`[Cứu hộ Regex thành công] Tìm thấy _id từ tên rút gọn: ${finalInstructorId}`);
        }
      }
    }

    // Tiến hành cộng lương nếu thu thập được ID hợp lệ sau khi cứu hộ
    if (finalInstructorId && finalInstructorId !== 'undefined' && mongoose.Types.ObjectId.isValid(finalInstructorId)) {
      
      // 1. CHECK TRÙNG: Kiểm tra xem ca dạy (Lớp này, Ngày học này) đã được cộng tiền trước đó chưa
      const isSalaryExist = await SalaryHistory.findOne({
        instructorId: finalInstructorId,
        classId: classId,
        date: date
      });

      // 2. Nếu ca học này chưa từng được tính lương -> Tiến hành chèn bản ghi lương mới
      if (!isSalaryExist) {
        const standardDuration = 120;  // Thời gian ca dạy mặc định: 120 phút (2 tiếng)
        const standardSalary = 400000;  // Số tiền nhận được mặc định: 400.000 ₫ / ca

        const now = new Date();
        const endTime = new Date(now.getTime() + standardDuration * 60000); // Giờ kết thúc = giờ bấm lưu + 120 phút

        const newSalaryRecord = new SalaryHistory({
          instructorId: finalInstructorId, // Định danh chính xác theo ID tài khoản chuẩn
          classId: classId,
          date: date,                       // Khóa ngày học để chặn việc bấm "Lưu" nhiều lần bị cộng đúp tiền
          startTime: now,
          endTime: endTime,
          duration: standardDuration,
          salaryEarned: standardSalary
        });

        // Lưu vào bảng lịch sử lương
        await newSalaryRecord.save();
        console.log(`[Lương] Đã cộng 400.000đ thành công cho giảng viên ID: ${finalInstructorId}`);
      } else {
        console.log(`[Lương] Ca dạy ngày ${date} của lớp này đã được tính lương trước đó. Bỏ qua để tránh trùng.`);
      }
    } else {
      console.error(`[Lỗi nghiêm trọng] Không thể tìm thấy ID tài khoản hợp lệ của giảng viên "${instructor}" để cộng lương.`);
    }

    // Trả về phản hồi thành công tốt đẹp cho Frontend hiển thị thông báo
    res.status(200).json({ message: 'Lưu điểm danh và cập nhật lịch sử lương thành công!' });
  } catch (error) { 
    console.error("Lỗi tại saveAttendance:", error);
    res.status(500).json({ error: error.message }); 
  }
};

module.exports = { getAttendance, saveAttendance };