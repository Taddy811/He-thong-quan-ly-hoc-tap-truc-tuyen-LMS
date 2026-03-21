"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'login' | 'forgot_email' | 'reset_password'>('login');

  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          setIdentifier(resetEmail); 
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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-gray-800 relative overflow-hidden selection:bg-emerald-600 selection:text-white">
      
      {/* HIỆU ỨNG ÁNH SÁNG NỀN */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200 rounded-full blur-[150px] opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-teal-200 rounded-full blur-[150px] opacity-50 pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white flex flex-col md:flex-row max-w-4xl w-full min-h-[550px] overflow-hidden z-10">
        
        {/* PANEL TRÁI (Giao diện Xanh Lục Bảo) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-emerald-600 to-teal-600 flex-col items-center justify-center p-12 relative overflow-hidden">
          {/* Họa tiết trang trí Panel Trái */}
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-emerald-900/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-xl text-white">
            🎓
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 text-center tracking-wide">Chào mừng trở lại!</h2>
          <p className="text-emerald-50 text-center text-sm font-medium leading-relaxed">
            Hệ thống quản lý học tập thông minh E-LEARNING LMS. Đăng nhập để tiếp tục lộ trình học tập và theo dõi tiến độ của bạn.
          </p>
        </div>

        {/* PANEL PHẢI (FORM) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* LOGIN */}
          {viewMode === 'login' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Đăng Nhập</h2>
                <p className="text-sm text-gray-500 font-medium">Vui lòng nhập thông tin tài khoản</p>
              </div>

              {loginError && <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 text-center border border-red-100">{loginError}</div>}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase tracking-wide">Email hoặc Tên đăng nhập</label>
                  <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Nhập tài khoản của bạn" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wide">Mật khẩu</label>
                    <button type="button" onClick={() => { setViewMode('forgot_email'); setForgotError(""); setForgotMessage(""); }} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Quên mật khẩu?</button>
                  </div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-sm font-medium tracking-widest" />
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-70 mt-4">
                  {isLoading ? 'Đang xử lý...' : 'Đăng Nhập Ngay'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-4">
                <div className="text-sm font-medium text-gray-500">
                  Chưa có tài khoản? <Link href="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline">Đăng ký tài khoản mới</Link>
                </div>
                <div>
                  <Link href="/" className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">← Quay lại trang chủ</Link>
                </div>
              </div>
            </div>
          )}

          {/* FORGOT EMAIL */}
          {viewMode === 'forgot_email' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 border border-emerald-100">🔐</div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Quên Mật Khẩu</h2>
                <p className="text-sm text-gray-500 font-medium px-2">Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
              </div>

              {forgotError && <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-6 text-center border border-red-100">{forgotError}</div>}
              {forgotMessage && <div className="bg-emerald-50 text-emerald-700 text-sm font-bold p-3 rounded-xl mb-6 text-center border border-emerald-100">{forgotMessage}</div>}

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase tracking-wide">Địa chỉ Email đã đăng ký</label>
                  <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all text-sm font-medium bg-gray-50 focus:bg-white" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-70">
                  {isLoading ? 'Đang kiểm tra dữ liệu...' : 'Gửi mã xác nhận'}
                </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <button onClick={() => { setViewMode('login'); setForgotError(""); setForgotMessage(""); }} className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">
                  ← Trở về Đăng nhập
                </button>
              </div>
            </div>
          )}

          {/* RESET PASSWORD */}
          {viewMode === 'reset_password' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 border border-emerald-100">✨</div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tạo Mật Khẩu Mới</h2>
                <p className="text-sm text-gray-500 font-medium px-2">Mã xác nhận (OTP) đã được gửi tới địa chỉ <br/><b className="text-emerald-700">{resetEmail || 'email của bạn'}</b></p>
              </div>

              {forgotError && <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-5 text-center border border-red-100">{forgotError}</div>}
              {forgotMessage && <div className="bg-emerald-50 text-emerald-700 text-sm font-bold p-3 rounded-xl mb-5 text-center border border-emerald-100">{forgotMessage}</div>}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase tracking-wide">Mã OTP (6 số)</label>
                  <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none text-center text-xl font-black tracking-[0.5em] text-emerald-700 bg-gray-50 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-2 uppercase tracking-wide">Mật khẩu mới</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới..." className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none text-sm font-medium bg-gray-50 focus:bg-white transition-all" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-70 mt-2">
                  {isLoading ? 'Đang lưu...' : 'Lưu mật khẩu & Đăng nhập'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-4">
                <div className="text-sm font-medium text-gray-500">
                  Chưa nhận được mã? <button onClick={handleSendOtp} className="font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-60" disabled={isLoading}>Gửi lại mã OTP</button>
                </div>
                <div>
                  <button onClick={() => { setViewMode('login'); setForgotError(""); setForgotMessage(""); setOtp(""); setNewPassword(""); }} className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center w-full gap-1">
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