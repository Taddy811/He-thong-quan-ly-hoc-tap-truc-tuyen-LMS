"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InstructorDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("schedule"); 

  // ================= STATE DỮ LIỆU =================
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]); 
  const [historyData, setHistoryData] = useState<any[]>([]); 
  const [sessionsData, setSessionsData] = useState<any[]>([]);

  // ================= STATE QUẢN LÝ LỚP HỌC =================
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState<any>(null);

  // ================= STATE ĐIỂM DANH =================
  const [attSelectedClass, setAttSelectedClass] = useState("");
  const [attSelectedDate, setAttSelectedDate] = useState("");
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  // ================= STATE LỊCH SỬ ĐIỂM DANH =================
  const [historyFilterClass, setHistoryFilterClass] = useState("");
  const [historyFilterStatus, setHistoryFilterStatus] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState(""); 
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historySearch, setHistorySearch] = useState("");

  // ================= STATE QUẢN LÝ BUỔI HỌC =================
  const [sessionSelectedClass, setSessionSelectedClass] = useState("");
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isSessionEdit, setIsSessionEdit] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({ 
    classId: "", dateInput: "", date: "", dayOfWeek: "", note: "", status: "Chưa điểm danh" 
  });

  // ================= STATE LỊCH GIẢNG DẠY =================
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [scheduleEndDate, setScheduleEndDate] = useState("");
  const [scheduleSubject, setScheduleSubject] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar'); 

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'instructor') {
        router.push(`/dashboard/${parsedUser.role}`);
        return;
      }
      setUser(parsedUser);
      fetchUsers();
      fetchMyClasses(parsedUser.name);
      fetchAttendanceHistory(parsedUser.name);
      fetchSessions();
    }
  }, []);

  // ================= FETCH APIs =================
  const fetchUsers = async () => { const res = await fetch("/api/auth/users"); if(res.ok) setUsersData(await res.json()); };
  
  const fetchMyClasses = async (instructorName: string) => {
    const res = await fetch("/api/classes");
    if (res.ok) {
      const allClasses = await res.json();
      setMyClasses(allClasses.filter((c: any) => c.instructor === instructorName));
    }
  };

  const fetchAttendanceHistory = async (instructorName: string) => {
    const res = await fetch("/api/attendance");
    if (res.ok) {
      const data = await res.json();
      const myHistory = data.filter((d: any) => d.instructor === instructorName);
      const formatted = myHistory.map((item: any) => ({
        id: item._id, studentName: item.studentName, className: item.className, subjectName: item.subjectName,
        date: item.date, status: item.status, note: item.note || "-", timestamp: new Date(item.updatedAt).toLocaleString("vi-VN")
      }));
      setHistoryData(formatted);
    }
  };

  const fetchSessions = async () => {
    const res = await fetch("/api/sessions");
    if(res.ok) setSessionsData(await res.json());
  };

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/login"); };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ================= HANDLERS LỚP HỌC =================
  const handleClearClassFilters = () => { setSearchQuery(""); setShiftFilter(""); };
  
  const openClassDetail = (cls: any) => { 
    setSelectedClassDetail(cls); 
    setIsClassDetailModalOpen(true); 
  };
  
  const displayedClasses = myClasses.filter(c => {
    const matchSearch = (c.name + c.subject + c.room).toLowerCase().includes(searchQuery.toLowerCase());
    const matchShift = shiftFilter === "" || c.shift === shiftFilter;
    return matchSearch && matchShift;
  });

  // ================= HANDLERS ĐIỂM DANH =================
  const getUpcomingDates = () => {
    const dates = []; const today = new Date();
    for (let i = 0; i <= 7; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      dates.push(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
    }
    return dates;
  };
  const upcomingDates = getUpcomingDates();

  const handleSelectClassForAttendance = (classId: string) => {
    setAttSelectedClass(classId); const cls = myClasses.find(c => c._id === classId);
    if (cls && cls.students) setAttendanceList(cls.students.map((stuName: string) => ({ studentName: stuName, status: "Vắng", note: "" })));
    else setAttendanceList([]);
  };

  const handleBulkAttendance = (status: string) => { setAttendanceList(prev => prev.map(item => ({ ...item, status }))); };
  const handleStatusChange = (index: number, status: string) => { const newData = [...attendanceList]; newData[index].status = status; setAttendanceList(newData); };
  const handleNoteChange = (index: number, note: string) => { const newData = [...attendanceList]; newData[index].note = note; setAttendanceList(newData); };
  
  const handleSaveAttendance = async () => {
    if (!attSelectedClass || !attSelectedDate) { alert("Vui lòng chọn lớp và ngày điểm danh trước khi lưu!"); return; }
    const cls = myClasses.find(c => c._id === attSelectedClass);
    const payload = { classId: cls._id, className: cls.name, subjectName: cls.subject, date: attSelectedDate, instructor: user.name, records: attendanceList };
    try {
      const res = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if(res.ok) { alert("🎉 Đã lưu kết quả điểm danh vào cơ sở dữ liệu!"); fetchAttendanceHistory(user.name); } 
      else alert("Lỗi khi lưu điểm danh!");
    } catch (error) { alert("Lỗi mạng!"); }
  };

  const attTotalStudents = attendanceList.length;
  const attPresentCount = attendanceList.filter(a => a.status === 'Có mặt').length;
  const attAbsentCount = attendanceList.filter(a => a.status === 'Vắng').length;
  const attLateCount = attendanceList.filter(a => a.status === 'Muộn').length;
  const selectedClassData = myClasses.find(c => c._id === attSelectedClass);

  // ================= HANDLERS LỊCH SỬ ĐIỂM DANH =================
  const filteredHistory = historyData.filter(item => {
    const u = usersData.find(u => u.name === item.studentName);
    const searchString = (item.studentName + (u?.username || "")).toLowerCase();
    const matchClass = historyFilterClass === "" || item.className === historyFilterClass;
    const matchStatus = historyFilterStatus === "" || item.status === historyFilterStatus;
    const matchSearch = historySearch === "" || searchString.includes(historySearch.toLowerCase());
    
    let matchDate = true;
    if (historyStartDate || historyEndDate) {
      const [d, m, y] = item.date.split('/');
      const itemTime = new Date(`${y}-${m}-${d}`).setHours(0,0,0,0);
      
      if (historyStartDate && historyEndDate) {
        const start = new Date(historyStartDate).setHours(0,0,0,0);
        const end = new Date(historyEndDate).setHours(23,59,59,999);
        matchDate = itemTime >= start && itemTime <= end;
      } else if (historyStartDate) {
        const start = new Date(historyStartDate).setHours(0,0,0,0);
        matchDate = itemTime >= start;
      } else if (historyEndDate) {
        const end = new Date(historyEndDate).setHours(23,59,59,999);
        matchDate = itemTime <= end;
      }
    }
    return matchClass && matchStatus && matchSearch && matchDate;
  });
  const clearHistoryFilters = () => { setHistoryFilterClass(""); setHistoryFilterStatus(""); setHistoryStartDate(""); setHistoryEndDate(""); setHistorySearch(""); };

  const histTotal = filteredHistory.length;
  const histPresent = filteredHistory.filter(x => x.status === 'Có mặt').length;
  const histAbsent = filteredHistory.filter(x => x.status === 'Vắng').length;
  const histLate = filteredHistory.filter(x => x.status === 'Muộn').length;

  // ================= TÍNH TOÁN & GỘP BUỔI HỌC TỰ ĐỘNG + THỦ CÔNG =================
  const dayMap: { [key: string]: number } = { 'Chủ nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6, 'Thứ bảy': 6 };
  
  const generateAutoSessions = (cls: any) => {
    if (!cls || !cls.startDate || !cls.totalSessions || !cls.scheduleDays || cls.scheduleDays.length === 0) return [];
    let sessions = [];
    let currentDate = new Date(cls.startDate);
    const targetDays = cls.scheduleDays.map((d: string) => dayMap[d]);
    const total = Number(cls.totalSessions) || 0;
    
    let count = 0; let maxIterations = 365; 
    
    while (count < total && maxIterations > 0) {
      if (targetDays.includes(currentDate.getDay())) {
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const yyyy = currentDate.getFullYear();
        const dateStr = `${dd}/${mm}/${yyyy}`;
        
        const isAttended = historyData.some(h => h.className === cls.name && h.date === dateStr);
        
        sessions.push({
          id: `auto-${count}-${cls._id}`,
          classId: cls._id,
          date: dateStr,
          dayOfWeek: cls.scheduleDays.find((d: string) => dayMap[d] === currentDate.getDay()),
          status: isAttended ? 'Đã điểm danh' : 'Chưa điểm danh',
          note: '-',
          isAuto: true
        });
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
      maxIterations--;
    }
    return sessions;
  };

  // Logic Tab 4 (Quản lý buổi học của 1 lớp)
  const selectedSessionClassData = myClasses.find(c => c._id === sessionSelectedClass);
  const manualSessionsForSelectedClass = sessionsData.filter(s => s.classId === sessionSelectedClass);
  const autoSessionsForSelectedClass = generateAutoSessions(selectedSessionClassData);
  let mergedSessionsForClass = [...autoSessionsForSelectedClass];

  manualSessionsForSelectedClass.forEach(manualSess => {
    const isAttended = historyData.some(h => h.className === selectedSessionClassData?.name && h.date === manualSess.date);
    const syncedStatus = isAttended ? 'Đã điểm danh' : manualSess.status;
    const idx = mergedSessionsForClass.findIndex(s => s.date === manualSess.date);
    if (idx !== -1) mergedSessionsForClass[idx] = { ...mergedSessionsForClass[idx], ...manualSess, status: syncedStatus, id: manualSess._id, isAuto: false };
    else mergedSessionsForClass.push({ ...manualSess, status: syncedStatus, id: manualSess._id, isAuto: false });
  });

  mergedSessionsForClass.sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/'); const [d2, m2, y2] = b.date.split('/');
    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
  });

  const sessionAttendedCount = mergedSessionsForClass.filter(s => s.status === 'Đã điểm danh').length;
  const sessionUpcomingCount = mergedSessionsForClass.filter(s => s.status === 'Chưa điểm danh').length;

  const handleDateChange = (e: any) => {
    const val = e.target.value; 
    if(!val) return setSessionForm({...sessionForm, dateInput: "", date: "", dayOfWeek: ""});
    const dateObj = new Date(val);
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ bảy'];
    const [y, m, d] = val.split('-');
    setSessionForm({...sessionForm, dateInput: val, date: `${d}/${m}/${y}`, dayOfWeek: days[dateObj.getDay()]});
  };

  const handleSessionSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = { ...sessionForm, classId: sessionSelectedClass };
      let url = "/api/sessions", method = "POST";
      if (isSessionEdit && editSessionId) { url = `/api/sessions/${editSessionId}`; method = "PUT"; }
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { alert("Thành công!"); setIsSessionModalOpen(false); fetchSessions(); } else alert("Lỗi!");
    } catch (error) { alert("Lỗi mạng!"); }
  };

  const deleteSession = async (id: string, isAuto: boolean) => {
    if (isAuto) return alert("Không thể xóa buổi học tự động. Bạn chỉ có thể sửa nó.");
    if (confirm("Xoá buổi học này?")) { await fetch(`/api/sessions/${id}`, { method: "DELETE" }); fetchSessions(); }
  };

  const openAddSession = () => {
    if(!sessionSelectedClass) return alert("Vui lòng chọn lớp học trước!");
    setIsSessionEdit(false); setEditSessionId(null);
    setSessionForm({ classId: sessionSelectedClass, dateInput: "", date: "", dayOfWeek: "", note: "", status: "Chưa điểm danh" });
    setIsSessionModalOpen(true);
  };

  const openEditSession = (sess: any) => {
    const [d, m, y] = sess.date.split('/');
    setSessionForm({ classId: sessionSelectedClass, dateInput: `${y}-${m}-${d}`, date: sess.date, dayOfWeek: sess.dayOfWeek, note: sess.note || "-", status: sess.status });
    if (sess.isAuto === false || sess._id) { setIsSessionEdit(true); setEditSessionId(sess._id || sess.id); } 
    else { setIsSessionEdit(false); setEditSessionId(null); }
    setIsSessionModalOpen(true);
  };

  // ================= LOGIC LỊCH GIẢNG DẠY (TAB 5) =================
  const getAllInstructorSessions = () => {
    let all: any[] = [];
    myClasses.forEach(cls => {
      const autoSess = generateAutoSessions(cls);
      const manual = sessionsData.filter(s => s.classId === cls._id);
      
      let merged = [...autoSess];
      manual.forEach(ms => {
        const isAttended = historyData.some(h => h.className === cls.name && h.date === ms.date);
        const syncedStatus = isAttended ? 'Đã điểm danh' : ms.status;
        const idx = merged.findIndex(s => s.date === ms.date);
        if (idx !== -1) merged[idx] = { ...merged[idx], ...ms, status: syncedStatus, isAuto: false };
        else merged.push({ ...ms, status: syncedStatus, isAuto: false });
      });
      
      merged = merged.map(m => ({ ...m, classId: cls._id, className: cls.name, subject: cls.subject, shift: cls.shift, room: cls.room }));
      all = [...all, ...merged];
    });
    return all;
  };

  const allInstructorSessions = getAllInstructorSessions();

  const filteredScheduleSessions = allInstructorSessions.filter(s => {
    let matchSub = scheduleSubject === "" || s.subject === scheduleSubject;
    let matchDate = true;
    if (scheduleStartDate && scheduleEndDate) {
      const [d, m, y] = s.date.split('/');
      const sessDate = new Date(`${y}-${m}-${d}`).getTime();
      const start = new Date(scheduleStartDate).getTime();
      const end = new Date(scheduleEndDate).getTime();
      matchDate = sessDate >= start && sessDate <= end;
    }
    return matchSub && matchDate;
  });

  const sortedScheduleSessions = [...filteredScheduleSessions].sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/'); const [d2, m2, y2] = b.date.split('/');
    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
  });

  const clearScheduleFilters = () => { setScheduleStartDate(""); setScheduleEndDate(""); setScheduleSubject(""); };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay(); 

  const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } 
    else setCurrentMonth(currentMonth - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } 
    else setCurrentMonth(currentMonth + 1);
  };
  const handleToday = () => {
    setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear());
  };

  const extractTimeFromShift = (shiftStr: string) => {
    if (!shiftStr) return "-";
    const match = shiftStr.match(/\((.*?)\)/);
    return match ? match[1] : shiftStr;
  };
  const extractCaFromShift = (shiftStr: string) => {
    if (!shiftStr) return "-";
    return shiftStr.split(' ')[0] + ' ' + shiftStr.split(' ')[1]; 
  };

  const handleJumpToAttendance = (sess: any) => {
    setActiveTab('attendance');
    handleSelectClassForAttendance(sess.classId);
    setAttSelectedDate(sess.date);
  };

  const uniqueSubjects = Array.from(new Set(myClasses.map(c => c.subject)));
  const schedTotalClasses = myClasses.length;
  const schedTotalSessions = allInstructorSessions.length;
  const schedTotalSubjects = uniqueSubjects.length;
  const schedTotalStudents = Array.from(new Set(myClasses.flatMap(c => c.students || []))).length;


  if (!user) return <div className="p-10 text-center">Đang tải dữ liệu giảng viên...</div>;

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white hidden md:flex flex-col shadow-sm z-10 shrink-0 border-r border-gray-100">
        <div className="h-16 flex items-center px-6 border-b border-gray-100"><div className="text-xl font-extrabold text-[#1e293b]">Teacher</div></div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'classes' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">🏫</span> Quản lý lớp học</button>
          <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'attendance' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">📋</span> Điểm danh</button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'history' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">🕒</span> Lịch sử điểm danh</button>
          <button onClick={() => setActiveTab('sessions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'sessions' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">📅</span> Quản lý buổi học</button>
          <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'schedule' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">📆</span> Lịch giảng dạy</button>
        </nav>
        <div className="p-4 border-t border-gray-100"><button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-bold px-4 py-2 text-sm w-full">🚪 Đăng xuất</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h1 className="text-lg font-semibold text-white">Hệ thống Giảng viên</h1>
          <div className="text-white text-sm font-semibold flex items-center gap-2"><span>👨‍🏫 Chào thầy/cô: {user.name}</span></div>
        </header>
        
        <div className="bg-emerald-500 px-8 py-2 text-white/80 text-sm flex items-center shrink-0 shadow-sm">
          <span>Dashboard</span> <span className="mx-2">/</span> 
          <span className="font-semibold text-white">
            {activeTab === 'classes' ? 'Quản lý lớp học' : activeTab === 'attendance' ? 'Điểm danh' : activeTab === 'history' ? 'Lịch sử điểm danh' : activeTab === 'sessions' ? 'Quản lý buổi học' : 'Lịch giảng dạy'}
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto relative">
          
          {/* TAB 1: QUẢN LÝ LỚP HỌC */}
          {activeTab === 'classes' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span className="text-emerald-600">📅</span> Quản lý lớp học của tôi</h2>
                <div className="text-sm text-gray-500 font-semibold">Tổng số lớp: <span className="text-gray-900">{myClasses.length}</span></div>
              </div>
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-1/3"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span><input type="text" placeholder="Tìm kiếm tên lớp, phòng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-emerald-500 bg-white"/></div>
                <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} className="w-full md:w-1/4 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-600 bg-white"><option value="">Chọn ca học</option><option value="Ca 1 (07:15-09:15)">Ca 1</option><option value="Ca 2 (09:20-11:20)">Ca 2</option><option value="Ca 3 (12:00-14:00)">Ca 3</option><option value="Ca 4 (14:10-16:10)">Ca 4</option><option value="Ca 5 (16:20-18:20)">Ca 5</option><option value="Ca 6 (18:30-20:30)">Ca 6</option></select>
                {(searchQuery || shiftFilter) && (<button onClick={handleClearClassFilters} className="text-sm font-semibold text-red-500 hover:underline whitespace-nowrap">Xóa bộ lọc</button>)}
              </div>
              <div className="overflow-x-auto flex-1 min-h-[400px]">
                <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                  <thead className="text-xs text-gray-500 font-bold border-b border-gray-200 bg-gray-50">
                    <tr><th className="px-6 py-4 font-semibold">Tên lớp ↕</th><th className="px-6 py-4 font-semibold">Môn học</th><th className="px-6 py-4 font-semibold">Chuyên ngành</th><th className="px-6 py-4 font-semibold">Ca học</th><th className="px-6 py-4 font-semibold">Ngày học</th><th className="px-6 py-4 font-semibold">Phòng học</th><th className="px-6 py-4 font-semibold">Sĩ số</th><th className="px-6 py-4 font-semibold">Ngày bắt đầu ↕</th><th className="px-6 py-4 font-semibold text-center">Hành động</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedClasses.map((cls) => (
                      <tr key={cls._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{cls.name}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-xs font-semibold">{cls.subject}</span></td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-green-50 text-green-600 border border-green-100 rounded text-xs font-semibold">{cls.major}</span></td>
                        <td className="px-6 py-4 text-gray-500"><span className="px-2 py-1 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded text-xs font-semibold">{cls.shift || '-'}</span></td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold">{cls.scheduleDays?.join(', ') || cls.days || '-'}</td>
                        <td className="px-6 py-4 font-medium text-pink-600 bg-pink-50 border border-pink-100 px-2 py-1 rounded text-xs w-fit inline-block">{cls.room || '-'}</td>
                        <td className="px-6 py-4 text-gray-600 font-semibold">👤 {cls.students?.length || 0}/{cls.maxStudents || 0}</td>
                        <td className="px-6 py-4">{cls.startDate || '-'}</td>
                        <td className="px-6 py-4 flex justify-center text-sm"><button onClick={() => openClassDetail(cls)} className="text-white bg-emerald-600 px-3 py-1.5 rounded hover:bg-emerald-700 font-semibold transition-colors flex items-center gap-1 shadow-sm">👁️ Chi tiết</button></td>
                      </tr>
                    ))}
                    {displayedClasses.length === 0 && <tr><td colSpan={9} className="text-center py-20 text-gray-400">Không tìm thấy lớp học nào.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ĐIỂM DANH */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><span>📋</span> Điểm danh lớp học</h2>
                <button onClick={() => setActiveTab('history')} className="text-sm font-semibold text-gray-500 hover:text-emerald-600 flex items-center gap-1">🕒 Xem lịch sử</button>
              </div>
              <div className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lớp học (Của tôi):</label>
                  <select value={attSelectedClass} onChange={(e) => handleSelectClassForAttendance(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-emerald-500 text-gray-700 bg-white shadow-sm">
                    <option value="">Chọn lớp học...</option>
                    {myClasses.map(cls => (<option key={cls._id} value={cls._id}>{cls.name} - {cls.subject}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Buổi học / Ngày:</label>
                  <div className="flex items-center gap-2">
                    <select value={attSelectedDate} onChange={(e) => setAttSelectedDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-emerald-500 text-gray-700 bg-white shadow-sm">
                      <option value="">Chọn buổi học/Ngày...</option>
                      {upcomingDates.map((dateStr) => (<option key={dateStr} value={dateStr}>{dateStr}</option>))}
                    </select>
                    <button className="p-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-500 shadow-sm">↻</button>
                  </div>
                </div>
              </div>
              {attSelectedClass && attSelectedDate ? (
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-bold text-gray-800 text-lg">{selectedClassData?.name} - {selectedClassData?.subject} - {attSelectedDate}</div>
                    <div className="flex items-center gap-6 text-sm font-semibold mt-4 md:mt-0"><span className="text-gray-700">Tổng: {attTotalStudents}</span><span className="text-green-600">Có mặt: {attPresentCount}</span><span className="text-yellow-600">Muộn: {attLateCount}</span><span className="text-red-500">Vắng: {attAbsentCount}</span></div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">Điểm danh hàng loạt:</span>
                      <button onClick={() => handleBulkAttendance('Có mặt')} className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-1.5 rounded text-sm font-bold transition-colors">Tất cả có mặt</button>
                      <button onClick={() => handleBulkAttendance('Vắng')} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-1.5 rounded text-sm font-bold transition-colors">Tất cả vắng</button>
                      <button onClick={() => handleBulkAttendance('Muộn')} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-1.5 rounded text-sm font-bold transition-colors">Tất cả muộn</button>
                    </div>
                    <button onClick={handleSaveAttendance} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md font-bold transition-colors shadow-sm flex items-center gap-2">💾 Lưu điểm danh</button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                        <tr><th className="px-6 py-4 font-bold w-16 text-center">STT</th><th className="px-6 py-4 font-bold">Sinh viên</th><th className="px-6 py-4 font-bold text-center w-56">Trạng thái điểm danh</th><th className="px-6 py-4 font-bold w-1/3">Ghi chú</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendanceList.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-10 text-gray-500">Lớp này chưa có sinh viên nào.</td></tr>
                        ) : (
                          attendanceList.map((item, index) => {
                            const isPresent = item.status === 'Có mặt'; const isAbsent = item.status === 'Vắng';
                            return (
                              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4"><div className="font-bold text-gray-800 mb-1">{item.studentName}</div><span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${isPresent ? 'bg-green-100 text-green-700' : isAbsent ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
                                <td className="px-6 py-4 text-center">
                                  <div className="relative inline-block w-full max-w-[160px] text-left">
                                    <select value={item.status} onChange={(e) => handleStatusChange(index, e.target.value)} className={`appearance-none w-full bg-white border ${isPresent ? 'border-green-300 text-green-600 focus:ring-green-100' : isAbsent ? 'border-red-300 text-red-500 focus:ring-red-100' : 'border-yellow-300 text-yellow-600 focus:ring-yellow-100'} px-4 py-2 pr-8 rounded font-bold outline-none cursor-pointer text-sm focus:ring-4 transition-all shadow-sm`}><option value="Có mặt">✅ Có mặt</option><option value="Vắng">❌ Vắng</option><option value="Muộn">🕒 Muộn</option></select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4"><input type="text" placeholder="Ghi chú..." value={item.note} onChange={(e) => handleNoteChange(index, e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 outline-none focus:border-emerald-500 text-sm bg-transparent"/></td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50/30 m-6 rounded-lg border border-dashed border-gray-300"><span className="text-5xl mb-3">👆</span><p className="font-semibold text-gray-500 text-lg">Vui lòng chọn Lớp học và Buổi học ở trên</p><p className="text-sm">để bắt đầu điểm danh sinh viên.</p></div>
              )}
            </div>
          )}

          {/* TAB 3: LỊCH SỬ ĐIỂM DANH */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 flex justify-between items-center bg-white border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span className="text-gray-400 text-xl">🕒</span> Lịch sử điểm danh</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab('attendance')} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">← Quay lại điểm danh</button>
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">📥 Xuất Excel</button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lớp học:</label><select value={historyFilterClass} onChange={(e) => setHistoryFilterClass(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-700 bg-white"><option value="">Tất cả lớp học</option>{myClasses.map(cls => <option key={cls._id} value={cls.name}>{cls.name}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Trạng thái:</label><select value={historyFilterStatus} onChange={(e) => setHistoryFilterStatus(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-700 bg-white"><option value="">Tất cả trạng thái</option><option value="Có mặt">Có mặt</option><option value="Vắng">Vắng</option><option value="Muộn">Muộn</option></select></div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Thời gian (Từ - Đến):</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={historyStartDate} onChange={(e) => setHistoryStartDate(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-600 bg-white" title="Từ ngày"/>
                        <span className="text-gray-400">-</span>
                        <input type="date" value={historyEndDate} onChange={(e) => setHistoryEndDate(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-600 bg-white" title="Đến ngày"/>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hàng 2: Tìm kiếm và Xóa bộ lọc */}
                  <div className="flex flex-col md:flex-row items-end justify-between gap-4 border-t border-gray-100 pt-4">
                    <div className="w-full md:w-1/2">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tìm kiếm:</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400 text-sm">🔍</span></div>
                        <input type="text" placeholder="Tên sinh viên, mã SV..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-emerald-500 bg-white text-gray-700"/>
                      </div>
                    </div>
                    <button onClick={clearHistoryFilters} className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors w-fit mb-1">
                      <span className="text-lg leading-none">🗑️</span> Xóa bộ lọc
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center"><span className="text-sm font-bold text-gray-500 mb-1">Tổng điểm danh</span><span className="text-3xl font-extrabold text-emerald-600">{histTotal}</span></div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center"><span className="text-sm font-bold text-gray-500 mb-1">Có mặt</span><span className="text-3xl font-extrabold text-green-500 flex items-center gap-2"><span className="bg-green-100 rounded px-1 pb-1 text-xl">✅</span> {histPresent}</span></div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center"><span className="text-sm font-bold text-gray-500 mb-1">Muộn</span><span className="text-3xl font-extrabold text-yellow-500 flex items-center gap-2">🕒 {histLate}</span></div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center"><span className="text-sm font-bold text-gray-500 mb-1">Vắng</span><span className="text-3xl font-extrabold text-red-500 flex items-center gap-2">❌ {histAbsent}</span></div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                        <tr><th className="px-6 py-4 font-bold text-center w-16 uppercase tracking-wider">STT</th><th className="px-6 py-4 font-bold uppercase tracking-wider">Sinh viên</th><th className="px-6 py-4 font-bold uppercase tracking-wider">Lớp học</th><th className="px-6 py-4 font-bold text-center uppercase tracking-wider">Ngày học</th><th className="px-6 py-4 font-bold text-center uppercase tracking-wider">Trạng thái</th><th className="px-6 py-4 font-bold uppercase tracking-wider">Ghi chú</th><th className="px-6 py-4 font-bold text-center uppercase tracking-wider">Thời gian điểm danh</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredHistory.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-16 text-gray-400 font-medium">Chưa có dữ liệu điểm danh nào.</td></tr>
                        ) : (
                          filteredHistory.map((item, index) => {
                            const isPresent = item.status === 'Có mặt'; const isAbsent = item.status === 'Vắng';
                            const userInfo = usersData.find(u => u.name === item.studentName);
                            return (
                              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4"><div className="font-bold text-gray-800">{item.studentName}</div><div className="text-xs text-gray-400 mt-0.5">{userInfo?.username || "N/A"}</div></td>
                                <td className="px-6 py-4"><div className="font-bold text-gray-800">{item.className}</div><div className="text-xs text-gray-400 mt-0.5">{item.subjectName}</div></td>
                                <td className="px-6 py-4 text-center font-medium text-gray-600">{item.date}</td>
                                <td className="px-6 py-4 text-center"><span className={`inline-block px-3 py-1 rounded text-xs font-bold border ${isPresent ? 'bg-green-50 border-green-100 text-green-500' : isAbsent ? 'bg-red-50 border-red-100 text-red-500' : 'bg-yellow-50 border-yellow-100 text-yellow-600'}`}>{item.status}</span></td>
                                <td className="px-6 py-4 text-gray-500">{item.note}</td>
                                <td className="px-6 py-4 text-center"><div className="text-gray-700">{item.timestamp.split(' ')[0]}</div><div className="text-xs text-gray-400 mt-0.5">{item.timestamp.split(' ')[1]}</div></td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUẢN LÝ BUỔI HỌC */}
          {activeTab === 'sessions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><span className="text-emerald-600 text-2xl">📅</span> Quản lý buổi học</h2>
                <button onClick={openAddSession} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-md text-sm shadow-sm transition-colors">+ Thêm buổi học</button>
              </div>
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lớp học:</label>
                <select value={sessionSelectedClass} onChange={(e) => setSessionSelectedClass(e.target.value)} className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-emerald-500 text-gray-700 bg-white shadow-sm">
                  <option value="">Chọn lớp học...</option>{myClasses.map(c => <option key={c._id} value={c._id}>{c.name} - {c.subject}</option>)}
                </select>
              </div>
              {sessionSelectedClass && selectedSessionClassData ? (
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50/70 p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <div className="font-bold text-gray-800 text-lg mb-1">{selectedSessionClassData.name} - {selectedSessionClassData.subject}</div>
                        <div className="text-sm text-gray-500">Giảng viên: <span className="font-medium text-gray-700">{selectedSessionClassData.instructor}</span></div>
                      </div>
                      <div className="flex gap-8 text-center bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm">
                        <div><div className="text-2xl font-extrabold text-gray-800">{mergedSessionsForClass.length}</div><div className="text-xs text-gray-500 uppercase font-semibold mt-1">Tổng buổi học</div></div>
                        <div className="w-px bg-gray-200"></div>
                        <div><div className="text-2xl font-extrabold text-green-500">{sessionAttendedCount}</div><div className="text-xs text-green-600 uppercase font-semibold mt-1">Đã học</div></div>
                        <div className="w-px bg-gray-200"></div>
                        <div><div className="text-2xl font-extrabold text-emerald-600">{sessionUpcomingCount}</div><div className="text-xs text-emerald-600 uppercase font-semibold mt-1">Sắp tới</div></div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                        <thead className="bg-white border-b border-gray-200 text-gray-500 text-xs">
                          <tr><th className="px-6 py-4 font-bold text-center w-16 uppercase tracking-wider">STT</th><th className="px-6 py-4 font-bold uppercase tracking-wider">Ngày học</th><th className="px-6 py-4 font-bold uppercase tracking-wider w-1/3">Ghi chú</th><th className="px-6 py-4 font-bold uppercase tracking-wider text-center">Trạng thái điểm danh</th><th className="px-6 py-4 font-bold text-center uppercase tracking-wider">Thao tác</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {mergedSessionsForClass.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-medium">Lớp học này chưa được cấu hình ngày bắt đầu hoặc lịch học.</td></tr>
                          ) : (
                            mergedSessionsForClass.map((sess, index) => (
                              <tr key={sess.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-center font-medium text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4"><div className="font-bold text-gray-800">{sess.date}</div><div className="text-xs text-gray-400 mt-0.5 capitalize">{sess.dayOfWeek}</div></td>
                                <td className="px-6 py-4 text-gray-500">{sess.note || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`inline-block px-3 py-1.5 rounded text-xs font-bold border ${sess.status === 'Đã điểm danh' ? 'bg-white border-green-400 text-green-600' : 'bg-gray-50 border-gray-300 text-gray-500'}`}>
                                    {sess.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 flex justify-center items-center gap-4 text-lg">
                                  <button onClick={() => {
                                    const cls = myClasses.find(c => c._id === sess.classId || c._id === sessionSelectedClass);
                                    if(cls) openClassDetail(cls);
                                  }} className="text-gray-400 hover:text-gray-600 transition-colors" title="Xem chi tiết lớp học">👁️</button>
                                  <button onClick={() => openEditSession(sess)} className="text-gray-400 hover:text-emerald-600 transition-colors" title="Sửa ghi chú/trạng thái">✏️</button>
                                  {!sess.isAuto && (
                                    <button onClick={() => deleteSession(sess.id, sess.isAuto)} className="text-gray-400 hover:text-red-500 transition-colors" title="Xóa buổi bổ sung">🗑️</button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-24 text-gray-400 bg-white"><span className="text-5xl mb-4">👆</span><p className="font-semibold text-gray-500 text-lg">Vui lòng chọn Lớp học ở trên</p><p className="text-sm mt-1">để xem danh sách buổi học của lớp.</p></div>
              )}
            </div>
          )}

          {/* TAB 5: LỊCH GIẢNG DẠY */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
              
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-500 flex justify-between items-center text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">📆</span> Lịch giảng dạy
                </h2>
                <div className="flex bg-white/20 p-1 rounded-lg">
                  <button onClick={() => setScheduleViewMode('calendar')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${scheduleViewMode === 'calendar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white hover:bg-white/10'}`}>
                    📅 Lịch
                  </button>
                  <button onClick={() => setScheduleViewMode('list')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${scheduleViewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white hover:bg-white/10'}`}>
                    🗂️ Danh sách
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-200">
                <div className="text-center px-4">
                  <div className="text-2xl font-extrabold text-emerald-600 flex items-center justify-center gap-2">📚 {schedTotalClasses}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold mt-1">Lớp Đang Dạy</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-extrabold text-green-500 flex items-center justify-center gap-2">🕒 {schedTotalSessions}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold mt-1">Tổng Số Buổi</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-extrabold text-purple-500 flex items-center justify-center gap-2">📝 {schedTotalSubjects}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold mt-1">Môn Học</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-extrabold text-orange-500 flex items-center justify-center gap-2">👤 {schedTotalStudents}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold mt-1">Sinh Viên</div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-white">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
                  <div className="flex gap-4 w-full md:w-auto">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Khoảng thời gian:</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={scheduleStartDate} onChange={(e) => setScheduleStartDate(e.target.value)} className="w-40 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-600 bg-white"/>
                        <span className="text-gray-400">→</span>
                        <input type="date" value={scheduleEndDate} onChange={(e) => setScheduleEndDate(e.target.value)} className="w-40 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-600 bg-white"/>
                      </div>
                    </div>
                    <div className="w-64">
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Môn học:</label>
                      <select value={scheduleSubject} onChange={(e) => setScheduleSubject(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 text-gray-700 bg-white">
                        <option value="">Tất cả môn học</option>
                        {uniqueSubjects.map((sub, idx) => <option key={idx} value={sub}>{sub}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={clearScheduleFilters} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors h-10 px-4 border border-transparent hover:border-red-100 rounded-md">Xóa bộ lọc</button>
                </div>

                {scheduleViewMode === 'calendar' ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span> Ca Sáng (1-2)</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> Ca Chiều (3-4)</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-400 inline-block"></span> Ca Tối (5-6)</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={handleToday} className="px-4 py-1.5 text-sm font-bold text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors">Hôm nay</button>
                        <div className="flex items-center gap-2 border border-gray-300 rounded overflow-hidden">
                          <button onClick={handlePrevMonth} className="px-3 py-1.5 hover:bg-gray-100 font-bold text-gray-600 transition-colors">&lt;</button>
                          <span className="px-4 py-1.5 font-bold text-emerald-600 bg-white min-w-[120px] text-center border-x border-gray-300">
                            {monthNames[currentMonth]} {currentYear}
                          </span>
                          <button onClick={handleNextMonth} className="px-3 py-1.5 hover:bg-gray-100 font-bold text-gray-600 transition-colors">&gt;</button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 bg-gray-200 gap-px border-b border-gray-200">
                      {dayNames.map(day => (<div key={day} className="bg-white py-3 text-center text-xs font-extrabold text-gray-500 uppercase tracking-wider">{day}</div>))}
                      {Array.from({ length: firstDay }).map((_, idx) => (<div key={`empty-${idx}`} className="bg-gray-50 min-h-[120px]"></div>))}
                      {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = `${String(dayNum).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
                        const sessionsOnThisDay = filteredScheduleSessions.filter(s => s.date === dateStr);
                        const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                        return (
                          <div key={dayNum} className={`bg-white min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-emerald-50/30 ${isToday ? 'ring-2 ring-inset ring-emerald-500 bg-emerald-50/10' : ''}`}>
                            <div className={`text-right text-xs font-bold mb-1 ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>{dayNum}</div>
                            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                              {sessionsOnThisDay.map((sess, sIdx) => {
                                let colorClass = "border-gray-400 bg-gray-50 text-gray-700";
                                if (sess.shift?.includes("Ca 1") || sess.shift?.includes("Ca 2")) colorClass = "border-green-400 bg-green-50 text-green-800";
                                else if (sess.shift?.includes("Ca 3") || sess.shift?.includes("Ca 4")) colorClass = "border-blue-400 bg-blue-50 text-blue-800";
                                else if (sess.shift?.includes("Ca 5") || sess.shift?.includes("Ca 6")) colorClass = "border-purple-400 bg-purple-50 text-purple-800";

                                return (
                                  <div key={sIdx} onClick={() => handleJumpToAttendance(sess)} className={`border-l-4 rounded-r px-2 py-1.5 text-[10px] leading-tight cursor-pointer hover:opacity-80 transition-opacity shadow-sm ${colorClass}`} title={`Bấm để Điểm danh lớp ${sess.className}`}>
                                    <div className="font-bold truncate">{sess.className}</div>
                                    <div className="truncate opacity-80">{sess.subject}</div>
                                    <div className="mt-0.5 font-semibold flex justify-between"><span>{sess.room || 'N/A'}</span><span>{sess.shift ? sess.shift.split(' ')[0] : ''}</span></div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      })}
                      {Array.from({ length: (7 - ((firstDay + daysInCurrentMonth) % 7)) % 7 }).map((_, idx) => (<div key={`empty-end-${idx}`} className="bg-gray-50 min-h-[120px]"></div>))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                          <tr>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider">Ngày giảng dạy</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider">Thời gian</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider">Lớp học & Ca học</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider">Môn học</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider">Ghi chú</th>
                            <th className="px-6 py-4 font-bold text-center uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sortedScheduleSessions.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-16 text-gray-400 font-medium">Không tìm thấy lịch giảng dạy nào trong khoảng thời gian này.</td></tr>
                          ) : (
                            sortedScheduleSessions.map((sess, index) => (
                              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-gray-800">{sess.date}</div>
                                  <div className="text-xs text-gray-500 mt-0.5 capitalize">{sess.dayOfWeek}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-600">
                                  <div className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md inline-flex items-center gap-1 text-xs font-semibold">
                                    🕒 {extractTimeFromShift(sess.shift)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-bold text-gray-800 flex items-center gap-2">🏫 {sess.className}</div>
                                  <div className="mt-1"><span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{extractCaFromShift(sess.shift)}</span></div>
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-700">{sess.subject}</td>
                                <td className="px-6 py-4 text-gray-500">{sess.note !== '-' ? sess.note : 'Không có'}</td>
                                <td className="px-6 py-4 flex justify-center items-center gap-4">
                                  <button onClick={() => {
                                      const cls = myClasses.find(c => c._id === sess.classId);
                                      if (cls) openClassDetail(cls);
                                    }} 
                                    className="text-gray-400 hover:text-gray-600 transition-colors text-lg" title="Xem chi tiết lớp học"
                                  >
                                    👁️
                                  </button>
                                  <button onClick={() => handleJumpToAttendance(sess)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md font-bold text-xs shadow-sm transition-colors flex items-center gap-1">
                                    ✓ Điểm danh
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= CÁC MODAL QUẢN LÝ (ẨN TRONG GIAO DIỆN) ================= */}
      
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">{isSessionEdit ? "Sửa Buổi học" : "Thêm Buổi học"}</h3>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSessionSubmit} className="p-6 space-y-5 text-sm">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">* Ngày học</label>
                <input type="date" required value={sessionForm.dateInput} onChange={handleDateChange} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500 text-gray-600" disabled={!isSessionEdit && editSessionId !== null}/>
                {sessionForm.dayOfWeek && <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">📅 Rơi vào: {sessionForm.dayOfWeek}</div>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Ghi chú</label>
                <textarea placeholder="Nội dung buổi học, bài tập..." rows={3} value={sessionForm.note} onChange={e => setSessionForm({...sessionForm, note: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500"/>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">* Trạng thái điểm danh</label>
                <select value={sessionForm.status} onChange={e => setSessionForm({...sessionForm, status: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500">
                  <option value="Chưa điểm danh">Chưa điểm danh</option>
                  <option value="Đã điểm danh">Đã điểm danh</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsSessionModalOpen(false)} className="px-6 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50">Huỷ</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold transition-colors">Lưu buổi học</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isClassDetailModalOpen && selectedClassDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[90vh]"><div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50"><h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">📄 Chi tiết lớp học</h3><button onClick={() => setIsClassDetailModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button></div><div className="p-8 overflow-y-auto"><h2 className="text-3xl font-bold text-emerald-600 mb-6">{selectedClassDetail.name}</h2><div className="grid grid-cols-2 gap-y-4 gap-x-12 text-sm mb-8"><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Môn học</span><span className="font-semibold text-gray-800">{selectedClassDetail.subject}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Chuyên ngành</span><span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-xs font-bold">{selectedClassDetail.major}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Giáo viên</span><span className="font-semibold text-gray-800 flex items-center gap-1">👤 {selectedClassDetail.instructor}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ca học</span><span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-xs font-bold">{selectedClassDetail.shift || '-'}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ngày học</span><span className="font-bold text-green-600 flex items-center gap-1">📅 {selectedClassDetail.scheduleDays?.join(', ') || selectedClassDetail.days || '-'}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Phòng học</span><span className="px-2 py-1 bg-pink-100 text-pink-700 border border-pink-200 rounded text-xs font-bold">{selectedClassDetail.room || '-'}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ngày bắt đầu</span><span className="font-semibold text-gray-800 flex items-center gap-1">📅 {selectedClassDetail.startDate || '-'}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Số buổi học</span><span className="px-2 py-1 bg-cyan-100 text-cyan-700 border border-cyan-200 rounded text-xs font-bold">{selectedClassDetail.totalSessions || 0} buổi</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Sĩ số</span><span className="font-bold text-emerald-600">{selectedClassDetail.students?.length || 0} / {selectedClassDetail.maxStudents || 0} sinh viên</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Trạng thái</span><span className={`px-2 py-1 rounded text-xs font-bold ${selectedClassDetail.status === 'Hoạt động' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{selectedClassDetail.status}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ngày tạo</span><span className="text-gray-600 font-medium">{formatDate(selectedClassDetail.createdAt)}</span></div><div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Cập nhật lần cuối</span><span className="text-gray-600 font-medium">{formatDate(selectedClassDetail.updatedAt)}</span></div></div><div className="mb-8"><h4 className="font-bold text-gray-800 mb-2">Mô tả</h4><div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-sm">{selectedClassDetail.description || "Không có mô tả."}</div></div><div><h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">Danh sách sinh viên ({selectedClassDetail.students?.length || 0})</h4><div className="border border-gray-200 rounded-lg overflow-hidden"><div className="max-h-60 overflow-y-auto">{(!selectedClassDetail.students || selectedClassDetail.students.length === 0) ? (<div className="p-4 text-center text-gray-500 text-sm bg-gray-50">Lớp học chưa có sinh viên nào.</div>) : (<ul className="divide-y divide-gray-100">{selectedClassDetail.students.map((studentName: string, index: number) => {const studentInfo = usersData.find(u => u.name === studentName); return (<li key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"><div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">👤</div><div><div className="font-bold text-gray-800 text-sm"><span className="text-gray-400 font-normal mr-1">{index + 1}.</span> {studentName} {studentInfo?.username && <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">{studentInfo.username}</span>}</div><div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">✉️ {studentInfo?.email || "N/A"}</div></div></li>);})}</ul>)}</div></div></div></div></div></div>
      )}

    </div>
  );
}