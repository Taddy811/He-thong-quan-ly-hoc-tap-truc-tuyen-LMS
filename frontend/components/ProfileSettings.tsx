"use client";
import { useState, useEffect } from "react";

export default function ProfileSettings() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setName(parsed.name || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận không khớp!' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id || user.id,
          role: user.role,
          name,
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setOldPassword(""); 
        setNewPassword(""); 
        setConfirmPassword("");
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi kết nối đến máy chủ!' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500 font-semibold flex items-center justify-center h-full">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THẺ PROFILE */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center sticky top-6">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-5xl text-white font-bold shadow-lg shadow-emerald-500/30 mb-5 border-4 border-white">
              {name.charAt(0).toUpperCase() || "U"}
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-1">{user.name || "Chưa cập nhật tên"}</h3>
            <p className="text-sm text-gray-500 mb-4">{user.username || user.email}</p>
            
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-extrabold uppercase tracking-widest border border-emerald-100">
              {user.role === 'admin' ? 'Quản trị viên' : user.role === 'instructor' ? 'Giảng viên' : 'Học sinh'}
            </span>
          </div>
        </div>

        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit}>
              
              {/* Header Form */}
              <div className="px-8 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-600 to-teal-500">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"> Thông tin chi tiết </h3>
            </div>
              <div className="p-8 space-y-8">
                {/* Thông báo */}
                {message.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    <span>{message.type === 'success' ? '✅' : '❌'}</span>
                    {message.text}
                  </div>
                )}

                {/* Section 1: Thông tin chung */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tên hiển thị công khai</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-gray-800" 
                  />
                </div>

                <hr className="border-gray-100" />

                {/* Section 2: Mật khẩu */}
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Thay đổi mật khẩu</h4>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">MẬT KHẨU HIỆN TẠI</label>
                    <input 
                      type="password" 
                      value={oldPassword} 
                      onChange={e => setOldPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-800" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">MẬT KHẨU MỚI</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">XÁC NHẬN MẬT KHẨU</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-gray-800" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Form */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                  {loading ? "⏳ Đang cập nhật..." : "Lưu thay đổi"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}