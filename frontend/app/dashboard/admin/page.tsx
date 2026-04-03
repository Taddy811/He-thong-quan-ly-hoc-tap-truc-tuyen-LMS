"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("classes");

  // ================= STATE DỮ LIỆU =================
  const [usersData, setUsersData] = useState<any[]>([]);
  const [majorsData, setMajorsData] = useState<any[]>([]);
  const [subjectsData, setSubjectsData] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);

  // ================= STATE MODAL =================
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState<any>(null);

  const [isUserEdit, setIsUserEdit] = useState(false);
  const [isMajorEdit, setIsMajorEdit] = useState(false);
  const [isSubjectEdit, setIsSubjectEdit] = useState(false);
  const [isClassEdit, setIsClassEdit] = useState(false);

  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editMajorId, setEditMajorId] = useState<string | null>(null);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [editClassId, setEditClassId] = useState<string | null>(null);

  // ================= STATE TÌM KIẾM CƠ BẢN =================
  const [userSearch, setUserSearch] = useState("");
  const [majorSearch, setMajorSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");

  // ================= STATE BỘ LỌC LỚP HỌC (MỚI) =================
  const [classSearch, setClassSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // ================= STATE FORM =================
  const [userForm, setUserForm] = useState({ role: "student", major: "", name: "", email: "", phone: "" });
  const [majorForm, setMajorForm] = useState({ code: "", name: "", description: "", status: "Hoạt động" });
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", description: "", status: "Hoạt động" });
  
  const [classForm, setClassForm] = useState({ 
    name: "", subject: "", major: "", instructor: "", startDate: "", shift: "", 
    totalSessions: "", maxStudents: "", room: "", scheduleDays: [] as string[], 
    students: [] as string[], onlineLink: "", description: "", status: "Hoạt động" 
  });
  const [studentInput, setStudentInput] = useState("");

  // ================= FETCH DỮ LIỆU =================
  const fetchUsers = async () => { const res = await fetch("/api/auth/users"); if(res.ok) setUsersData(await res.json()); };
  const fetchMajors = async () => { const res = await fetch("/api/majors"); if(res.ok) setMajorsData(await res.json()); };
  const fetchSubjects = async () => { const res = await fetch("/api/subjects"); if(res.ok) setSubjectsData(await res.json()); };
  const fetchClasses = async () => { const res = await fetch("/api/classes"); if(res.ok) setClassesData(await res.json()); };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) router.push("/login");
    else { setUser(JSON.parse(userData)); fetchUsers(); fetchMajors(); fetchSubjects(); fetchClasses(); }
  }, []);

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/login"); };

  // ================= HANDLERS LỚP HỌC =================
  const toggleDay = (day: string) => {
    const currentDays = [...classForm.scheduleDays];
    if (currentDays.includes(day)) setClassForm({ ...classForm, scheduleDays: currentDays.filter(d => d !== day) });
    else setClassForm({ ...classForm, scheduleDays: [...currentDays, day] });
  };

  const handleAddStudent = (e: any) => {
    e.preventDefault();
    if (studentInput.trim() !== "" && !classForm.students.includes(studentInput.trim())) {
      setClassForm({ ...classForm, students: [...classForm.students, studentInput.trim()] });
      setStudentInput("");
    }
  };

  const handleSelectStudentFromDropdown = (studentName: string) => {
    if (!classForm.students.includes(studentName)) {
      setClassForm({ ...classForm, students: [...classForm.students, studentName] });
    }
    setStudentSearchInput("");
    setShowStudentDropdown(false);
  };

  const removeStudent = (index: number) => {
    const newStudents = [...classForm.students]; newStudents.splice(index, 1); setClassForm({ ...classForm, students: newStudents });
  };

  const handleClassSubmit = async (e: any) => {
    e.preventDefault();
    try {
      let url = "/api/classes", method = "POST";
      if (isClassEdit && editClassId) { url = `/api/classes/${editClassId}`; method = "PUT"; }
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(classForm) });
      if (res.ok) { alert("Thành công!"); setIsClassModalOpen(false); fetchClasses(); } else alert("Lỗi!");
    } catch (error) { alert("Lỗi mạng!"); }
  };
  
  const deleteClass = async (id: string, name: string) => { if (confirm(`Xoá lớp "${name}"?`)) { await fetch(`/api/classes/${id}`, { method: "DELETE" }); fetchClasses(); } };
  
  const openClassAdd = () => {
    setIsClassEdit(false); setEditClassId(null);
    setClassForm({ name: "", subject: "", major: "", instructor: "", startDate: "", shift: "", totalSessions: "", maxStudents: "", room: "", scheduleDays: [], students: [], onlineLink: "", description: "", status: "Hoạt động" });
    setIsClassModalOpen(true);
  };
  
  const openClassEdit = (cls: any) => { 
    setIsClassEdit(true); setEditClassId(cls._id); 
    setClassForm({ ...cls, scheduleDays: cls.scheduleDays || [], students: cls.students || [] }); 
    setIsClassModalOpen(true); 
  };

  const openClassDetail = (cls: any) => { setSelectedClassDetail(cls); setIsClassDetailModalOpen(true); };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ================= CÁC HANDLER KHÁC =================
  const handleUserSubmit = async (e: any) => { e.preventDefault(); try { const payload: any = { ...userForm, major: userForm.role === "student" ? userForm.major : "", username: userForm.email.split('@')[0] }; let url = "/api/auth/register", method = "POST"; if (isUserEdit && editUserId) { url = `/api/auth/users/${editUserId}`; method = "PUT"; } else { payload.password = "123456"; } const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); if (res.ok) { alert("Thành công!"); setIsUserModalOpen(false); fetchUsers(); } } catch (error) {} };
  const deleteUser = async (id: string, name: string) => { if (confirm(`Xoá "${name}"?`)) { await fetch(`/api/auth/users/${id}`, { method: "DELETE" }); fetchUsers(); } };
  const openUserEdit = (usr: any) => { setIsUserEdit(true); setEditUserId(usr._id); setUserForm({ role: usr.role, major: usr.major || "", name: usr.name, email: usr.email, phone: usr.phone || "" }); setIsUserModalOpen(true); };
  const handleMajorSubmit = async (e: any) => { e.preventDefault(); try { let url = "/api/majors", method = "POST"; if (isMajorEdit && editMajorId) { url = `/api/majors/${editMajorId}`; method = "PUT"; } const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(majorForm) }); if (res.ok) { alert("Thành công!"); setIsMajorModalOpen(false); fetchMajors(); } } catch (error) {} };
  const deleteMajor = async (id: string, name: string) => { if (confirm(`Xoá "${name}"?`)) { await fetch(`/api/majors/${id}`, { method: "DELETE" }); fetchMajors(); } };
  const openMajorEdit = (major: any) => { setIsMajorEdit(true); setEditMajorId(major._id); setMajorForm({ code: major.code, name: major.name, description: major.description || "", status: major.status }); setIsMajorModalOpen(true); };
  const handleSubjectSubmit = async (e: any) => { e.preventDefault(); try { let url = "/api/subjects", method = "POST"; if (isSubjectEdit && editSubjectId) { url = `/api/subjects/${editSubjectId}`; method = "PUT"; } const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(subjectForm) }); if (res.ok) { alert("Thành công!"); setIsSubjectModalOpen(false); fetchSubjects(); } } catch (error) {} };
  const deleteSubject = async (id: string, name: string) => { if (confirm(`Xoá môn "${name}"?`)) { await fetch(`/api/subjects/${id}`, { method: "DELETE" }); fetchSubjects(); } };
  const openSubjectEdit = (sub: any) => { setIsSubjectEdit(true); setEditSubjectId(sub._id); setSubjectForm({ code: sub.code, name: sub.name, description: sub.description || "", status: sub.status }); setIsSubjectModalOpen(true); };

  if (!user) return <div className="p-10 text-center">Đang tải...</div>;

  // LỌC DỮ LIỆU TÌM KIẾM BẢNG KHÁC
  const filteredUsers = usersData.filter(u => (u.name+u.email+u.phone).toLowerCase().includes(userSearch.toLowerCase()));
  const filteredMajors = majorsData.filter(m => (m.name+m.code).toLowerCase().includes(majorSearch.toLowerCase()));
  const filteredSubjects = subjectsData.filter(s => (s.name+s.code).toLowerCase().includes(subjectSearch.toLowerCase()));
  
  // ================= LOGIC LỌC LỚP HỌC (ĐA TIÊU CHÍ) =================
  const filteredClasses = classesData.filter(c => {
    const matchText = (c.name + c.subject + c.instructor + c.room + (c.description||"")).toLowerCase().includes(classSearch.toLowerCase());
    const matchSubject = filterSubject === "" || c.subject === filterSubject;
    const matchMajor = filterMajor === "" || c.major === filterMajor;
    const matchInstructor = filterInstructor === "" || c.instructor === filterInstructor;
    const matchShift = filterShift === "" || c.shift === filterShift;
    const matchStatus = filterStatus === "" || c.status === filterStatus;
    
    return matchText && matchSubject && matchMajor && matchInstructor && matchShift && matchStatus;
  });

  // Hỗ trợ xóa lọc nhanh
  const clearClassFilters = () => {
    setClassSearch(""); setFilterSubject(""); setFilterMajor(""); setFilterInstructor(""); setFilterShift(""); setFilterStatus("");
  };

  const instructors = usersData.filter(u => u.role === 'instructor');
  const studentsList = usersData.filter(u => u.role === 'student');

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans text-gray-800">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-[260px] bg-white hidden md:flex flex-col shadow-sm z-10 shrink-0 border-r border-gray-100">
        <div className="h-16 flex items-center px-6 border-b border-gray-100"><div className="text-xl font-extrabold text-[#1e293b]">Hệ Thống Quản Lý</div></div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'users' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">👥</span> Quản lý người dùng</button>
          <button onClick={() => setActiveTab('majors')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'majors' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">📚</span> Quản lý chuyên ngành</button>
          <button onClick={() => setActiveTab('subjects')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'subjects' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">📝</span> Quản lý môn học</button>
          <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all border-l-4 ${activeTab === 'classes' ? 'bg-emerald-50 text-emerald-600 border-emerald-600' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}><span className="text-sm">🏫</span> Quản lý lớp học</button>
        </nav>
        <div className="p-4 border-t border-gray-100"><button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-bold px-4 py-2 text-sm w-full">🚪 Đăng xuất</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h1 className="text-lg font-semibold text-white">Quản trị hệ thống</h1>
          <div className="text-white text-sm font-semibold flex items-center gap-2"><span>🛡️ Admin: {user.name}</span></div>
        </header>

        <div className="bg-emerald-500 px-8 py-2 text-white/80 text-sm flex items-center shrink-0 shadow-sm">
          <span>Dashboard</span> <span className="mx-2">/</span> 
          <span className="font-semibold text-white">{activeTab === 'users' ? 'Người dùng' : activeTab === 'majors' ? 'Chuyên ngành' : activeTab === 'subjects' ? 'Môn học' : activeTab === 'classes' ? 'Lớp học' : 'Các mục khác'}</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
            
            {/* ================= TAB LỚP HỌC (ĐÃ THÊM FILTER BỘ LỌC) ================= */}
            {activeTab === 'classes' && (
              <>
                <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                  {/* Hàng trên cùng: Tiêu đề và Nút Thêm */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Quản lý lớp học</h2>
                    <button onClick={openClassAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md text-sm shrink-0 transition-colors">Thêm lớp học</button>
                  </div>
                  
                  {/* Hàng thứ 2: Bộ lọc (Filters) */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Input Tìm kiếm có nút */}
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shrink-0 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên lớp, mô tả..." 
                        value={classSearch} 
                        onChange={(e) => setClassSearch(e.target.value)} 
                        className="px-3 py-2 text-sm outline-none w-64 text-gray-700"
                      />
                      <button className="px-3 py-2 bg-gray-50 border-l border-gray-300 hover:bg-gray-100 text-gray-500">
                        🔍
                      </button>
                    </div>

                    {/* Lọc Môn học */}
                    <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-600 bg-white">
                      <option value="">Chọn môn học</option>
                      {subjectsData.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>

                    {/* Lọc Chuyên ngành */}
                    <select value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-600 bg-white">
                      <option value="">Chọn chuyên ngành</option>
                      {majorsData.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                    </select>

                    {/* Lọc Giáo viên */}
                    <select value={filterInstructor} onChange={(e) => setFilterInstructor(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-600 bg-white">
                      <option value="">Chọn giáo viên</option>
                      {instructors.map(i => <option key={i._id} value={i.name}>{i.name}</option>)}
                    </select>

                    {/* Lọc Ca học */}
                    <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-600 bg-white">
                      <option value="">Chọn ca học</option>
                      <option value="Ca 1 (07:15-09:15)">Ca 1</option>
                      <option value="Ca 2 (09:20-11:20)">Ca 2</option>
                      <option value="Ca 3 (12:00-14:00)">Ca 3</option>
                      <option value="Ca 4 (14:10-16:10)">Ca 4</option>
                      <option value="Ca 5 (16:20-18:20)">Ca 5</option>
                      <option value="Ca 6 (18:30-20:30)">Ca 6</option>
                    </select>

                    {/* Lọc Trạng thái */}
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-600 bg-white">
                      <option value="">Trạng thái</option>
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Đã xoá">Đã xoá</option>
                    </select>

                    {/* Nút Xóa bộ lọc (Chỉ hiện khi có chọn lọc) */}
                    {(classSearch || filterSubject || filterMajor || filterInstructor || filterShift || filterStatus) && (
                      <button onClick={clearClassFilters} className="text-sm font-semibold text-red-500 hover:underline">
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                    <thead className="text-xs text-gray-900 font-bold bg-gray-50 border-b border-gray-200">
                      <tr><th className="px-4 py-4">Tên lớp</th><th className="px-4 py-4">Môn học</th><th className="px-4 py-4">Chuyên ngành</th><th className="px-4 py-4">Giáo viên</th><th className="px-4 py-4">Ngày bắt đầu</th><th className="px-4 py-4">Trạng thái</th><th className="px-4 py-4 text-center">Hành động</th></tr>
                    </thead>
                    <tbody>
                      {filteredClasses.map((cls) => (
                        <tr key={cls._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-bold text-gray-900">{cls.name}</td>
                          <td className="px-4 py-4">{cls.subject}</td>
                          <td className="px-4 py-4 text-gray-600">{cls.major}</td>
                          <td className="px-4 py-4 font-semibold text-emerald-600">{cls.instructor}</td>
                          <td className="px-4 py-4">{cls.startDate || '-'}</td>
                          <td className="px-4 py-4"><span className={`px-2 py-1 border rounded text-xs font-semibold ${cls.status === 'Hoạt động' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200'}`}>{cls.status}</span></td>
                          <td className="px-4 py-4 flex justify-center gap-3 text-sm">
                            <button onClick={() => openClassDetail(cls)} className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">👁️ Chi tiết</button>
                            <button onClick={() => openClassEdit(cls)} className="text-gray-500 hover:text-emerald-600 font-semibold flex items-center gap-1">✏️ Sửa</button>
                            <button onClick={() => deleteClass(cls._id, cls.name)} className="text-red-500 font-semibold flex items-center gap-1">🗑️ Xoá</button>
                          </td>
                        </tr>
                      ))}
                      {filteredClasses.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-500">Chưa có dữ liệu phù hợp với bộ lọc.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB: NGƯỜI DÙNG */}
            {activeTab === 'users' && (
              <>
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-800">Quản lý người dùng</h2>
                  <div className="flex items-center gap-4">
                    <input type="text" placeholder="Tìm kiếm người dùng..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-64 px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-emerald-500"/>
                    <button onClick={() => { setIsUserEdit(false); setUserForm({ role: "student", major: "", name: "", email: "", phone: "" }); setIsUserModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md text-sm shrink-0 transition-colors">Thêm người dùng</button>
                  </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                    <thead className="text-xs text-gray-900 font-bold bg-gray-50 border-b border-gray-200">
                      <tr><th className="px-6 py-4">Mã</th><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">SĐT</th><th className="px-6 py-4">Vai trò</th><th className="px-6 py-4 text-center">Hành động</th></tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((usr) => (
                        <tr key={usr._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-600">CF{usr._id.substring(18, 24).toUpperCase()}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">{usr.name}</td>
                          <td className="px-6 py-4">{usr.email}</td>
                          <td className="px-6 py-4">{usr.phone || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 border rounded text-xs font-semibold ${usr.role === 'admin' ? 'text-red-600 bg-red-50 border-red-200' : usr.role === 'instructor' ? 'text-teal-600 bg-teal-50 border-teal-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>{usr.role === 'admin' ? 'Admin' : usr.role === 'instructor' ? 'Giảng viên' : 'Học sinh'}</span>
                          </td>
                          <td className="px-6 py-4 flex justify-center gap-4 text-lg">
                            <button onClick={() => openUserEdit(usr)} className="text-gray-400 hover:text-emerald-600">✏️</button>
                            {user.id !== usr._id && <button onClick={() => deleteUser(usr._id, usr.name)} className="text-gray-400 hover:text-red-500">🗑️</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB: CHUYÊN NGÀNH */}
            {activeTab === 'majors' && (
              <>
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-800">Quản lý chuyên ngành</h2>
                  <div className="flex items-center gap-4">
                    <input type="text" placeholder="Tìm kiếm chuyên ngành..." value={majorSearch} onChange={(e) => setMajorSearch(e.target.value)} className="w-64 px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-emerald-500"/>
                    <button onClick={() => { setIsMajorEdit(false); setMajorForm({ code: "", name: "", description: "", status: "Hoạt động" }); setIsMajorModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md text-sm shrink-0 transition-colors">Thêm chuyên ngành</button>
                  </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                    <thead className="text-xs text-gray-900 font-bold bg-gray-50 border-b border-gray-200">
                      <tr><th className="px-6 py-4">Mã ↕</th><th className="px-6 py-4">Tên chuyên ngành ↕</th><th className="px-6 py-4 w-1/3">Mô tả chi tiết</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Hành động</th></tr>
                    </thead>
                    <tbody>
                      {filteredMajors.map((mjr) => (
                        <tr key={mjr._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{mjr.code}</td>
                          <td className="px-6 py-4">{mjr.name}</td>
                          <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{mjr.description || '-'}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 border rounded text-xs font-semibold ${mjr.status === 'Hoạt động' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200'}`}>{mjr.status}</span></td>
                          <td className="px-6 py-4 flex gap-4 justify-end text-lg">
                            <button onClick={() => openMajorEdit(mjr)} className="text-gray-400 hover:text-emerald-600">✏️</button>
                            <button onClick={() => deleteMajor(mjr._id, mjr.name)} className="text-gray-400 hover:text-red-500">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB: MÔN HỌC */}
            {activeTab === 'subjects' && (
              <>
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-800">Quản lý môn học</h2>
                  <div className="flex items-center gap-4">
                    <input type="text" placeholder="Tìm kiếm môn học..." value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} className="w-64 px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-emerald-500"/>
                    <button onClick={() => { setIsSubjectEdit(false); setSubjectForm({ code: "", name: "", description: "", status: "Hoạt động" }); setIsSubjectModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md text-sm shrink-0 transition-colors">Thêm môn học</button>
                  </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                    <thead className="text-xs text-gray-900 font-bold bg-gray-50 border-b border-gray-200">
                      <tr><th className="px-6 py-4">Mã ↕</th><th className="px-6 py-4">Tên môn học ↕</th><th className="px-6 py-4 w-1/3">Mô tả</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Hành động</th></tr>
                    </thead>
                    <tbody>
                      {filteredSubjects.map((sub) => (
                        <tr key={sub._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{sub.code}</td>
                          <td className="px-6 py-4 font-semibold text-gray-700">{sub.name}</td>
                          <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{sub.description || '-'}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 border rounded text-xs font-semibold ${sub.status === 'Hoạt động' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200'}`}>{sub.status}</span></td>
                          <td className="px-6 py-4 flex gap-4 justify-end text-lg">
                            <button onClick={() => openSubjectEdit(sub)} className="text-gray-400 hover:text-emerald-600">✏️</button>
                            <button onClick={() => deleteSubject(sub._id, sub.name)} className="text-gray-400 hover:text-red-500">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ================= MODAL LỚP HỌC (THÊM / SỬA) ================= */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">{isClassEdit ? "Cập nhật Lớp học" : "Thêm lớp học"}</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
            </div>
            
            <form id="classForm" onSubmit={handleClassSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-gray-700 font-semibold mb-1">* Tên lớp học</label><input type="text" placeholder="Nhập tên lớp học" required value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value.toUpperCase()})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none uppercase focus:border-emerald-500" disabled={isClassEdit}/></div>
                <div><label className="block text-gray-700 font-semibold mb-1">* Môn học</label><select required value={classForm.subject} onChange={e => setClassForm({...classForm, subject: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500 text-gray-600"><option value="">Chọn môn học</option>{subjectsData.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-gray-700 font-semibold mb-1">* Chuyên ngành</label><select required value={classForm.major} onChange={e => setClassForm({...classForm, major: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500 text-gray-600"><option value="">Chọn chuyên ngành</option>{majorsData.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}</select></div>
                <div><label className="block text-gray-700 font-semibold mb-1">* Giáo viên</label><select required value={classForm.instructor} onChange={e => setClassForm({...classForm, instructor: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500 text-gray-600"><option value="">Chọn giáo viên</option>{instructors.map(i => <option key={i._id} value={i.name}>{i.name}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-gray-700 font-semibold mb-1">* Ngày bắt đầu</label><input type="date" required value={classForm.startDate} onChange={e => setClassForm({...classForm, startDate: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500 text-gray-600"/></div>
                <div><label className="block text-gray-700 font-semibold mb-1">* Ca học</label>
                  <select required value={classForm.shift} onChange={e => setClassForm({...classForm, shift: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500 text-gray-600">
                    <option value="">Chọn ca học</option><option value="Ca 1 (07:15-09:15)">Ca 1 (07:15-09:15)</option><option value="Ca 2 (09:20-11:20)">Ca 2 (09:20-11:20)</option><option value="Ca 3 (12:00-14:00)">Ca 3 (12:00-14:00)</option><option value="Ca 4 (14:10-16:10)">Ca 4 (14:10-16:10)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div><label className="block text-gray-700 font-semibold mb-1">* Số buổi học</label><input type="number" placeholder="15" value={classForm.totalSessions} onChange={e => setClassForm({...classForm, totalSessions: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500"/></div>
                <div><label className="block text-gray-700 font-semibold mb-1">* Sĩ số tối đa</label><input type="number" placeholder="30" value={classForm.maxStudents} onChange={e => setClassForm({...classForm, maxStudents: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500"/></div>
                <div><label className="block text-gray-700 font-semibold mb-1">* Phòng học</label><input type="text" placeholder="B201" value={classForm.room} onChange={e => setClassForm({...classForm, room: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500"/></div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">* Ngày học trong tuần</label>
                <div className="flex flex-wrap gap-4">
                  {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
                    <label key={day} className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900"><input type="checkbox" checked={classForm.scheduleDays.includes(day)} onChange={() => toggleDay(day)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"/><span>{day}</span></label>
                  ))}
                </div>
              </div>
              
              {/* CHỌN SINH VIÊN (DROPDOWN) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Sinh viên tham gia (tùy chọn) ⓘ</label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30 relative">
                  <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold bg-emerald-50 w-fit px-3 py-1.5 rounded-md border border-emerald-100"><span>👤 Sinh viên:</span><span>{classForm.students.length}/{classForm.maxStudents || 0}</span></div>
                  <div className="flex gap-3 mb-3 relative z-0">
                    <button type="button" onClick={handleAddStudent} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-md transition-colors whitespace-nowrap">+ Thêm</button>
                  </div>
                  <div className="relative mb-3">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                    <input type="text" placeholder="Tìm và chọn sinh viên..." value={studentSearchInput} onChange={(e) => { setStudentSearchInput(e.target.value); setShowStudentDropdown(true); }} onFocus={() => setShowStudentDropdown(true)} onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)} className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none bg-white focus:border-emerald-500"/>
                    {showStudentDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {studentsList.filter(s => s.name.toLowerCase().includes(studentSearchInput.toLowerCase()) || (s.username && s.username.toLowerCase().includes(studentSearchInput.toLowerCase()))).map(stu => (
                            <div key={stu._id} className="px-3 py-2.5 cursor-pointer hover:bg-emerald-50 border-b border-gray-50 flex justify-between items-center transition-colors" onClick={() => handleSelectStudentFromDropdown(stu.name)}>
                              <span className="font-semibold text-gray-800">{stu.name}</span><span className="text-xs text-gray-400">{stu.username || stu.email}</span>
                            </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {classForm.students.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {classForm.students.map((stu, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm">{stu} <button type="button" onClick={() => removeStudent(index)} className="text-red-500 hover:text-red-700 text-base leading-none">&times;</button></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div><label className="block text-gray-700 font-semibold mb-1">Link học online (tùy chọn)</label><input type="text" placeholder="Nhập link học online" value={classForm.onlineLink} onChange={e => setClassForm({...classForm, onlineLink: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500"/></div>
              <div><label className="block text-gray-700 font-semibold mb-1">Mô tả</label><textarea placeholder="Nhập mô tả lớp học" rows={3} value={classForm.description} onChange={e => setClassForm({...classForm, description: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-emerald-500"/><div className="text-right text-xs text-gray-400 mt-1">0/500</div></div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-6 py-2.5 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50">Huỷ</button>
                <button type="submit" form="classForm" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold transition-colors">{isClassEdit ? "Cập nhật" : "Thêm mới"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CHI TIẾT LỚP HỌC ================= */}
      {isClassDetailModalOpen && selectedClassDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in duration-200 max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">📄 Chi tiết lớp học</h3>
              <button onClick={() => setIsClassDetailModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <h2 className="text-3xl font-bold text-emerald-600 mb-6">{selectedClassDetail.name}</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-sm mb-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Môn học</span><span className="font-semibold text-gray-800">{selectedClassDetail.subject}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Chuyên ngành</span><span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-xs font-bold">{selectedClassDetail.major}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Giáo viên</span><span className="font-semibold text-gray-800 flex items-center gap-1">👤 {selectedClassDetail.instructor}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ca học</span><span className="px-2 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-xs font-bold">{selectedClassDetail.shift || '-'}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ngày học</span><span className="font-bold text-green-600 flex items-center gap-1">📅 {selectedClassDetail.scheduleDays?.join(', ') || selectedClassDetail.days || '-'}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Phòng học</span><span className="px-2 py-1 bg-pink-100 text-pink-700 border border-pink-200 rounded text-xs font-bold">{selectedClassDetail.room || '-'}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ngày bắt đầu</span><span className="font-semibold text-gray-800 flex items-center gap-1">📅 {selectedClassDetail.startDate || '-'}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Số buổi học</span><span className="px-2 py-1 bg-cyan-100 text-cyan-700 border border-cyan-200 rounded text-xs font-bold">{selectedClassDetail.totalSessions || 0} buổi</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Sĩ số</span><span className="font-bold text-emerald-600">{selectedClassDetail.students?.length || 0} / {selectedClassDetail.maxStudents || 0} sinh viên</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Trạng thái</span><span className={`px-2 py-1 rounded text-xs font-bold ${selectedClassDetail.status === 'Hoạt động' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{selectedClassDetail.status}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Ngày tạo</span><span className="text-gray-600 font-medium">{formatDate(selectedClassDetail.createdAt)}</span></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Cập nhật lần cuối</span><span className="text-gray-600 font-medium">{formatDate(selectedClassDetail.updatedAt)}</span></div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-gray-800 mb-2">Mô tả</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 text-sm">
                  {selectedClassDetail.description || "Không có mô tả."}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">Danh sách sinh viên ({selectedClassDetail.students?.length || 0})</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {(!selectedClassDetail.students || selectedClassDetail.students.length === 0) ? (
                      <div className="p-4 text-center text-gray-500 text-sm bg-gray-50">Lớp học chưa có sinh viên nào.</div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {selectedClassDetail.students.map((studentName: string, index: number) => {
                          const studentInfo = usersData.find(u => u.name === studentName);
                          return (
                            <li key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">👤</div>
                              <div>
                                <div className="font-bold text-gray-800 text-sm"><span className="text-gray-400 font-normal mr-1">{index + 1}.</span> {studentName} {studentInfo?.username && <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">{studentInfo.username}</span>}</div>
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">✉️ {studentInfo?.email || "N/A"}</div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CÁC MODAL ẨN KHÁC ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="font-bold text-lg mb-4">{isUserEdit?"Sửa":"Thêm"} User</h3>
            <form onSubmit={handleUserSubmit} className="space-y-3">
              <select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500">
                <option value="student">Học sinh</option>
                <option value="instructor">Giảng viên</option>
                <option value="admin">Admin</option>
              </select>
              
              {/* ĐÃ THAY ĐỔI: Chuyển input text chuyên ngành thành select dropdown */}
              {userForm.role==='student' && (
                <select 
                  value={userForm.major} 
                  onChange={e=>setUserForm({...userForm,major:e.target.value})} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500 text-gray-700"
                >
                  <option value="">-- Chọn chuyên ngành --</option>
                  {majorsData.map(m => (
                    <option key={m._id} value={m.name}>{m.name} ({m.code})</option>
                  ))}
                </select>
              )}
              
              <input placeholder="Họ tên" required value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500" />
              <input type="email" placeholder="Email" required disabled={isUserEdit} value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500" />
              <input type="tel" placeholder="SĐT" value={userForm.phone} onChange={e=>setUserForm({...userForm,phone:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setIsUserModalOpen(false)} className="border p-2 rounded">Huỷ</button>
                <button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMajorModalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl p-6 w-96"><h3 className="font-bold text-lg mb-4">{isMajorEdit?"Sửa":"Thêm"} Ngành</h3><form onSubmit={handleMajorSubmit} className="space-y-3"><input placeholder="Mã" required value={majorForm.code} onChange={e=>setMajorForm({...majorForm,code:e.target.value.toUpperCase()})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500 uppercase" disabled={isMajorEdit} /><input placeholder="Tên" required value={majorForm.name} onChange={e=>setMajorForm({...majorForm,name:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500" /><div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsMajorModalOpen(false)} className="border p-2 rounded">Huỷ</button><button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded">Lưu</button></div></form></div></div>)}
      {isSubjectModalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl p-6 w-96"><h3 className="font-bold text-lg mb-4">{isSubjectEdit?"Sửa":"Thêm"} Môn</h3><form onSubmit={handleSubjectSubmit} className="space-y-3"><input placeholder="Mã" required value={subjectForm.code} onChange={e=>setSubjectForm({...subjectForm,code:e.target.value.toUpperCase()})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500 uppercase" disabled={isSubjectEdit} /><input placeholder="Tên" required value={subjectForm.name} onChange={e=>setSubjectForm({...subjectForm,name:e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-500" /><div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsSubjectModalOpen(false)} className="border p-2 rounded">Huỷ</button><button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded">Lưu</button></div></form></div></div>)}

    </div>
  );
}