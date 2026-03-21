"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Các State quản lý trạng thái hiển thị: 'login' | 'forgot_email' | 'reset_password'
  const [viewMode, setViewMode] = useState<'login' | 'forgot_email' | 'reset_password'>('login');

  // State cho Login
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // State cho Quên mật khẩu
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ================= HÀM XỬ LÝ ĐĂNG NHẬP =================
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: identifier, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push(`/dashboard/${data.user.role}`);
      } else {
        setLoginError(data.message || "Tài khoản hoặc mật khẩu không chính xác!");
      }
    } catch (error) {
      setLoginError("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= HÀM GỬI OTP VÀO EMAIL =================
  const handleSendOtp = async (e: any) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setForgotMessage("Mã OTP đã được gửi đến email của bạn!");
        // Chuyển sang màn hình nhập OTP
        setTimeout(() => setViewMode('reset_password'), 1500); 
      } else {
        setForgotError(data.message || "Không thể gửi email!");
      }
    } catch (error) {
      setForgotError("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= HÀM ĐẶT LẠI MẬT KHẨU MỚI =================
  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setForgotMessage("Đổi mật khẩu thành công! Đang chuyển về đăng nhập...");
        setTimeout(() => {
          setViewMode('login');
          setIdentifier(resetEmail); // Điền sẵn email cho người dùng đăng nhập luôn
          setPassword("");
          setForgotMessage("");
        }, 2000);
      } else {
        setForgotError(data.message || "Mã OTP sai hoặc đã hết hạn!");
      }
    } catch (error) {
      setForgotError("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#6f66e0] flex items-center justify-center p-4 font-sans text-gray-800">
      
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row max-w-4xl w-full min-h-[500px] overflow-hidden">
        
        {/* ================= PANEL TRÁI (LOGO & CHÀO MỪNG) ================= */}
        <div className="hidden md:flex w-1/2 bg-gray-50 flex-col items-center justify-center p-12 border-r border-gray-100 relative">
          <div className="w-20 h-20 bg-[#6f66e0] rounded-full flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-200">
            🚀
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4 text-center">Chào mừng trở lại!</h2>
          <p className="text-gray-500 text-center text-sm font-medium leading-relaxed">
            Hệ thống quản lý học tập thông minh LMS Pro. Đăng nhập để tiếp tục lộ trình học tập và theo dõi tiến độ của bạn.
          </p>
        </div>

        {/* ================= PANEL PHẢI (FORM) ================= */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* MÀN HÌNH 1: ĐĂNG NHẬP */}
          {viewMode === 'login' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-[#5b51d8] mb-2">Đăng Nhập</h2>
                <p className="text-sm text-gray-500 font-medium">Vui lòng nhập thông tin tài khoản</p>
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-lg mb-4 text-center border border-red-100">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5 uppercase">Email hoặc Tên đăng nhập</label>
                  <input 
                    type="text" 
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5b51d8] focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium bg-white"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-extrabold text-gray-700 uppercase">Mật khẩu</label>
                    <button 
                      type="button" 
                      onClick={() => { setViewMode('forgot_email'); setForgotError(""); setForgotMessage(""); }} 
                      className="text-xs font-bold text-[#5b51d8] hover:text-indigo-800 transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#5b51d8] focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium tracking-widest"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#6f66e0] hover:bg-[#5b51d8] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-2"
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
                <div className="text-sm font-medium text-gray-500">
                  Chưa có tài khoản? <a href="#" className="font-extrabold text-[#5b51d8] hover:underline">Đăng ký tài khoản mới</a>
                </div>
                <div>
                  <a href="#" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">← Quay lại trang chủ</a>
                </div>
              </div>
            </div>
          )}

          {/* MÀN HÌNH 2: NHẬP EMAIL ĐỂ LẤY MÃ OTP */}
          {viewMode === 'forgot_email' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-xl mx-auto mb-4">🔐</div>
                <h2 className="text-2xl font-extrabold text-[#5b51d8] mb-2">Quên Mật Khẩu</h2>
                <p className="text-sm text-gray-500 font-medium px-4">Nhập email đăng ký của bạn, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
              </div>

              {forgotError && <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-lg mb-4 text-center border border-red-100">{forgotError}</div>}
              {forgotMessage && <div className="bg-green-50 text-green-600 text-sm font-bold p-3 rounded-lg mb-4 text-center border border-green-100">{forgotMessage}</div>}

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5 uppercase">Địa chỉ Email đã đăng ký</label>
                  <input 
                    type="email" 
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5b51d8] focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-medium"
                  />
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-[#6f66e0] hover:bg-[#5b51d8] text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-70">
                  {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <button onClick={() => { setViewMode('login'); setForgotError(""); setForgotMessage(""); }} className="text-sm font-bold text-[#5b51d8] hover:text-indigo-800 transition-colors">
                  ← Trở về Đăng nhập
                </button>
              </div>
            </div>
          )}

          {/* MÀN HÌNH 3: NHẬP OTP & TẠO MẬT KHẨU MỚI (CHÍNH LÀ GIAO DIỆN HÌNH ẢNH) */}
          {viewMode === 'reset_password' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#6f66e0] rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-indigo-200">
                  🚀
                </div>
                <h2 className="text-2xl font-extrabold text-[#5b51d8] mb-2">Tạo Mật Khẩu Mới</h2>
                <p className="text-sm text-gray-500 font-medium px-4">Mã xác nhận (OTP) đã được gửi tới địa chỉ <b className="text-gray-800">{resetEmail || 'email của bạn'}</b></p>
              </div>

              {forgotError && <div className="bg-red-50 text-red-500 text-sm font-bold p-3 rounded-lg mb-4 text-center border border-red-100">{forgotError}</div>}
              {forgotMessage && <div className="bg-green-50 text-green-600 text-sm font-bold p-3 rounded-lg mb-4 text-center border border-green-100">{forgotMessage}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5 uppercase">Mã OTP (6 số)</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5b51d8] outline-none text-center text-lg font-bold tracking-[0.5em] bg-white transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5 uppercase">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5b51d8] focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium bg-white"
                  />
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-[#6f66e0] hover:bg-[#5b51d8] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-2">
                  {isLoading ? 'Đang lưu...' : 'Lưu mật khẩu & Đăng nhập'}
                </button>
              </form>

              {/* === PHẦN MỚI THÊM VÀO THEO YÊU CẦU: FOOTER FORM RESET === */}
              <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
                <div className="text-sm font-medium text-gray-500">
                  Chưa nhận được mã? <button onClick={handleSendOtp} className="font-extrabold text-[#5b51d8] hover:underline disabled:opacity-60" disabled={isLoading}>Gửi lại mã OTP</button>
                </div>
                {/* --- CHỨC NĂNG QUAY LẠI ĐĂNG NHẬP --- */}
                <div>
                  <button 
                    onClick={() => { setViewMode('login'); setForgotError(""); setForgotMessage(""); setOtp(""); setNewPassword(""); }} 
                    className="text-sm font-bold text-[#5b51d8] hover:text-indigo-800 transition-colors flex items-center justify-center w-full gap-1"
                  >
                    ← Quay lại Đăng nhập
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}