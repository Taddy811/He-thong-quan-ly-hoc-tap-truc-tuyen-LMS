# 🎓 E-LEARNING LMS - Hệ Thống Quản Lý Học Tập Trực Tuyến

Một hệ thống Quản lý Học tập (Learning Management System) toàn diện được xây dựng theo kiến trúc Fullstack, cung cấp không gian số hiện đại để kết nối và tương tác giữa Quản trị viên, Giảng viên và Sinh viên.
Thành viên nhóm & Phân công
*(Cập nhật thông tin các thành viên trong nhóm vào đây để thầy theo dõi)*
| STT | Họ và Tên | MSSV | Vai trò | Tỉ lệ hoàn thành |
| 1 | Trần Tiến Đạt | 2380611133 | Nhóm trưởng / Fullstack | 100% |

Danh sách các Task cần thực hiện 

### Giai đoạn 1: Khởi tạo & Cấu hình (Tuần 1-2)
- Lên ý tưởng và viết đặc tả yêu cầu hệ thống.
- Thiết kế cấu trúc Database (MongoDB Schema cho User, Class, Major, Subject, Session, Attendance).
- Dựng base code Backend (Node.js/Express) và Frontend (Next.js).

### Giai đoạn 2: Tính năng Authentication & Phân quyền (Tuần 3-4)
- API Đăng ký, Đăng nhập (Mã hóa password bằng Bcrypt).
- Tính năng Quên mật khẩu (Gửi mã OTP qua Email với Nodemailer).
- Xây dựng UI/UX Login/Register.
- Routing phân quyền: Điều hướng Admin, Instructor, Student vào đúng Dashboard.

### Giai đoạn 3: Phát triển Module Admin (Tuần 5-6)
- Chức năng CRUD Quản lý Người dùng (Thêm/Sửa/Xóa/Lọc theo role).
- Chức năng CRUD Quản lý Chuyên ngành & Môn học.
- Quản lý Lớp học (Gán giảng viên, xếp lịch học theo thứ, add sinh viên).
- Xây dựng bộ lọc tìm kiếm đa tiêu chí cho Admin.

### Giai đoạn 4: Phát triển Module Giảng viên & Sinh viên (Tuần 7-8)
- Thuật toán sinh Lịch học tự động cho Giảng viên dựa trên cấu hình lớp.
- Tính năng Điểm danh siêu tốc hàng loạt (Bulk Write Database).
- Thuật toán đồng bộ Lịch học cá nhân cho Sinh viên (Gộp lịch tự động & thủ công).
- Dashboard thống kê tỷ lệ điểm danh, tiến độ môn học cho Sinh viên bằng Chart/Progress Bar.

### Giai đoạn 5: Hoàn thiện & Triển khai (Tuần 9-10)
- Sửa lỗi (Fix bugs) và tối ưu hóa hiệu năng (Refactor code).
- Deploy Backend lên server (Render/Vercel).
- Deploy Frontend lên server (Vercel).
- Viết báo cáo tổng kết đồ án.

## 🚀 Tính Năng Nổi Bật

Hệ thống được phân quyền chặt chẽ với 3 vai trò riêng biệt:

### 🛡️ Quản trị viên (Admin)
- **Quản lý cốt lõi:** Thêm, sửa, xóa (CRUD) danh sách Người dùng, Chuyên ngành, và Môn học.
- **Quản lý Lớp học nâng cao:** Tạo lớp học, chỉ định Giảng viên, xếp lịch học theo thứ, và thêm Sinh viên vào lớp.
- **Bộ lọc thông minh:** Tìm kiếm và lọc dữ liệu đa tiêu chí (theo ca học, trạng thái, chuyên ngành,...).

### 👨‍🏫 Giảng viên (Instructor)
- **Lịch giảng dạy:** Tự động sinh lịch dạy dựa trên cấu hình lớp học ban đầu.
- **Điểm danh siêu tốc:** Hỗ trợ điểm danh hàng loạt (Bulk Attendance) tối ưu hiệu suất cơ sở dữ liệu.
- **Quản lý lớp học:** Xem danh sách sinh viên và theo dõi tiến độ từng lớp.

### 🎓 Sinh viên (Student)
- **Lịch học cá nhân:** Tự động gộp và hiển thị lịch học của tất cả các môn đang tham gia dưới dạng Calendar trực quan.
- **Theo dõi tiến độ:** Xem lịch sử điểm danh chi tiết, cảnh báo tỷ lệ vắng mặt và tiến độ hoàn thành môn học.

### ⚙️ Tính năng chung
- **Xác thực & Bảo mật:** Đăng nhập, Đăng ký, phân quyền Role-based routing.
- **Khôi phục mật khẩu:** Tích hợp gửi mã OTP tự động qua Email.
- **UI/UX Hiện đại:** Giao diện Responsive, hỗ trợ các hiệu ứng Glassmorphism và chuyển động mượt mà.

## 🛠️ 4. Công Nghệ Sử Dụng (Tech Stack)
* **Frontend:** React.js, Next.js (App Router), Tailwind CSS.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB, Mongoose.
* **Libraries:** `bcryptjs` (Bảo mật), `jsonwebtoken` (Xác thực), `nodemailer` (Gửi Email).

## 📂 Cấu Trúc Thư Mục (Folder Structure)

Dự án được chia thành 2 phần độc lập: `frontend` và `backend`.

```text
LMS-PROJECT/
├── backend/                  # API Server (Node.js/Express)
│   ├── controllers/          # Logic xử lý nghiệp vụ (Auth, Class, Attendance...)
│   ├── models/               # Schema Database (Mongoose)
│   ├── routes/               # Định tuyến API endpoints
│   ├── .env                  # Biến môi trường Backend
│   └── server.js             # Entry point của server
│
└── frontend/                 # Giao diện người dùng (Next.js)
    ├── app/
    │   ├── dashboard/        # Khu vực yêu cầu đăng nhập
    │   │   ├── admin/        # Giao diện Admin
    │   │   ├── instructor/   # Giao diện Giảng viên
    │   │   └── student/      # Giao diện Sinh viên
    │   ├── login/            # Trang đăng nhập / Quên mật khẩu
    │   ├── register/         # Trang đăng ký
    │   ├── layout.tsx        # Layout tổng
    │   └── page.tsx          # Landing Page (Trang chủ)
    ├── public/               # Tài nguyên tĩnh (Hình ảnh, Icon)
    └── tailwind.config.ts    # Cấu hình Tailwind
