# E-Learning LMS - Hệ Thống Quản Lý Học Tập

Dự án LMS fullstack gồm frontend Next.js và backend Node.js/Express, hỗ trợ quản lý người dùng, chuyên ngành, môn học, lớp học, lịch học và điểm danh bằng QR/manual cho 3 vai trò: Admin, Giảng viên và Sinh viên.

## Mục Lục

- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Biến môi trường backend](#biến-môi-trường-backend)
- [Tài khoản và phân quyền](#tài-khoản-và-phân-quyền)
- [API chính](#api-chính)
- [Ghi chú phát triển](#ghi-chú-phát-triển)

## Tính Năng Chính

### Admin

- Quản lý người dùng: thêm, sửa, xóa, lọc theo vai trò và import danh sách bằng file Excel.
- Quản lý chuyên ngành: thêm, sửa, xóa, mô tả và trạng thái.
- Quản lý môn học: thêm, sửa, xóa, mô tả và trạng thái.
- Quản lý lớp học: tạo lớp, gán giảng viên, phòng học, ca học, lịch học, tổng số buổi và danh sách sinh viên.
- Cập nhật thông tin cá nhân và đổi mật khẩu.
- Chuyển giao diện sáng/tối trong dashboard.

### Giảng Viên

- Xem lịch giảng dạy được sinh từ cấu hình lớp học và buổi học thủ công.
- Quản lý lớp phụ trách và danh sách sinh viên.
- Điểm danh thủ công theo lớp/buổi học.
- Tạo mã QR điểm danh, kết thúc phiên QR và theo dõi sinh viên đã quét.
- Thu phóng mã QR để dễ trình chiếu trên màn hình.
- Xem lịch sử điểm danh và lọc theo lớp, trạng thái, ngày.
- Quản lý buổi học thủ công.
- Xem lịch sử lương/thu nhập theo buổi dạy.
- Cập nhật thông tin cá nhân và đổi mật khẩu.
- Chuyển giao diện sáng/tối trong dashboard.

### Sinh Viên

- Dashboard tổng quan gọn: lớp đang học, lịch hôm nay, lịch sắp tới, tỷ lệ điểm danh và tiến độ lớp.
- Quét QR điểm danh bằng camera trình duyệt.
- Xem lớp học của tôi, tiến độ số buổi và lịch sử theo từng lớp.
- Xem lịch học dạng calendar hoặc danh sách.
- Xem lịch sử điểm danh và lọc theo lớp, trạng thái, ngày.
- Cập nhật thông tin cá nhân và đổi mật khẩu.
- Chuyển giao diện sáng/tối trong dashboard.

### Xác Thực Và Hệ Thống

- Đăng ký, đăng nhập và điều hướng theo vai trò.
- Mã hóa mật khẩu bằng `bcryptjs`.
- Quên mật khẩu bằng OTP gửi qua email.
- Frontend gọi API qua rewrites `/api/*` đến backend `http://localhost:5000/api/*`.

## Công Nghệ Sử Dụng

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `@yudiel/react-qr-scanner` để quét QR
- `qrcode.react` để hiển thị QR
- `xlsx` để xử lý import Excel

### Backend

- Node.js
- Express 5
- MongoDB và Mongoose
- `bcryptjs`
- `jsonwebtoken`
- `nodemailer`
- `dotenv`
- `cors`

## Cấu Trúc Thư Mục

```text
LMS-Project/
├── backend/
│   ├── controllers/          # Xử lý nghiệp vụ API
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Định tuyến API
│   ├── server.js             # Entry point Express server
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── admin/        # Dashboard Admin
│   │   │   ├── instructor/   # Dashboard Giảng viên
│   │   │   └── student/      # Dashboard Sinh viên
│   │   ├── login/            # Đăng nhập / quên mật khẩu
│   │   ├── register/         # Đăng ký
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ProfileSettings.tsx
│   │   └── ThemeToggle.tsx
│   ├── next.config.ts        # Rewrite /api sang backend
│   └── package.json
│
├── package.json              # Script chạy cả frontend và backend
└── README.md
```

## Yêu Cầu Môi Trường

- Node.js 20+ khuyến nghị
- npm
- MongoDB local hoặc MongoDB Atlas
- Tài khoản email SMTP/App Password nếu dùng chức năng quên mật khẩu

## Cài Đặt Và Chạy Dự Án

### 1. Cài dependencies
 
 Mở terminal chọn dòng Command Prompt (hoặc biểu tượng chữ cmd).
 (Nếu không muốn chọn dòng Command Prompt thì chạy lệnh mở khóa trực tiếp PowerShell)
```bash
 Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Tạo file `.env` cho backend

Tạo file `backend/.env` theo mẫu ở phần [Biến môi trường backend](#biến-môi-trường-backend).

### 3. Chạy frontend và backend cùng lúc

Tại thư mục gốc:

```bash
npm run dev
```

Mặc định:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### 4. Chạy riêng từng phần

```bash
npm run backend
npm run frontend
```

Hoặc:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

### 5. Build frontend

```bash
cd frontend
npm run build
```

## Biến Môi Trường Backend

File: `backend/.env`

```env
MONGO_URI=mongodb://127.0.0.1:27017/lms-project
PORT=5000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
QR_SECRET=change_this_qr_secret
```

Ghi chú:

- `MONGO_URI` bắt buộc để backend kết nối MongoDB.
- `EMAIL_USER` và `EMAIL_PASS` cần cho chức năng quên mật khẩu/OTP.
- `QR_SECRET` dùng để ký và xác thực token QR điểm danh. Nếu không khai báo, backend sẽ dùng giá trị mặc định trong code.
- File `.env` không được commit lên git.

## Tài Khoản Và Phân Quyền

Hệ thống có 3 vai trò:

- `admin`: quản lý người dùng, chuyên ngành, môn học và lớp học.
- `instructor`: quản lý lớp phụ trách, lịch dạy, điểm danh, QR và lương.
- `student`: xem lịch học, lớp học, lịch sử điểm danh và quét QR.

Sau khi đăng nhập, frontend tự điều hướng theo `role`:

- `/dashboard/admin`
- `/dashboard/instructor`
- `/dashboard/student`

## API Chính

Backend mount các nhóm API sau:

```text
/api/auth         Đăng ký, đăng nhập, quên mật khẩu, quản lý/import users
/api/user         Cập nhật hồ sơ, lịch sử lương giảng viên
/api/majors       CRUD chuyên ngành
/api/subjects     CRUD môn học
/api/classes      CRUD lớp học
/api/sessions     CRUD buổi học thủ công
/api/attendance   Lưu và đọc lịch sử điểm danh
/api/instructor   Phiên QR, lịch sử giảng dạy, lịch sử lương
/api/student      Quét QR điểm danh
```

Một số endpoint đang dùng:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/users
POST   /api/auth/import

GET    /api/classes
POST   /api/classes
PUT    /api/classes/:id
DELETE /api/classes/:id

POST   /api/instructor/start
GET    /api/instructor/qr/:sessionId
PUT    /api/instructor/end/:sessionId
GET    /api/instructor/history/:instructorId
GET    /api/instructor/salary-history/:instructorId

POST   /api/student/scan-qr
GET    /api/attendance
POST   /api/attendance
```

## Ghi Chú Phát Triển

- Frontend đang gọi API bằng path tương đối `/api/...`; Next.js rewrite sang backend trong `frontend/next.config.ts`.
- Khi đổi port backend, cần cập nhật lại `destination` trong `frontend/next.config.ts`.
- QR điểm danh cần camera browser và thường nên chạy trên `localhost` hoặc HTTPS để được phép truy cập camera.
- Nếu Next.js báo warning về nhiều lockfile, có thể giữ nguyên nếu project vẫn build/chạy được; warning này do có `package-lock.json` ở thư mục gốc và trong `frontend`.
- Nên chạy `npm run build` trong `frontend` trước khi nộp bài hoặc deploy.

## Thành Viên

| STT | Họ và tên | MSSV | Vai trò | Tỉ lệ hoàn thành |
| --- | --- | --- | --- | --- |
| 1 | Trần Tiến Đạt | 2380611133 | Nhóm trưởng / Fullstack | 100% |
