"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard"); 

  // ================= STATE DỮ LIỆU CHUNG =================
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [sessionsData, setSessionsData] = useState<any[]>([]);

  // ================= STATE CALENDAR (TAB 1 & TAB 3) =================
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // ================= STATE LỚP HỌC CỦA TÔI (TAB 2) =================
  const [mcSearch, setMcSearch] = useState("");
  const [mcShift, setMcShift] = useState("");
  const [mcSubject, setMcSubject] = useState("");

  // ================= STATE LỊCH HỌC (TAB 3) =================
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar'); 
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [scheduleEndDate, setScheduleEndDate] = useState("");
  const [scheduleSubject, setScheduleSubject] = useState("");

  // ================= STATE LỊCH SỬ ĐIỂM DANH (TAB 4) =================
  const [historyFilterClassName, setHistoryFilterClassName] = useState<string | null>(null);
  const [historyFilterStatus, setHistoryFilterStatus] = useState("");
  const [historyFilterStartDate, setHistoryFilterStartDate] = useState("");
  const [historyFilterEndDate, setHistoryFilterEndDate] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'student') {
        router.push(`/dashboard/${parsedUser.role}`);
        return;
      }
      setUser(parsedUser);
      fetchMyClasses(parsedUser.name, parsedUser.username);
      fetchAttendanceHistory(parsedUser.name);
      fetchSessions();
    }
  }, []);

  const fetchMyClasses = async (studentName: string, studentUsername: string) => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const allClasses = await res.json();
        const enrolledClasses = allClasses.filter((c: any) => 
          c.students && (c.students.includes(studentName) || c.students.includes(studentUsername))
        );
        setMyClasses(enrolledClasses);
      }
    } catch (error) {
      console.error("Lỗi tải lớp học:", error);
    }
  };

  const fetchAttendanceHistory = async (studentName: string) => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        const myHistory = data.filter((d: any) => d.studentName === studentName);
        const sortedHistory = myHistory.sort((a: any, b: any) => {
            const dateA = new Date(a.date.split('/').reverse().join('-') + ' ' + a.updatedAt.split('T')[1]);
            const dateB = new Date(b.date.split('/').reverse().join('-') + ' ' + b.updatedAt.split('T')[1]);
            return dateB.getTime() - dateA.getTime();
        });
        setHistoryData(sortedHistory);
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setSessionsData(await res.json());
    } catch (error) {
      console.error("Lỗi tải buổi học:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ================= LOGIC GỘP LỊCH HỌC TỰ ĐỘNG & THỦ CÔNG =================
  const dayMap: { [key: string]: number } = { 'Chủ nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6, 'Thứ bảy': 6 };
  
  const today = new Date();
  const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate()); 
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const currentDayName = daysOfWeek[today.getDay()];

  const generateMySchedule = () => {
    let allSessions: any[] = [];
    
    myClasses.forEach(cls => {
      let autoSessions: any[] = [];
      if (cls.startDate && cls.totalSessions && cls.scheduleDays && cls.scheduleDays.length > 0) {
        let currentDate = new Date(cls.startDate);
        const targetDays = cls.scheduleDays.map((d: string) => dayMap[d]);
        const total = Number(cls.totalSessions) || 0;
        let count = 0; let maxIter = 365;

        while (count < total && maxIter > 0) {
          if (targetDays.includes(currentDate.getDay())) {
            const dd = String(currentDate.getDate()).padStart(2, '0');
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            const yyyy = currentDate.getFullYear();
            
            autoSessions.push({
              classId: cls._id, 
              className: cls.name, 
              subject: cls.subject, 
              instructor: cls.instructor, 
              room: cls.room, 
              shift: cls.shift,
              date: `${dd}/${mm}/${yyyy}`, 
              dateObj: new Date(yyyy, currentDate.getMonth(), currentDate.getDate()), 
              isAuto: true
            });
            count++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
          maxIter--;
        }
      }

      const manualSessions = sessionsData.filter(s => s.classId === cls._id);
      let mergedSessions = [...autoSessions];
      manualSessions.forEach(ms => {
        const idx = mergedSessions.findIndex(s => s.date === ms.date);
        const [d, m, y] = ms.date.split('/');
        const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
        const sessionDataToPush = {
          classId: cls._id, 
          className: cls.name, 
          subject: cls.subject, 
          instructor: cls.instructor, 
          room: cls.room, 
          shift: cls.shift,
          date: ms.date, 
          dateObj: dateObj, 
          isAuto: false
        };
        if (idx !== -1) mergedSessions[idx] = { ...mergedSessions[idx], ...sessionDataToPush };
        else mergedSessions.push(sessionDataToPush);
      });
      allSessions = [...allSessions, ...mergedSessions];
    });
    return allSessions.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  };

  const mySchedule = generateMySchedule();
  const classesToday = mySchedule.filter(s => s.date === todayStr);
  const upcomingClasses = mySchedule.filter(s => {
    const diffTime = s.dateObj.getTime() - todayReset.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  });

  // ================= THỐNG KÊ (CHUNG) =================
  const totalClassesEnrolled = myClasses.length;
  const totalClassesToday = classesToday.length;
  const totalAttended = historyData.filter(h => h.status === 'Có mặt').length;
  const totalHistoryCount = historyData.length;
  const attendanceRate = totalHistoryCount > 0 ? ((totalAttended / totalHistoryCount) * 100).toFixed(1) : "0.0";

  // ================= LOGIC CALENDAR (TAB 1 & TAB 3) =================
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay(); 
  
  const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const handlePrevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); };
  const handleNextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); };
  const handleToday = () => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); };

  // ================= LOGIC LỚP HỌC CỦA TÔI (TAB 2) =================
  const uniqueSubjectsMyClasses = Array.from(new Set(myClasses.map(c => c.subject)));
  const filteredMyClasses = myClasses.filter(cls => {
    const matchSearch = mcSearch === "" || (cls.name + cls.room + cls.instructor).toLowerCase().includes(mcSearch.toLowerCase());
    const matchShift = mcShift === "" || (cls.shift && cls.shift.startsWith(mcShift));
    const matchSubject = mcSubject === "" || cls.subject === mcSubject;
    return matchSearch && matchShift && matchSubject;
  });
  
  const clearMcFilters = () => { setMcSearch(""); setMcShift(""); setMcSubject(""); };

  const getClassProgress = (className: string, totalSessions: number) => {
    const attendedSessions = historyData.filter(h => h.className === className).length;
    return { attended: attendedSessions, total: totalSessions || 0 };
  };

  const handleViewAttendanceDetails = (className: string) => {
    setHistoryFilterClassName(className); 
    setActiveTab('history'); 
  };

  // ================= LOGIC LỊCH HỌC (TAB 3) =================
  const filteredScheduleSessions = mySchedule.filter(s => {
    let matchSub = scheduleSubject === "" || s.subject === scheduleSubject;
    let matchDate = true;
    if (scheduleStartDate && scheduleEndDate) {
      const sessDate = s.dateObj.getTime();
      const start = new Date(scheduleStartDate).getTime();
      const end = new Date(scheduleEndDate).getTime();
      matchDate = sessDate >= start && sessDate <= end;
    }
    return matchSub && matchDate;
  });

  const clearScheduleFilters = () => { setScheduleStartDate(""); setScheduleEndDate(""); setScheduleSubject(""); };

  // ================= LOGIC LỊCH SỬ ĐIỂM DANH (TAB 4) =================
  const displayedHistoryData = historyData.filter(item => {
    const matchClass = historyFilterClassName ? item.className === historyFilterClassName : true;
    const matchStatus = historyFilterStatus === "" || item.status === historyFilterStatus;
    
    let matchDate = true;
    if (historyFilterStartDate && historyFilterEndDate) {
      const [dd, mm, yyyy] = item.date.split('/');
      const itemDate = new Date(`${yyyy}-${mm}-${dd}`).getTime();
      const start = new Date(historyFilterStartDate).getTime();
      const end = new Date(historyFilterEndDate).getTime();
      matchDate = itemDate >= start && itemDate <= end;
    }

    return matchClass && matchStatus && matchDate;
  });

  const hTotalSessions = displayedHistoryData.length; 
  const hOnTime = displayedHistoryData.filter(h => h.status === 'Có mặt').length;
  const hAbsent = displayedHistoryData.filter(h => h.status === 'Vắng').length;
  const hLate = displayedHistoryData.filter(h => h.status === 'Muộn').length;
  const hRate = hTotalSessions > 0 ? (((hOnTime + hLate) / hTotalSessions) * 100).toFixed(1) : "0.0";
  
  const historyFilteredClassData = historyFilterClassName ? myClasses.find(c => c.name === historyFilterClassName) : null;

  if (!user) return <div className="p-10 text-center">Đang tải dữ liệu sinh viên...</div>;

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans text-gray-800">
      
      {/* ================= SIDEBAR (STUDENT) ================= */}
      <aside className="w-[260px] bg-white hidden md:flex flex-col shadow-sm z-10 shrink-0 border-r border-gray-100">
        <div className="h-16 flex items-center px-6 border-b border-gray-100"><div className="text-xl font-extrabold text-[#1e293b]">Student</div></div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">⏱️</span> Dashboard</button>
          <button onClick={() => setActiveTab('myclasses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'myclasses' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">🏫</span> Lớp học của tôi</button>
          <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'schedule' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">📅</span> Lịch học</button>
          <button onClick={() => { setActiveTab('history'); setHistoryFilterClassName(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'history' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">🕒</span> Lịch sử điểm danh</button>
        </nav>
        <div className="p-4 border-t border-gray-100"><button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-bold px-4 py-2 text-sm w-full">🚪 Đăng xuất</button></div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h1 className="text-lg font-semibold text-white">E-LEARNING LMS</h1>
          <div className="text-white text-sm font-semibold flex items-center gap-2"><span>🎓 Sinh viên: {user.name}</span></div>
        </header>
        
        {/* BREADCRUMB */}
        <div className="bg-emerald-500 px-8 py-2 text-white/80 text-sm flex items-center shrink-0 shadow-sm">
          <span>Sinh viên</span> <span className="mx-2">/</span> 
          <span className="font-semibold text-white">
            {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'myclasses' ? 'Lớp học của tôi' : activeTab === 'schedule' ? 'Lịch học' : 'Lịch sử điểm danh'}
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto relative bg-[#f4f7f6]">
          
          {/* ================= TAB 1: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl p-8 flex justify-between items-center shadow-md text-white">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">Chào mừng trở lại! 👋</h2>
                  <p className="text-white/90 text-sm font-medium">Hôm nay là {currentDayName.toLowerCase()}, {todayStr} - Chúc bạn một ngày học tập hiệu quả!</p>
                </div>
                <div className="bg-white/20 px-6 py-4 rounded-xl flex flex-col items-center justify-center border border-white/30 backdrop-blur-sm">
                  <span className="text-3xl font-extrabold">{totalClassesToday}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider mt-1">Buổi học hôm nay</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-emerald-600 rounded-xl p-5 text-white shadow-sm relative overflow-hidden"><div className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">Lớp học tham gia</div><div className="text-4xl font-extrabold flex items-center gap-3"><span>📚</span> {totalClassesEnrolled}</div><div className="w-full bg-white/20 h-1.5 rounded-full mt-5"><div className="bg-white h-1.5 rounded-full" style={{ width: '40%' }}></div></div></div>
                <div className="bg-teal-500 rounded-xl p-5 text-white shadow-sm"><div className="text-sm font-bold text-white/90 mb-3">Buổi học hôm nay</div><div className="text-4xl font-extrabold flex items-center gap-3"><span>📅</span> {totalClassesToday}</div><div className="text-xs font-semibold mt-4 text-white/90 bg-white/20 w-fit px-3 py-1 rounded-full">Sẵn sàng học tập</div></div>
                <div className="bg-emerald-700 rounded-xl p-5 text-white shadow-sm"><div className="text-sm font-bold text-white/80 mb-3">Tổng buổi đã học</div><div className="text-4xl font-extrabold flex items-center gap-3"><span>✔️</span> {totalAttended}</div><div className="text-xs font-semibold mt-4 text-white/80 bg-white/20 w-fit px-3 py-1 rounded-full">Kinh nghiệm</div></div>
                <div className="bg-[#f59e0b] rounded-xl p-5 text-white shadow-sm"><div className="text-sm font-bold text-white/90 mb-3">Tỷ lệ tham gia</div><div className="text-4xl font-extrabold flex items-center gap-3"><span>🏆</span> {attendanceRate}%</div><div className="text-xs font-semibold mt-4 text-white/90 bg-white/20 w-fit px-3 py-1 rounded-full">Tuyệt vời</div></div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">i</div><div className="text-sm"><span className="font-bold text-emerald-600 mr-1">Hôm nay bạn có {totalClassesToday} buổi học.</span><span className="text-gray-600 font-medium">Hãy chuẩn bị tốt để có một ngày học tập hiệu quả!</span></div></div>
                <button onClick={() => setActiveTab('schedule')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm">Xem chi tiết</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="p-4 border-b border-gray-100 flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-lg">📅</div><div><h3 className="font-bold text-gray-800 text-base">Lịch học hôm nay <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1 align-middle">{totalClassesToday}</span></h3><p className="text-xs text-gray-500 font-medium">{currentDayName}, {todayStr}</p></div></div><button onClick={() => setActiveTab('schedule')} className="text-sm font-semibold text-emerald-600 hover:underline">Xem tất cả &gt;</button></div>
                  <div className="p-4">
                    {classesToday.length === 0 ? (<div className="text-center py-10 text-gray-400 font-medium">Bạn không có ca học nào trong hôm nay. Nghỉ ngơi nhé!</div>) : (
                      <div className="space-y-4">{classesToday.map((cls, idx) => (<div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-600 hover:shadow-md transition-all"><div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-400"></div><div className="flex justify-between items-start ml-2"><div><h4 className="font-extrabold text-gray-800 text-base mb-2">{cls.className}</h4><div className="space-y-1.5"><div className="flex items-center gap-2 text-sm text-gray-600"><span className="text-emerald-600 text-xs">📘</span> <span className="font-medium">{cls.subject}</span></div><div className="flex items-center gap-2 text-sm text-gray-600"><span className="text-red-500 text-xs">📍</span> <span className="font-bold text-gray-700">{cls.room || 'Phòng học: Trống'}</span></div></div></div><div className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-md text-xs font-bold text-gray-600">{cls.shift ? cls.shift.split(' (')[0] : 'Ca học'}</div></div></div>))}</div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="p-4 border-b border-gray-100 flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-lg">🕒</div><div><h3 className="font-bold text-gray-800 text-base">Lịch học sắp tới</h3><p className="text-xs text-gray-500 font-medium">7 ngày tới</p></div></div><button onClick={() => setActiveTab('schedule')} className="text-sm font-semibold text-emerald-600 hover:underline">Xem lịch &gt;</button></div>
                  <div className="p-0">
                    {upcomingClasses.length === 0 ? (<div className="text-center py-10 text-gray-400 font-medium">Chưa có lịch học nào sắp tới.</div>) : (
                      <ul className="divide-y divide-gray-100">{upcomingClasses.map((cls, idx) => (<li key={idx} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"><div><h4 className="font-bold text-gray-800 text-sm mb-1">{cls.className}</h4><div className="flex items-center gap-2 text-xs text-gray-500"><span className="text-emerald-500">📘</span> {cls.subject}</div><div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><span className="text-orange-500">🕒</span> Thứ {cls.dateObj.getDay() === 0 ? 'Chủ nhật' : cls.dateObj.getDay() + 1}, {cls.date} - {cls.shift ? cls.shift.split(' (')[0] : ''}</div></div><div className="flex flex-col items-end"><span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded text-xs font-bold mb-1">{cls.date.slice(0, 5)}</span></div></li>))}</ul>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="p-4 border-b border-gray-100 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">📇</div><div><h3 className="font-bold text-gray-800 text-base">Lịch học tháng này</h3><p className="text-xs text-gray-500 font-medium">Tổng quan lịch học</p></div></div>
                  <div className="p-6">
                    <div className="flex items-center justify-center gap-6 text-xs font-bold text-gray-500 mb-4"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border border-green-300 bg-green-50 inline-block"></span> Ca Sáng</div><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border border-blue-300 bg-blue-50 inline-block"></span> Ca Chiều</div><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border border-purple-300 bg-purple-50 inline-block"></span> Ca Tối</div></div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-600 p-3 flex justify-between items-center text-white"><div className="font-bold text-lg ml-2">tháng {currentMonth + 1} {currentYear}</div><div className="flex items-center gap-1 bg-white/20 rounded-lg p-1"><button onClick={handlePrevMonth} className="px-3 py-1 hover:bg-white/20 rounded font-bold transition-colors">&lt;</button><button onClick={handleToday} className="px-4 py-1 hover:bg-white/20 rounded text-sm font-bold transition-colors">Hôm nay</button><button onClick={handleNextMonth} className="px-3 py-1 hover:bg-white/20 rounded font-bold transition-colors">&gt;</button></div></div>
                      <div className="grid grid-cols-7 bg-white border-b border-gray-100">{dayNames.map(day => (<div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</div>))}</div>
                      <div className="grid grid-cols-7 bg-gray-100 gap-px">
                        {Array.from({ length: firstDay }).map((_, idx) => (<div key={`empty-${idx}`} className="bg-white min-h-[100px]"></div>))}
                        {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                          const dayNum = idx + 1; const dateStr = `${String(dayNum).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`; const sessionsOnThisDay = mySchedule.filter(s => s.date === dateStr); const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
                          return (
                            <div key={dayNum} className="bg-white min-h-[100px] p-1.5 flex flex-col gap-1 transition-colors hover:bg-gray-50">
                              <div className="text-center mb-1"><span className={`inline-block w-7 h-7 rounded-full text-xs font-bold leading-7 ${isToday ? 'bg-emerald-600 text-white' : 'text-gray-700'}`}>{dayNum}</span></div>
                              <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                                {sessionsOnThisDay.map((sess, sIdx) => {
                                  let colorClass = "border-gray-200 bg-gray-50 text-gray-600";
                                  if (sess.shift?.includes("Ca 1") || sess.shift?.includes("Ca 2")) colorClass = "border-green-200 bg-green-50 text-green-700"; else if (sess.shift?.includes("Ca 3") || sess.shift?.includes("Ca 4")) colorClass = "border-blue-200 bg-blue-50 text-blue-700"; else if (sess.shift?.includes("Ca 5") || sess.shift?.includes("Ca 6")) colorClass = "border-purple-200 bg-purple-50 text-purple-700";
                                  return (<div key={sIdx} className={`border rounded px-1.5 py-1 text-[9px] leading-tight text-center truncate ${colorClass}`} title={`${sess.className} - ${sess.subject}`}><span className="font-bold">{sess.className}</span><div className="text-[8px] opacity-80 truncate">{sess.room || 'N/A'}</div></div>);
                                })}
                              </div>
                            </div>
                          )
                        })}
                        {Array.from({ length: (7 - ((firstDay + daysInCurrentMonth) % 7)) % 7 }).map((_, idx) => (<div key={`empty-end-${idx}`} className="bg-white min-h-[100px]"></div>))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 text-sm">📱</div><h3 className="font-bold text-gray-800 text-sm">Lớp học của tôi</h3><span className="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{myClasses.length}</span></div><button onClick={() => setActiveTab('myclasses')} className="text-xs font-semibold text-emerald-600 hover:underline">Xem tất cả &gt;</button></div>
                  <div className="p-0 max-h-[500px] overflow-y-auto">
                    {myClasses.length === 0 ? (<div className="text-center py-10 text-gray-400 text-sm font-medium">Bạn chưa tham gia lớp học nào.</div>) : (
                      <ul className="divide-y divide-gray-100">{myClasses.map((cls, idx) => (<li key={idx} className="p-4 hover:bg-gray-50 transition-colors"><h4 className="font-bold text-gray-800 text-sm mb-1">{cls.name}</h4><div className="text-xs text-gray-500 mb-2 truncate">{cls.subject}</div><div className="flex items-center gap-2"><span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">{cls.shift ? cls.shift.split(' (')[0] : 'Ca học'}</span><span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">{cls.instructor}</span></div></li>))}</ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: LỚP HỌC CỦA TÔI ================= */}
          {activeTab === 'myclasses' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-t-xl p-5 flex justify-between items-center shadow-md">
                <h2 className="text-lg font-bold flex items-center gap-2"><span>🏫</span> Lớp học của tôi</h2>
              </div>

              <div className="bg-white p-6 rounded-b-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span><input type="text" placeholder="Tìm kiếm lớp học, giảng viên..." value={mcSearch} onChange={e => setMcSearch(e.target.value)} className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-emerald-500 bg-white"/></div>
                  <select value={mcShift} onChange={e => setMcShift(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-600 bg-white"><option value="">Tất cả ca học</option><option value="Ca 1">Ca 1</option><option value="Ca 2">Ca 2</option><option value="Ca 3">Ca 3</option><option value="Ca 4">Ca 4</option><option value="Ca 5">Ca 5</option><option value="Ca 6">Ca 6</option></select>
                  <select value={mcSubject} onChange={e => setMcSubject(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-600 bg-white"><option value="">Tất cả môn học</option>{uniqueSubjectsMyClasses.map(sub => <option key={sub} value={sub}>{sub}</option>)}</select>
                  <button onClick={clearMcFilters} className="text-sm font-bold text-red-500 hover:text-red-700 h-fit py-2.5">Xóa bộ lọc</button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                      <tr><th className="px-5 py-4 font-bold text-center w-16 uppercase tracking-wider">STT</th><th className="px-5 py-4 font-bold uppercase tracking-wider">Tên lớp / Môn học</th><th className="px-5 py-4 font-bold uppercase tracking-wider">Phòng</th><th className="px-5 py-4 font-bold uppercase tracking-wider">Giảng viên</th><th className="px-5 py-4 font-bold text-center uppercase tracking-wider">Ca học</th><th className="px-5 py-4 font-bold uppercase tracking-wider">Lịch học</th><th className="px-5 py-4 font-bold uppercase tracking-wider w-40">Buổi học (Tiến độ)</th><th className="px-5 py-4 font-bold text-center uppercase tracking-wider">Thao tác</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredMyClasses.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-16 text-gray-400 font-medium bg-white">Không tìm thấy lớp học nào phù hợp.</td></tr>
                      ) : (
                        filteredMyClasses.map((cls, index) => {
                          const progress = getClassProgress(cls.name, cls.totalSessions);
                          const percentage = progress.total > 0 ? (progress.attended / progress.total) * 100 : 0;
                          return (
                            <tr key={cls._id} className="hover:bg-gray-50/50 bg-white transition-colors">
                              <td className="px-5 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                              <td className="px-5 py-4"><div className="font-extrabold text-gray-900 text-base">{cls.name}</div><div className="text-xs text-gray-500 mt-0.5">{cls.subject}</div></td>
                              <td className="px-5 py-4 font-medium text-pink-700"><span className="bg-pink-50 border border-pink-100 px-2.5 py-1 rounded text-xs font-semibold">{cls.room || 'N/A'}</span></td>
                              <td className="px-5 py-4 font-medium text-gray-800 flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">👤</div><span>{cls.instructor}</span></td>
                              <td className="px-5 py-4 text-center font-bold text-orange-600"><span className="bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-xs uppercase">{cls.shift ? cls.shift.split(' (')[0] : 'N/A'}</span></td>
                              <td className="px-5 py-4 font-medium text-emerald-600">📅 {cls.scheduleDays?.join(', ') || 'N/A'}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1.5"><span>{percentage.toFixed(0)}%</span><span>{progress.attended}/{progress.total} buổi</span></div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className={`h-1.5 rounded-full transition-all ${percentage >= 100 ? 'bg-green-500' : 'bg-emerald-600'}`} style={{ width: `${percentage}%` }}></div></div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <button onClick={() => handleViewAttendanceDetails(cls.name)} className="bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap mx-auto">
                                   Xem lại điểm danh
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: LỊCH HỌC CALENDAR & LIST ================= */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full relative">
               
               <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-t-xl flex justify-between items-center shadow-md shrink-0">
                  <h2 className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">📅</span> Lịch học</h2>
                  <div className="flex bg-white/20 p-1 rounded-lg">
                      <button onClick={() => setScheduleViewMode('calendar')} className={`px-4 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors ${scheduleViewMode === 'calendar' ? 'bg-white text-emerald-600' : 'text-white hover:bg-white/10'}`}>📅 Lịch</button>
                      <button onClick={() => setScheduleViewMode('list')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${scheduleViewMode === 'list' ? 'bg-white text-emerald-600' : 'text-white hover:bg-white/10'}`}>🗂️ Danh sách</button>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-b-xl shadow-sm border border-gray-200 flex-1 overflow-y-auto">
                
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Bộ lọc:</span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-md border border-gray-200">
                      <input type="date" value={scheduleStartDate} onChange={(e) => setScheduleStartDate(e.target.value)} className="bg-transparent px-2 py-2.5 text-sm outline-none text-gray-600"/>
                      <span className="text-gray-400">→</span>
                      <input type="date" value={scheduleEndDate} onChange={(e) => setScheduleEndDate(e.target.value)} className="bg-transparent px-2 py-2.5 text-sm outline-none text-gray-600"/>
                    </div>
                    <select value={scheduleSubject} onChange={(e) => setScheduleSubject(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-emerald-500 text-gray-700 bg-gray-50 min-w-[200px]">
                      <option value="">Tất cả môn học</option>
                      {uniqueSubjectsMyClasses.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                    <button onClick={clearScheduleFilters} className="text-sm font-bold text-gray-500 hover:text-red-600 border border-gray-200 bg-white hover:bg-red-50 px-5 py-2.5 rounded-md transition-colors shadow-sm">
                      Xóa bộ lọc
                    </button>
                </div>

                {scheduleViewMode === 'calendar' ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-emerald-600 p-3 flex justify-between items-center text-white">
                      <div className="font-bold text-lg ml-2">tháng {currentMonth + 1} {currentYear}</div>
                      <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                        <button onClick={handlePrevMonth} className="px-3 py-1.5 hover:bg-white/10 rounded font-bold transition-colors">&lt;</button>
                        <button onClick={handleToday} className="px-4 py-1.5 text-sm font-bold bg-white text-emerald-600 rounded hover:bg-gray-100 transition-colors">Hôm nay</button>
                        <button onClick={handleNextMonth} className="px-3 py-1.5 hover:bg-white/10 rounded font-bold transition-colors">&gt;</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 border-b border-gray-100 bg-white">
                      {dayNames.map(day => (<div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-r-0">{day}</div>))}
                    </div>

                    <div className="grid grid-cols-7 bg-gray-50 gap-px flex-1">
                      {Array.from({ length: firstDay }).map((_, idx) => (<div key={`empty-${idx}`} className="bg-white p-2 min-h-[120px]"></div>))}
                      {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = `${String(dayNum).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
                        const sessionsOnThisDay = mySchedule.filter(s => s.date === dateStr);
                        const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                        return (
                          <div key={dayNum} className={`bg-white p-2 min-h-[120px] flex flex-col gap-1 transition-colors hover:bg-emerald-50/20 ${isToday ? 'ring-2 ring-inset ring-emerald-600 bg-emerald-50/10' : ''}`}>
                            <div className={`text-right text-xs font-bold ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>{dayNum}</div>
                            <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                              {sessionsOnThisDay.map((sess, sIdx) => {
                                let colorClass = "border-gray-200 bg-gray-50 text-gray-700";
                                if (sess.shift?.includes("Ca 1") || sess.shift?.includes("Ca 2")) colorClass = "border-green-300 bg-green-100 text-green-800";
                                else if (sess.shift?.includes("Ca 3") || sess.shift?.includes("Ca 4")) colorClass = "border-blue-300 bg-blue-100 text-blue-800";
                                else if (sess.shift?.includes("Ca 5") || sess.shift?.includes("Ca 6")) colorClass = "border-purple-300 bg-purple-100 text-purple-800";

                                return (
                                  <div key={sIdx} className={`border-l-2 rounded-r px-1.5 py-1.5 text-[10px] leading-tight flex flex-col text-left cursor-pointer hover:opacity-80 transition-opacity shadow-sm ${colorClass}`} title={`${sess.className} - ${sess.subject}`}>
                                    <div className="font-bold truncate">{sess.className}</div>
                                    <div className="truncate opacity-80">{sess.subject}</div>
                                    <div className="mt-0.5 font-semibold flex justify-between gap-1">
                                      <span className="truncate">{sess.room || 'N/A'}</span>
                                      <span className="whitespace-nowrap">{sess.shift ? sess.shift.split(' (')[0] : ''}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      })}
                       {Array.from({ length: (7 - ((firstDay + daysInCurrentMonth) % 7)) % 7 }).map((_, idx) => (<div key={`empty-end-${idx}`} className="bg-white p-2 min-h-[120px]"></div>))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm whitespace-nowrap bg-white">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                        <tr>
                          <th className="px-5 py-4 font-bold text-center w-16 uppercase tracking-wider">STT</th>
                          <th className="px-5 py-4 font-bold uppercase tracking-wider">Ngày giảng dạy</th>
                          <th className="px-5 py-4 font-bold uppercase tracking-wider">Ca học & Phòng</th>
                          <th className="px-5 py-4 font-bold uppercase tracking-wider">Lớp & Môn học</th>
                          <th className="px-5 py-4 font-bold uppercase tracking-wider">Giảng viên</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredScheduleSessions.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-16 text-gray-400 font-medium">Không tìm thấy lịch học nào phù hợp.</td></tr>
                        ) : (
                          filteredScheduleSessions.map((sess, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 bg-white transition-colors">
                              <td className="px-5 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                              <td className="px-5 py-4">
                                <div className="font-bold text-gray-800">{sess.date}</div>
                                <div className="text-xs text-gray-500 mt-0.5 capitalize">{daysOfWeek[sess.dateObj.getDay()]}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded text-xs font-semibold">{sess.shift ? sess.shift.split(' (')[0] : 'N/A'}</span>
                                  🕒 {sess.shift ? sess.shift.match(/\((.*?)\)/)?.[1] : ''}
                                </div>
                                <div className="text-xs font-bold text-pink-700 bg-pink-50 w-fit px-2.5 py-1 rounded border border-pink-100">📍 {sess.room || 'N/A'}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-extrabold text-gray-900 text-base">{sess.className}</div>
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">📘 {sess.subject}</div>
                              </td>
                              <td className="px-5 py-4 font-medium text-gray-800 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">👤</div>
                                <span>{sess.instructor}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: LỊCH SỬ ĐIỂM DANH ================= */}
          {activeTab === 'history' && (
            <div className="max-w-7xl mx-auto space-y-6">
              
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-t-xl p-5 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    {historyFilterClassName && (
                      <button onClick={() => setHistoryFilterClassName(null)} className="text-white hover:text-white/80 text-sm font-bold pr-1 flex items-center gap-1 transition-colors">
                        ← Quay lại danh sách lớp
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                    <span className="text-3xl">🗓️</span> Lịch sử điểm danh {historyFilterClassName ? `- ${historyFilterClassName}` : ''}
                  </h2>
                  {historyFilterClassName && historyFilteredClassData ? (
                    <p className="text-sm text-white/80 font-medium">Môn học: {historyFilteredClassData.subject} | Giảng viên: {historyFilteredClassData.instructor}</p>
                  ) : (
                    <p className="text-sm text-white/80 font-medium">Tổng quan lịch sử điểm danh của tất cả các môn</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-b-xl shadow-sm border border-gray-200">
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center shadow-sm">
                    <div className="text-gray-500 font-semibold text-sm mb-2">Tổng buổi học</div>
                    <div className="text-emerald-600 font-extrabold text-3xl flex items-center gap-2">
                      <span className="text-emerald-500 text-2xl"></span> {hTotalSessions}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center shadow-sm">
                    <div className="text-gray-500 font-semibold text-sm mb-2">Có mặt</div>
                    <div className="text-green-500 font-extrabold text-3xl flex items-center gap-2 mb-1">
                      <span className="text-green-500 text-2xl">✅</span> {hOnTime}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center shadow-sm">
                    <div className="text-gray-500 font-semibold text-sm mb-2">Đi muộn</div>
                    <div className="text-yellow-500 font-extrabold text-3xl flex items-center gap-2 mb-1">
                      <span className="text-yellow-500 text-2xl">🕒</span> {hLate}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center shadow-sm">
                    <div className="text-gray-500 font-semibold text-sm mb-2">Vắng mặt</div>
                    <div className="text-red-500 font-extrabold text-3xl flex items-center gap-2">
                      <span className="text-red-500 text-2xl">❌</span> {hAbsent}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center shadow-sm relative overflow-hidden">
                    <div className="text-gray-500 font-semibold text-sm mb-2">Tỷ lệ tham gia</div>
                    <div className="text-green-500 font-extrabold text-3xl flex items-center gap-2 mb-2">
                      <span className="text-green-500 text-2xl">🏆</span> {hRate}%
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${hRate}%` }}></div>
                    </div>
                    <div className="text-xs font-semibold text-green-600">Đạt yêu cầu</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-700">Bộ lọc:</span>
                  <select value={historyFilterClassName || ""} onChange={(e) => setHistoryFilterClassName(e.target.value || null)} className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-700 bg-gray-50 min-w-[150px]">
                    <option value="">Tất cả lớp học</option>
                    {myClasses.map(cls => <option key={cls._id} value={cls.name}>{cls.name}</option>)}
                  </select>
                  <select value={historyFilterStatus} onChange={(e) => setHistoryFilterStatus(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-700 bg-gray-50 min-w-[150px]">
                    <option value="">Tất cả trạng thái</option>
                    <option value="Có mặt">Có mặt</option>
                    <option value="Vắng">Vắng</option>
                    <option value="Muộn">Muộn</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 focus-within:border-emerald-500 transition-colors">
                      <input type="date" value={historyFilterStartDate} onChange={(e) => setHistoryFilterStartDate(e.target.value)} className="bg-transparent px-3 py-2 text-sm outline-none text-gray-600" title="Từ ngày"/>
                      <span className="text-gray-400">-</span>
                      <input type="date" value={historyFilterEndDate} onChange={(e) => setHistoryFilterEndDate(e.target.value)} className="bg-transparent px-3 py-2 text-sm outline-none text-gray-600" title="Đến ngày"/>
                    </div>
                  </div>
                  <button onClick={() => { setHistoryFilterStatus(""); setHistoryFilterStartDate(""); setHistoryFilterEndDate(""); if(!historyFilterClassName) setHistoryFilterClassName(null); }} className="text-sm font-bold text-gray-500 hover:text-red-600 border border-gray-200 bg-white hover:bg-red-50 px-4 py-2 rounded-md transition-colors shadow-sm">
                    Xóa bộ lọc
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-4">
                  <table className="w-full text-left text-sm whitespace-nowrap bg-white">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                      <tr>
                        <th className="px-5 py-4 font-bold text-center w-16 uppercase tracking-wider">STT</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider">Ngày học</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider">Lớp học</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider">Giảng viên</th>
                        <th className="px-5 py-4 font-bold text-center uppercase tracking-wider">Trạng thái</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {displayedHistoryData.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-16 text-gray-400 font-medium bg-white">
                          {historyFilterClassName 
                            ? `Lớp ${historyFilterClassName} chưa được điểm danh buổi nào.`
                            : 'Chưa có lịch sử điểm danh nào.'}
                        </td></tr>
                      ) : (
                        displayedHistoryData.map((item, index) => {
                          const isPresent = item.status === 'Có mặt';
                          const isAbsent = item.status === 'Vắng';
                          return (
                            <tr key={item._id} className="hover:bg-gray-50/50 bg-white transition-colors">
                              <td className="px-5 py-4 text-center font-medium text-gray-500">{displayedHistoryData.length - index}</td>
                              <td className="px-5 py-4">
                                <div className="font-bold text-gray-800">{item.date}</div>
                                <div className="text-xs text-gray-500 mt-0.5">Ghi: {item.timestamp}</div>
                              </td>
                              <td className="px-5 py-4">
                                 <div className="font-bold text-emerald-600">{item.className}</div>
                                 <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">📘 {item.subjectName}</div>
                              </td>
                              <td className="px-5 py-4 font-medium text-gray-800 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">👤</div>
                                <span>{item.instructor}</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded text-xs font-bold shadow-sm border ${isPresent ? 'bg-green-50 text-green-600 border-green-100' : isAbsent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                  {isPresent ? '✅ Có mặt' : isAbsent ? '❌ Vắng' : '🕒 Muộn'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-gray-500 italic text-xs font-medium">{item.note || '-'}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}