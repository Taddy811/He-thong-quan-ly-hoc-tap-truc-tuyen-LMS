"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans overflow-hidden relative selection:bg-emerald-600 selection:text-white">
      
      {/* KHỐI HIỆU ỨNG ÁNH SÁNG NỀN (Màu sáng lục bảo nhẹ nhàng) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[150px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-teal-100 rounded-full blur-[150px] opacity-60 pointer-events-none"></div>

      {/* ================= NAVBAR (THANH ĐIỀU HƯỚNG) ================= */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo (Sử dụng gradient xanh lục bảo - teal) */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-emerald-600/30 text-white">
              🎓
            </div>
            <span className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              E-LEARNING <span className="text-gray-800">LMS</span>
            </span>
          </div>

          {/* Menu Links */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-600">
            <Link href="#" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Khóa học</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Tính năng</Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">Về chúng tôi</Link>
          </div>

          {/* Buttons Login/Register */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register" className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-emerald-200 transition-all transform hover:scale-105">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION (PHẦN CHÍNH) ================= */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
        
        {/* CỘT TRÁI (NỘI DUNG) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">Hệ thống đang hoạt động</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Nền Tảng Học Tập <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Tương Lai</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 max-w-xl leading-relaxed font-medium">
            E-LEARNING LMS cung cấp giải pháp quản lý giáo dục toàn diện, kết nối Giảng viên và Học viên qua không gian số hiện đại, trực quan và cực kỳ mạnh mẽ.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 text-base font-extrabold px-8 py-4 rounded-full shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              Bắt đầu ngay <span>→</span>
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-6 text-gray-500 text-sm font-bold">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><span className="text-emerald-600 text-xs">✓</span></div> Miễn phí trải nghiệm
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"><span className="text-emerald-600 text-xs">✓</span></div> Hỗ trợ 24/7
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (HÌNH ẢNH/CARD MINH HỌA) */}
        <div className="w-full lg:w-1/2 relative">
          
          {/* Card chính (Nền sáng, accent xanh lục bảo) */}
          <div className="relative bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-emerald-100/50 z-20 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
            
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100 text-emerald-600">🎓</div>
                <div>
                  <div className="text-gray-900 font-extrabold text-lg">Trí Tuệ Nhân Tạo (AI)</div>
                  <div className="text-gray-500 text-sm font-medium">Cấp chứng chỉ Quốc tế</div>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                Đang diễn ra
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-gray-50 h-16 rounded-xl flex items-center px-4 border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 shadow-sm border border-gray-200 text-emerald-600">📅</div>
                <div className="flex-1">
                  <div className="w-1/3 h-2.5 bg-gray-300 rounded-full mb-2"></div>
                  <div className="w-1/4 h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-16 h-6 bg-emerald-100 rounded-full"></div>
              </div>
              <div className="w-full bg-gray-50 h-16 rounded-xl flex items-center px-4 border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 shadow-sm border border-gray-200 text-teal-600">📋</div>
                <div className="flex-1">
                  <div className="w-1/2 h-2.5 bg-gray-300 rounded-full mb-2"></div>
                  <div className="w-1/5 h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-8 h-8 bg-teal-100 rounded-full"></div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">
                <span>Tiến độ học tập</span>
                <span className="text-emerald-600 font-extrabold">75%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 w-3/4 rounded-full relative">
                  <div className="absolute top-0 right-0 w-2 h-full bg-white/50 blur-[1px]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Các chi tiết trang trí bay lơ lửng xung quanh */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-emerald-300 to-teal-200 rounded-full blur-2xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-cyan-200 to-lime-200 rounded-full blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Nút lơ lửng 1 */}
          <div className="absolute -left-12 top-20 bg-white border border-gray-100 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-100/40 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="text-2xl text-emerald-500">🔥</div>
            <div>
              <div className="text-gray-900 font-extrabold text-sm">10.000+</div>
              <div className="text-gray-500 text-xs font-medium">Học viên</div>
            </div>
          </div>

        </div>
      </main>

      {/* ================= THỐNG KÊ NHANH (STATS BAR) ================= */}
      <div className="relative z-10 border-y border-gray-200 bg-white py-12 mt-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-2">500<span className="text-emerald-600">+</span></div>
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Khóa học</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-2">50<span className="text-emerald-600">+</span></div>
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Giảng viên</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-2">10k<span className="text-emerald-600">+</span></div>
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Học viên</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-gray-900 mb-2">99<span className="text-emerald-600">%</span></div>
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Hài lòng</div>
          </div>
        </div>
      </div>

    </div>
  );
}