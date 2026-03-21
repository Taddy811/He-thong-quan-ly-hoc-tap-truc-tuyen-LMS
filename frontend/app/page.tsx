import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* 1. THANH ĐIỀU HƯỚNG (NAVBAR) */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          LMS Pro
        </div>
        <div className="space-x-4 flex items-center">
          {/* Nút Đăng nhập được nối tới trang /login */}
          <Link href="/login">
            <button className="text-gray-600 hover:text-blue-600 font-semibold px-4 text-sm">
              Đăng nhập
            </button>
          </Link>
          
          {/* Nút Đăng ký được nối tới trang /register */}
          <Link href="/register">
            <button className="bg-[#5b51d8] hover:bg-[#4a40b8] text-white px-5 py-2 rounded-md font-semibold transition-all text-sm shadow-md">
              Đăng ký ngay
            </button>
          </Link>
        </div>
      </nav>

      {/* 2. PHẦN BANNER CHÍNH (HERO SECTION) */}
      <section className="bg-gradient-to-r from-[#5b51d8] to-[#8360c3] text-white py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Hệ thống điểm danh thông minh</h1>
        <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto px-4">
          Giải pháp quản lý điểm danh hiện đại, giúp giảng viên và sinh viên theo dõi tình hình học tập một cách dễ dàng và chính xác
        </p>
        <div className="flex justify-center gap-4 px-4">
          <Link href="/register">
            <button className="bg-[#4ade80] hover:bg-[#3bca6b] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg text-sm md:text-base">
              Bắt đầu ngay &gt;
            </button>
          </Link>
          <button className="border border-white hover:bg-white hover:text-[#5b51d8] text-white font-semibold py-3 px-8 rounded-full transition-all text-sm md:text-base">
            Tìm hiểu thêm
          </button>
        </div>
      </section>

      {/* 3. PHẦN THỐNG KÊ (STATS) */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-4">
          <div>
            <div className="text-blue-500 text-4xl mb-2">👨‍🎓</div>
            <div className="text-2xl font-bold text-[#5b51d8]">10,000+</div>
            <div className="text-gray-500 text-sm mt-1">Sinh viên</div>
          </div>
          <div>
            <div className="text-blue-500 text-4xl mb-2">📚</div>
            <div className="text-2xl font-bold text-[#5b51d8]">500+</div>
            <div className="text-gray-500 text-sm mt-1">Lớp học</div>
          </div>
          <div>
            <div className="text-blue-500 text-4xl mb-2">👨‍🏫</div>
            <div className="text-2xl font-bold text-[#5b51d8]">100+</div>
            <div className="text-gray-500 text-sm mt-1">Giảng viên</div>
          </div>
          <div>
            <div className="text-blue-500 text-4xl mb-2">✅</div>
            <div className="text-2xl font-bold text-[#5b51d8]">99.9%</div>
            <div className="text-gray-500 text-sm mt-1">Tỷ lệ chính xác</div>
          </div>
        </div>
      </section>

      {/* 4. TÍNH NĂNG NỔI BẬT (FEATURES) */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tính năng nổi bật</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Khám phá những tính năng mạnh mẽ giúp việc quản lý điểm danh trở nên đơn giản hơn bao giờ hết</p>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">✓</div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Điểm danh thông minh</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Hệ thống điểm danh tự động, chính xác và nhanh chóng cho từng buổi học</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📊</div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Báo cáo chi tiết</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Thống kê tỷ lệ tham gia, theo dõi tiến độ học tập của sinh viên</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">👥</div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Quản lý lớp học</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Tổ chức và quản lý thông tin lớp học, sinh viên một cách dễ dàng</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⏱️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Lịch sử điểm danh</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Lưu trữ và tra cứu lịch sử điểm danh theo thời gian thực</p>
          </div>
        </div>
      </section>

    </div>
  );
}