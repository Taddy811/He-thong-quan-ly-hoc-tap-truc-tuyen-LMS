"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "" // Thêm trường role (Mặc định rỗng)
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if(formData.password !== formData.confirmPassword) {
        setMessage("❌ Mật khẩu xác nhận không khớp!");
        return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Truyền vai trò (role) xuống Backend
        body: JSON.stringify({ 
            name: formData.name, 
            username: formData.username,
            email: formData.email, 
            phone: formData.phone,
            password: formData.password, 
            role: formData.role 
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage("🎉 " + data.message);
      } else {
        setMessage("❌ " + (data.error ? `Lỗi chi tiết: ${data.error}` : data.message));
      }
    } catch (error) {
      setMessage("❌ Lỗi mạng: Không thể kết nối với Backend!");
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5b51d8] to-[#8360c3] flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 lg:gap-24">
        
        {/* CỘT TRÁI */}
        <div className="hidden md:flex flex-col text-white w-1/2">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">LMS Pro</h1>
          <p className="text-lg text-indigo-200 mb-10">Nền tảng học tập trực tuyến hàng đầu Việt Nam</p>
          <h2 className="text-2xl font-bold mb-4">Bắt đầu hành trình học tập</h2>
          <p className="mb-8 text-indigo-100 leading-relaxed">
            Tham gia cùng hàng nghìn học viên để thành công trong việc học tập và phát triển sự nghiệp IT.
          </p>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG KÝ */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#5b51d8]">Đăng Ký Tài Khoản</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">* Họ và tên</label>
                <input type="text" name="name" required placeholder="👤 Nhập họ và tên" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5b51d8] outline-none text-sm bg-gray-50/50" onChange={handleChange} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">* Tên đăng nhập</label>
                <input type="text" name="username" required placeholder="👤 Nhập tên đăng nhập" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5b51d8] outline-none text-sm bg-gray-50/50" onChange={handleChange} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">* Email</label>
                <input type="email" name="email" required placeholder="✉️ Nhập địa chỉ email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5b51d8] outline-none text-sm bg-gray-50/50" onChange={handleChange} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">* Mật khẩu</label>
                <input type="password" name="password" required placeholder="🔒 Nhập mật khẩu" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5b51d8] outline-none text-sm bg-gray-50/50" onChange={handleChange} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">* Xác nhận mật khẩu</label>
                <input type="password" name="confirmPassword" required placeholder="🔒 Nhập lại mật khẩu" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5b51d8] outline-none text-sm bg-gray-50/50" onChange={handleChange} />
              </div>

              {/* === MỤC CHỌN VAI TRÒ (MỚI THÊM) === */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bạn là ai?</label>
                <select name="role" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5b51d8] outline-none text-sm bg-gray-50/50 font-semibold text-gray-700 cursor-pointer">
                  <option value="">-- Không chọn (Mặc định: Admin) --</option>
                  <option value="student">🎓 Tôi là Học sinh</option>
                  <option value="instructor">👨‍🏫 Tôi là Giáo viên</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-[#5b51d8] to-[#8360c3] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity mt-6 text-sm">
                Đăng Ký
              </button>
            </form>

            {message && (
              <div className={`mt-4 text-center font-bold text-sm ${message.includes('🎉') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">
              Đã có tài khoản? <Link href="/login" className="text-[#5b51d8] font-bold hover:underline">Đăng nhập ngay</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}