import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  BookOpen, Users, UserCheck, Plus, Edit2, Trash2, Building2,
  CheckSquare, Square, X, Save, Calendar, Download, Filter,
  Shield, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sortData, SortHeader } from '../utils/sortUtils';

const SUBJECT_CATEGORIES = ['Core', 'Professional Elective', 'Open Elective', 'Honors', 'Minors', 'Naan Mudhalvan', 'Internship', 'Project', 'Ad-hoc'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('departments');

  // Data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Sort states for each table
  const [deptSort, setDeptSort] = useState({ key: 'dept_code', dir: 'asc' });
  const [facSort, setFacSort] = useState({ key: 'full_name', dir: 'asc' });
  const [stuSort, setStuSort] = useState({ key: 'reg_no', dir: 'asc' });
  const [subSort, setSubSort] = useState({ key: 'subject_code', dir: 'asc' });
  const [assignedSort, setAssignedSort] = useState({ key: 'reg_no', dir: 'asc' });

  // Student filters
  const [stuFilter, setStuFilter] = useState({ search: '', batch: '', regulation: '', course: '' });

  // Allocation states
  const [selectedFacultyForAssignment, setSelectedFacultyForAssignment] = useState('');
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudentIdsToAssign, setSelectedStudentIdsToAssign] = useState([]);
  const [allocFilter, setAllocFilter] = useState({ search: '', batch: '', regulation: '' });

  // Export filters
  const [exportFilter, setExportFilter] = useState({ dept: '', faculty_id: '', semester: '', batch_year: '', reg_no: '' });

  // Ad-hoc subject modal
  const [adHocModal, setAdHocModal] = useState(null); // { student }
  const [adHocForm, setAdHocForm] = useState({ subject_id: '', semester: 1, category: 'Honors', session_id: '' });
  const [studentCustomSubs, setStudentCustomSubs] = useState([]);

  // Form states
  const [newDept, setNewDept] = useState({ dept_name: '', dept_code: '' });
  const [newFaculty, setNewFaculty] = useState({ username: '', password: '', full_name: '', department: 'Computer Science', role: 'faculty' });
  const [newSub, setNewSub] = useState({ subject_code: '', subject_name: '', credits: 3.0, subject_type: 'Theory', semester: 1, course_id: 1, regulation: 'R2021', category: 'Core' });
  const [newStudent, setNewStudent] = useState({ reg_no: '', name: '', course_id: 1, batch_year: 2024, regulation: 'R2021', current_sem: 1, section: 'A' });
  const [newSession, setNewSession] = useState({ session_name: '', academic_year: '', is_active: true });

  // Edit modals
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    try {
      const [dRes, cRes, subRes, stRes, fRes, sessRes] = await Promise.all([
        API.get('/admin/departments'),
        API.get('/admin/courses'),
        API.get('/admin/subjects'),
        API.get('/admin/students'),
        API.get('/admin/faculty'),
        API.get('/admin/sessions'),
      ]);
      setDepartments(dRes.data);
      setCourses(cRes.data);
      setSubjects(subRes.data);
      setStudents(stRes.data);
      setFacultyList(fRes.data);
      setSessions(sessRes.data);
      if (fRes.data.length > 0 && !selectedFacultyForAssignment) {
        setSelectedFacultyForAssignment(fRes.data[0].faculty_id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative data');
    }
  };

  useEffect(() => {
    if (selectedFacultyForAssignment) fetchFacultyAssignedStudents(selectedFacultyForAssignment);
  }, [selectedFacultyForAssignment]);

  const fetchFacultyAssignedStudents = async (facultyId) => {
    try {
      const res = await API.get(`/admin/faculty/${facultyId}/students`);
      setAssignedStudents(res.data);
    } catch (err) { console.error(err); }
  };

  // --- Sort helpers ---
  const makeToggle = (setter) => (key) => {
    setter(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  // --- Department Handlers ---
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/departments', newDept);
      toast.success(`Department ${newDept.dept_name} created!`);
      setNewDept({ dept_name: '', dept_code: '' });
      loadAllData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to create department'); }
  };
  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await API.delete(`/admin/departments/${deptId}`);
      toast.success('Department deleted');
      loadAllData();
    } catch (err) { toast.error('Failed to delete department'); }
  };

  // --- Faculty Handlers ---
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/faculty', newFaculty);
      toast.success(`Faculty account for ${newFaculty.full_name} created!`);
      setNewFaculty({ username: '', password: '', full_name: '', department: departments[0]?.dept_name || 'Computer Science', role: 'faculty' });
      loadAllData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to create faculty account'); }
  };

  // --- Student Handlers ---
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/students', newStudent);
      toast.success(`Student ${newStudent.name} registered!`);
      setNewStudent({ reg_no: '', name: '', course_id: 1, batch_year: 2024, regulation: 'R2021', current_sem: 1, section: 'A' });
      loadAllData();
    } catch (err) { toast.error('Failed to register student'); }
  };
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await API.put(`/admin/students/${editingStudent.student_id}`, editingStudent);
      toast.success(`Student ${editingStudent.name} updated!`);
      setEditingStudent(null);
      loadAllData();
    } catch (err) { toast.error('Failed to update student'); }
  };

  // --- Allocation Handlers ---
  const handleAssignStudents = async () => {
    if (selectedStudentIdsToAssign.length === 0) { toast.error('Select at least one student'); return; }
    try {
      await API.post(`/admin/faculty/${selectedFacultyForAssignment}/assign-students`, { student_ids: selectedStudentIdsToAssign });
      toast.success('Students assigned!');
      setSelectedStudentIdsToAssign([]);
      fetchFacultyAssignedStudents(selectedFacultyForAssignment);
      loadAllData();
    } catch (err) { toast.error('Failed to assign students'); }
  };
  const handleRemoveStudentFromFaculty = async (studentId) => {
    try {
      await API.delete(`/admin/faculty/${selectedFacultyForAssignment}/remove-student/${studentId}`);
      toast.success('Assignment removed');
      fetchFacultyAssignedStudents(selectedFacultyForAssignment);
      loadAllData();
    } catch (err) { toast.error('Failed to remove assignment'); }
  };

  // --- Subject Handlers ---
  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/subjects', newSub);
      toast.success(`Subject ${newSub.subject_code} added!`);
      setNewSub({ subject_code: '', subject_name: '', credits: 3.0, subject_type: 'Theory', semester: 1, course_id: 1, regulation: 'R2021', category: 'Core' });
      loadAllData();
    } catch (err) { toast.error('Failed to add subject'); }
  };

  // --- Session Handlers ---
  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/sessions', newSession);
      toast.success(`Session "${newSession.session_name}" created!`);
      setNewSession({ session_name: '', academic_year: '', is_active: true });
      loadAllData();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to create session'); }
  };
  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await API.delete(`/admin/sessions/${id}`);
      toast.success('Session deleted');
      loadAllData();
    } catch (err) { toast.error('Failed to delete session'); }
  };
  const handleToggleSessionActive = async (sess) => {
    try {
      await API.put(`/admin/sessions/${sess.session_id}`, { ...sess, is_active: !sess.is_active });
      toast.success(`Session ${sess.is_active ? 'deactivated' : 'activated'}`);
      loadAllData();
    } catch (err) { toast.error('Failed to update session'); }
  };

  // --- Ad-hoc Subject Handlers ---
  const openAdHocModal = async (student) => {
    setAdHocModal({ student });
    setAdHocForm({ subject_id: subjects[0]?.subject_id || '', semester: student.current_sem, category: 'Honors', session_id: '' });
    try {
      const res = await API.get(`/admin/students/${student.student_id}/custom-subjects`);
      setStudentCustomSubs(res.data);
    } catch { setStudentCustomSubs([]); }
  };
  const handleAssignAdHocSubject = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/admin/students/${adHocModal.student.student_id}/assign-subject`, {
        subject_id: parseInt(adHocForm.subject_id),
        semester: parseInt(adHocForm.semester),
        category: adHocForm.category,
        session_id: adHocForm.session_id ? parseInt(adHocForm.session_id) : null,
      });
      toast.success('Ad-hoc subject assigned!');
      const res = await API.get(`/admin/students/${adHocModal.student.student_id}/custom-subjects`);
      setStudentCustomSubs(res.data);
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to assign subject'); }
  };
  const handleRemoveCustomSubject = async (csId) => {
    try {
      await API.delete(`/admin/custom-subjects/${csId}`);
      toast.success('Removed');
      const res = await API.get(`/admin/students/${adHocModal.student.student_id}/custom-subjects`);
      setStudentCustomSubs(res.data);
    } catch { toast.error('Failed to remove'); }
  };

  // --- Export ---
  const handleExport = () => {
    const params = new URLSearchParams();
    if (exportFilter.dept) params.set('dept', exportFilter.dept);
    if (exportFilter.faculty_id) params.set('faculty_id', exportFilter.faculty_id);
    if (exportFilter.semester) params.set('semester', exportFilter.semester);
    if (exportFilter.batch_year) params.set('batch_year', exportFilter.batch_year);
    if (exportFilter.reg_no) params.set('reg_no', exportFilter.reg_no);
    const token = localStorage.getItem('token');
    window.open(`http://127.0.0.1:8000/api/export-results?${params.toString()}&token=${token}`, '_blank');
  };

  // --- Filtered data for tables ---
  const filteredStudents = students.filter(st => {
    const s = stuFilter.search.toLowerCase();
    if (s && !st.name.toLowerCase().includes(s) && !st.reg_no.toLowerCase().includes(s)) return false;
    if (stuFilter.batch && String(st.batch_year) !== stuFilter.batch) return false;
    if (stuFilter.regulation && st.regulation !== stuFilter.regulation) return false;
    if (stuFilter.course && st.course?.short_name !== stuFilter.course) return false;
    return true;
  });

  const filteredAllocStudents = students.filter(st => {
    const s = allocFilter.search.toLowerCase();
    if (s && !st.name.toLowerCase().includes(s) && !st.reg_no.toLowerCase().includes(s)) return false;
    if (allocFilter.batch && String(st.batch_year) !== allocFilter.batch) return false;
    if (allocFilter.regulation && st.regulation !== allocFilter.regulation) return false;
    return true;
  });

  const sortedDepts = sortData(departments, deptSort.key, deptSort.dir);
  const sortedFaculty = sortData(facultyList, facSort.key, facSort.dir);
  const sortedStudents = sortData(filteredStudents, stuSort.key, stuSort.dir);
  const sortedSubjects = sortData(subjects, subSort.key, subSort.dir);
  const sortedAssigned = sortData(assignedStudents, assignedSort.key, assignedSort.dir);

  const uniqueBatches = [...new Set(students.map(s => s.batch_year))].sort();
  const uniqueCourses = [...new Set(students.map(s => s.course?.short_name).filter(Boolean))];

  const tabs = [
    { id: 'departments', icon: <Building2 size={15} />, label: 'Departments' },
    { id: 'faculty', icon: <UserCheck size={15} />, label: 'Faculty' },
    { id: 'students', icon: <Users size={15} />, label: 'Students' },
    { id: 'allocation', icon: <CheckSquare size={15} />, label: 'Assign to Faculty' },
    { id: 'subjects', icon: <BookOpen size={15} />, label: 'Subject Catalog' },
    { id: 'sessions', icon: <Calendar size={15} />, label: 'Exam Sessions' },
    { id: 'export', icon: <Download size={15} />, label: 'Export Results' },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header-card">
        <h2>🛠️ Academic Cell Administrator Console</h2>
        <p>Manage departments, faculty accounts, student allocations, syllabus configurations and exam sessions.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── 1. DEPARTMENTS ─── */}
      {activeTab === 'departments' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Add New Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Department Name</label>
                <input type="text" placeholder="e.g. Artificial Intelligence & Data Science" value={newDept.dept_name}
                  onChange={e => setNewDept({ ...newDept, dept_name: e.target.value })} className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Department Code</label>
                <input type="text" placeholder="e.g. AIDS" value={newDept.dept_code}
                  onChange={e => setNewDept({ ...newDept, dept_code: e.target.value.toUpperCase() })} className="admin-input font-mono" required />
              </div>
              <button type="submit" className="btn-primary w-full mt-2"><Plus size={16} /> Create Department</button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>Registered Departments ({departments.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortHeader label="Code" sortKey="dept_code" currentKey={deptSort.key} direction={deptSort.dir} onSort={makeToggle(setDeptSort)} />
                    <SortHeader label="Department Name" sortKey="dept_name" currentKey={deptSort.key} direction={deptSort.dir} onSort={makeToggle(setDeptSort)} />
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDepts.map(d => (
                    <tr key={d.dept_id}>
                      <td className="font-mono font-bold text-blue-900">{d.dept_code}</td>
                      <td className="font-medium text-gray-800">{d.dept_name}</td>
                      <td>
                        <button onClick={() => handleDeleteDepartment(d.dept_id)} className="text-red-600 hover:text-red-800 p-1" title="Delete"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. FACULTY ─── */}
      {activeTab === 'faculty' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Create Faculty Account</h3>
            <form onSubmit={handleAddFaculty} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Full Name</label>
                <input type="text" placeholder="e.g. Dr. A. Ramanathan" value={newFaculty.full_name}
                  onChange={e => setNewFaculty({ ...newFaculty, full_name: e.target.value })} className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Username</label>
                <input type="text" placeholder="e.g. prof.raman" value={newFaculty.username}
                  onChange={e => setNewFaculty({ ...newFaculty, username: e.target.value })} className="admin-input font-mono" required />
              </div>
              <div>
                <label className="admin-label">Password</label>
                <input type="password" placeholder="••••••••" value={newFaculty.password}
                  onChange={e => setNewFaculty({ ...newFaculty, password: e.target.value })} className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Department</label>
                <select value={newFaculty.department} onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })} className="admin-input">
                  {departments.length > 0 ? departments.map(d => <option key={d.dept_id} value={d.dept_name}>{d.dept_name}</option>)
                    : <><option value="Computer Science">Computer Science</option><option value="Information Technology">Information Technology</option></>}
                </select>
              </div>
              <div>
                <label className="admin-label">Role</label>
                <select value={newFaculty.role} onChange={e => setNewFaculty({ ...newFaculty, role: e.target.value })} className="admin-input">
                  <option value="faculty">Faculty Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-2"><Plus size={16} /> Create Account</button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>Faculty Directory ({facultyList.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortHeader label="Username" sortKey="username" currentKey={facSort.key} direction={facSort.dir} onSort={makeToggle(setFacSort)} />
                    <SortHeader label="Name" sortKey="full_name" currentKey={facSort.key} direction={facSort.dir} onSort={makeToggle(setFacSort)} />
                    <SortHeader label="Department" sortKey="department" currentKey={facSort.key} direction={facSort.dir} onSort={makeToggle(setFacSort)} />
                    <SortHeader label="Role" sortKey="role" currentKey={facSort.key} direction={facSort.dir} onSort={makeToggle(setFacSort)} />
                    <SortHeader label="Assigned Students" sortKey="assigned_students_count" currentKey={facSort.key} direction={facSort.dir} onSort={makeToggle(setFacSort)} />
                  </tr>
                </thead>
                <tbody>
                  {sortedFaculty.map(f => (
                    <tr key={f.faculty_id}>
                      <td className="font-mono font-bold text-blue-900">{f.username}</td>
                      <td className="font-medium text-gray-800">{f.full_name}</td>
                      <td>{f.department}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${f.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {f.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-center font-bold text-blue-700">{f.assigned_students_count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. STUDENTS ─── */}
      {activeTab === 'students' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Register New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Register Number (12 Digits AU)</label>
                <input type="text" placeholder="e.g. 911124104015" value={newStudent.reg_no}
                  onChange={e => setNewStudent({ ...newStudent, reg_no: e.target.value })} className="admin-input font-mono" required />
              </div>
              <div>
                <label className="admin-label">Full Name</label>
                <input type="text" placeholder="e.g. Naveen K" value={newStudent.name}
                  onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="admin-input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Regulation</label>
                  <select value={newStudent.regulation} onChange={e => setNewStudent({ ...newStudent, regulation: e.target.value })} className="admin-input font-bold text-blue-800">
                    <option value="R2021">R2021</option>
                    <option value="R2025">R2025</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Batch Year</label>
                  <input type="number" value={newStudent.batch_year}
                    onChange={e => setNewStudent({ ...newStudent, batch_year: parseInt(e.target.value) })} className="admin-input" required />
                </div>
              </div>
              <div>
                <label className="admin-label">Course</label>
                <select value={newStudent.course_id} onChange={e => setNewStudent({ ...newStudent, course_id: parseInt(e.target.value) })} className="admin-input">
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-2"><Plus size={16} /> Register Student</button>
            </form>
          </div>

          <div className="admin-table-card">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3>Student Roster ({filteredStudents.length} / {students.length})</h3>
              <div className="flex flex-wrap gap-2">
                <input placeholder="Search name / reg no" value={stuFilter.search}
                  onChange={e => setStuFilter(p => ({ ...p, search: e.target.value }))}
                  className="admin-input !py-1 !text-xs w-44" />
                <select value={stuFilter.batch} onChange={e => setStuFilter(p => ({ ...p, batch: e.target.value }))} className="admin-input !py-1 !text-xs w-28">
                  <option value="">All Batches</option>
                  {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={stuFilter.regulation} onChange={e => setStuFilter(p => ({ ...p, regulation: e.target.value }))} className="admin-input !py-1 !text-xs w-28">
                  <option value="">All Regs</option>
                  <option value="R2021">R2021</option>
                  <option value="R2025">R2025</option>
                </select>
                <select value={stuFilter.course} onChange={e => setStuFilter(p => ({ ...p, course: e.target.value }))} className="admin-input !py-1 !text-xs w-28">
                  <option value="">All Courses</option>
                  {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortHeader label="Reg No" sortKey="reg_no" currentKey={stuSort.key} direction={stuSort.dir} onSort={makeToggle(setStuSort)} />
                    <SortHeader label="Name" sortKey="name" currentKey={stuSort.key} direction={stuSort.dir} onSort={makeToggle(setStuSort)} />
                    <SortHeader label="Reg" sortKey="regulation" currentKey={stuSort.key} direction={stuSort.dir} onSort={makeToggle(setStuSort)} />
                    <SortHeader label="Batch" sortKey="batch_year" currentKey={stuSort.key} direction={stuSort.dir} onSort={makeToggle(setStuSort)} />
                    <SortHeader label="Course" sortKey="course.short_name" currentKey={stuSort.key} direction={stuSort.dir} onSort={makeToggle(setStuSort)} />
                    <SortHeader label="Sem" sortKey="current_sem" currentKey={stuSort.key} direction={stuSort.dir} onSort={makeToggle(setStuSort)} />
                    <SortHeader label="Mentor" sortKey="assigned_faculty_name" currentKey={stuSort.key} direction={stuSort.dir} onSort={makeToggle(setStuSort)} />
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map(st => (
                    <tr key={st.student_id}>
                      <td className="font-mono font-bold text-blue-900">{st.reg_no}</td>
                      <td className="font-medium text-gray-800">{st.name}</td>
                      <td className="text-center font-bold text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">{st.regulation}</td>
                      <td className="text-center">{st.batch_year}</td>
                      <td className="text-xs text-gray-600">{st.course?.short_name || 'UG'}</td>
                      <td className="text-center">{st.current_sem}</td>
                      <td className="text-xs text-gray-500">{st.assigned_faculty_name || '—'}</td>
                      <td className="flex gap-1">
                        <button onClick={() => setEditingStudent({ ...st })} className="btn-secondary text-xs px-2 py-1 flex items-center gap-1">
                          <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={() => openAdHocModal(st)} className="btn-primary text-xs px-2 py-1 flex items-center gap-1" title="Assign Ad-hoc Subject">
                          <Plus size={12} /> Subject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT STUDENT MODAL ─── */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-blue-900">Edit Student Record</h3>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateStudent} className="space-y-3">
              <div>
                <label className="admin-label">Register Number</label>
                <input type="text" value={editingStudent.reg_no}
                  onChange={e => setEditingStudent({ ...editingStudent, reg_no: e.target.value })} className="admin-input font-mono" required />
              </div>
              <div>
                <label className="admin-label">Full Name</label>
                <input type="text" value={editingStudent.name}
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} className="admin-input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Regulation</label>
                  <select value={editingStudent.regulation} onChange={e => setEditingStudent({ ...editingStudent, regulation: e.target.value })} className="admin-input font-bold text-blue-800">
                    <option value="R2021">R2021</option>
                    <option value="R2025">R2025</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Current Sem</label>
                  <input type="number" min="1" max="8" value={editingStudent.current_sem}
                    onChange={e => setEditingStudent({ ...editingStudent, current_sem: parseInt(e.target.value) })} className="admin-input" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button type="button" onClick={() => setEditingStudent(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Save size={16} /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── AD-HOC SUBJECT MODAL ─── */}
      {adHocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg text-blue-900">Assign Ad-hoc Subject</h3>
                <p className="text-xs text-gray-500">{adHocModal.student.reg_no} — {adHocModal.student.name}</p>
              </div>
              <button onClick={() => setAdHocModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleAssignAdHocSubject} className="space-y-3">
              <div>
                <label className="admin-label">Subject</label>
                <select value={adHocForm.subject_id} onChange={e => setAdHocForm({ ...adHocForm, subject_id: e.target.value })} className="admin-input" required>
                  <option value="">-- Select Subject --</option>
                  {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_code} — {s.subject_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Semester</label>
                  <select value={adHocForm.semester} onChange={e => setAdHocForm({ ...adHocForm, semester: e.target.value })} className="admin-input">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <select value={adHocForm.category} onChange={e => setAdHocForm({ ...adHocForm, category: e.target.value })} className="admin-input">
                    {['Honors', 'Minors', 'Naan Mudhalvan', 'Internship', 'Project', 'Open Elective', 'Professional Elective', 'Ad-hoc'].map(c =>
                      <option key={c} value={c}>{c}</option>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="admin-label">Exam Session (optional)</label>
                <select value={adHocForm.session_id} onChange={e => setAdHocForm({ ...adHocForm, session_id: e.target.value })} className="admin-input">
                  <option value="">None</option>
                  {sessions.map(s => <option key={s.session_id} value={s.session_id}>{s.session_name} ({s.academic_year})</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full"><Plus size={16} /> Assign Subject</button>
            </form>

            {/* Existing custom subjects */}
            {studentCustomSubs.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Already Assigned Ad-hoc Subjects</h4>
                <div className="space-y-1">
                  {studentCustomSubs.map(cs => (
                    <div key={cs.id} className="flex justify-between items-center bg-blue-50 rounded px-3 py-1.5 text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-900">{cs.subject?.subject_code}</span>
                        <span className="ml-2 text-gray-700">{cs.subject?.subject_name}</span>
                        <span className="ml-2 text-purple-700 font-semibold">({cs.category})</span>
                        <span className="ml-2 text-gray-500">Sem {cs.semester}</span>
                      </div>
                      <button onClick={() => handleRemoveCustomSubject(cs.id)} className="text-red-500 hover:text-red-700 ml-2"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 4. ALLOCATION ─── */}
      {activeTab === 'allocation' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Assign Students to Faculty</h3>
            <div className="mt-3">
              <label className="admin-label">Select Faculty Member</label>
              <select value={selectedFacultyForAssignment} onChange={e => setSelectedFacultyForAssignment(e.target.value)} className="admin-input font-bold">
                {facultyList.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.full_name} ({f.department})</option>)}
              </select>
            </div>

            {/* Allocation filters */}
            <div className="mt-3 flex flex-wrap gap-2">
              <input placeholder="Search name / reg no" value={allocFilter.search}
                onChange={e => setAllocFilter(p => ({ ...p, search: e.target.value }))} className="admin-input !py-1 !text-xs w-40" />
              <select value={allocFilter.batch} onChange={e => setAllocFilter(p => ({ ...p, batch: e.target.value }))} className="admin-input !py-1 !text-xs w-28">
                <option value="">All Batches</option>
                {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={allocFilter.regulation} onChange={e => setAllocFilter(p => ({ ...p, regulation: e.target.value }))} className="admin-input !py-1 !text-xs w-28">
                <option value="">All Regs</option>
                <option value="R2021">R2021</option>
                <option value="R2025">R2025</option>
              </select>
            </div>

            <div className="mt-3">
              <label className="admin-label mb-2">Check Students to Assign ({filteredAllocStudents.length} visible):</label>
              <div className="max-h-64 overflow-y-auto border rounded p-2 space-y-1">
                {filteredAllocStudents.map(st => {
                  const isChecked = selectedStudentIdsToAssign.includes(st.student_id);
                  const isAlreadyAssigned = assignedStudents.some(a => a.student_id === st.student_id);
                  return (
                    <div key={st.student_id}
                      onClick={() => { if (isAlreadyAssigned) return; setSelectedStudentIdsToAssign(prev => isChecked ? prev.filter(id => id !== st.student_id) : [...prev, st.student_id]); }}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${isAlreadyAssigned ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isChecked ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      {isAlreadyAssigned ? <CheckSquare size={15} className="text-gray-400" /> : isChecked ? <CheckSquare size={15} className="text-blue-700" /> : <Square size={15} className="text-gray-400" />}
                      <span>{st.reg_no} — {st.name} <span className="text-gray-400">({st.regulation} | Batch {st.batch_year})</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={handleAssignStudents} className="btn-primary w-full mt-4" disabled={selectedStudentIdsToAssign.length === 0}>
              Assign Selected ({selectedStudentIdsToAssign.length})
            </button>
          </div>

          <div className="admin-table-card">
            <h3>Currently Assigned to Selected Faculty ({assignedStudents.length})</h3>
            <p className="text-xs text-gray-500 mb-3">These students are visible to this faculty member for grade entry.</p>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortHeader label="Reg No" sortKey="reg_no" currentKey={assignedSort.key} direction={assignedSort.dir} onSort={makeToggle(setAssignedSort)} />
                    <SortHeader label="Student Name" sortKey="name" currentKey={assignedSort.key} direction={assignedSort.dir} onSort={makeToggle(setAssignedSort)} />
                    <SortHeader label="Reg" sortKey="regulation" currentKey={assignedSort.key} direction={assignedSort.dir} onSort={makeToggle(setAssignedSort)} />
                    <SortHeader label="Batch" sortKey="batch_year" currentKey={assignedSort.key} direction={assignedSort.dir} onSort={makeToggle(setAssignedSort)} />
                    <SortHeader label="Course" sortKey="course.short_name" currentKey={assignedSort.key} direction={assignedSort.dir} onSort={makeToggle(setAssignedSort)} />
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedStudents.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-gray-400 py-4">No students directly assigned to this faculty yet.</td></tr>
                  ) : sortedAssigned.map(st => (
                    <tr key={st.student_id}>
                      <td className="font-mono font-bold text-blue-900">{st.reg_no}</td>
                      <td className="font-medium text-gray-800">{st.name}</td>
                      <td className="text-center text-xs font-semibold">{st.regulation}</td>
                      <td className="text-center">{st.batch_year}</td>
                      <td className="text-xs text-gray-600">{st.course?.short_name || 'UG'}</td>
                      <td>
                        <button onClick={() => handleRemoveStudentFromFaculty(st.student_id)} className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1">
                          <Trash2 size={14} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. SUBJECTS CATALOG ─── */}
      {activeTab === 'subjects' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Add New Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Subject Code</label>
                <input type="text" placeholder="e.g. CS3401" value={newSub.subject_code}
                  onChange={e => setNewSub({ ...newSub, subject_code: e.target.value })} className="admin-input font-mono font-bold" required />
              </div>
              <div>
                <label className="admin-label">Subject Title</label>
                <input type="text" placeholder="e.g. Design and Analysis of Algorithms" value={newSub.subject_name}
                  onChange={e => setNewSub({ ...newSub, subject_name: e.target.value })} className="admin-input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Credits</label>
                  <input type="number" step="0.5" value={newSub.credits}
                    onChange={e => setNewSub({ ...newSub, credits: parseFloat(e.target.value) })} className="admin-input" required />
                </div>
                <div>
                  <label className="admin-label">Semester</label>
                  <select value={newSub.semester} onChange={e => setNewSub({ ...newSub, semester: parseInt(e.target.value) })} className="admin-input">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Regulation</label>
                  <select value={newSub.regulation} onChange={e => setNewSub({ ...newSub, regulation: e.target.value })} className="admin-input font-bold text-blue-800">
                    <option value="R2021">R2021</option>
                    <option value="R2025">R2025</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <select value={newSub.category} onChange={e => setNewSub({ ...newSub, category: e.target.value })} className="admin-input">
                    {SUBJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="admin-label">Course</label>
                <select value={newSub.course_id} onChange={e => setNewSub({ ...newSub, course_id: parseInt(e.target.value) })} className="admin-input">
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.short_name} ({c.degree})</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-2"><Plus size={16} /> Save Subject</button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>Subject Catalog ({subjects.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortHeader label="Code" sortKey="subject_code" currentKey={subSort.key} direction={subSort.dir} onSort={makeToggle(setSubSort)} />
                    <SortHeader label="Name" sortKey="subject_name" currentKey={subSort.key} direction={subSort.dir} onSort={makeToggle(setSubSort)} />
                    <SortHeader label="Cr" sortKey="credits" currentKey={subSort.key} direction={subSort.dir} onSort={makeToggle(setSubSort)} />
                    <SortHeader label="Sem" sortKey="semester" currentKey={subSort.key} direction={subSort.dir} onSort={makeToggle(setSubSort)} />
                    <SortHeader label="Reg" sortKey="regulation" currentKey={subSort.key} direction={subSort.dir} onSort={makeToggle(setSubSort)} />
                    <SortHeader label="Category" sortKey="category" currentKey={subSort.key} direction={subSort.dir} onSort={makeToggle(setSubSort)} />
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubjects.map(sub => (
                    <tr key={sub.subject_id}>
                      <td className="font-mono font-bold text-blue-900">{sub.subject_code}</td>
                      <td>{sub.subject_name}</td>
                      <td className="text-center font-bold">{sub.credits}</td>
                      <td className="text-center">{sub.semester}</td>
                      <td className="text-center font-semibold text-xs text-blue-800">{sub.regulation}</td>
                      <td>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          sub.category === 'Core' ? 'bg-blue-100 text-blue-800' :
                          sub.category === 'Honors' ? 'bg-purple-100 text-purple-800' :
                          sub.category === 'Minors' ? 'bg-indigo-100 text-indigo-800' :
                          sub.category === 'Naan Mudhalvan' ? 'bg-orange-100 text-orange-800' :
                          sub.category === 'Internship' ? 'bg-teal-100 text-teal-800' :
                          sub.category === 'Project' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>{sub.category || 'Core'}</span>
                      </td>
                      <td className="text-xs text-gray-600">{courses.find(c => c.course_id === sub.course_id)?.short_name || sub.course_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. EXAM SESSIONS ─── */}
      {activeTab === 'sessions' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Create Exam Session</h3>
            <p className="text-xs text-gray-500 mt-1">Sessions represent an Anna University exam sitting (e.g. Nov-Dec 2025, Apr-May 2026).</p>
            <form onSubmit={handleAddSession} className="space-y-3 mt-4">
              <div>
                <label className="admin-label">Session Name</label>
                <input type="text" placeholder="e.g. Nov-Dec 2025" value={newSession.session_name}
                  onChange={e => setNewSession({ ...newSession, session_name: e.target.value })} className="admin-input" required />
              </div>
              <div>
                <label className="admin-label">Academic Year</label>
                <input type="text" placeholder="e.g. 2025-26" value={newSession.academic_year}
                  onChange={e => setNewSession({ ...newSession, academic_year: e.target.value })} className="admin-input" required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sessActive" checked={newSession.is_active}
                  onChange={e => setNewSession({ ...newSession, is_active: e.target.checked })} className="w-4 h-4 accent-blue-700" />
                <label htmlFor="sessActive" className="text-sm font-medium text-gray-700">Mark as Active Session</label>
              </div>
              <button type="submit" className="btn-primary w-full mt-2"><Plus size={16} /> Create Session</button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>All Exam Sessions ({sessions.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Academic Year</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-gray-400 py-4">No sessions created yet.</td></tr>
                  ) : sessions.map(sess => (
                    <tr key={sess.session_id}>
                      <td className="font-semibold text-gray-800">{sess.session_name}</td>
                      <td className="text-gray-600">{sess.academic_year}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${sess.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {sess.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="flex gap-2">
                        <button onClick={() => handleToggleSessionActive(sess)}
                          className="text-xs btn-secondary px-2 py-1"
                          title={sess.is_active ? 'Deactivate' : 'Activate'}>
                          {sess.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteSession(sess.session_id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. EXPORT RESULTS ─── */}
      {activeTab === 'export' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Export Semester Results</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Generate a CSV file with grade data. Leave filters blank to export all results. Combine filters for dept-wise, faculty-wise, batch-wise exports.
            </p>
            <div className="space-y-3">
              <div>
                <label className="admin-label">Department (text)</label>
                <input type="text" placeholder="e.g. Computer Science" value={exportFilter.dept}
                  onChange={e => setExportFilter(p => ({ ...p, dept: e.target.value }))} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Faculty (Mentor)</label>
                <select value={exportFilter.faculty_id} onChange={e => setExportFilter(p => ({ ...p, faculty_id: e.target.value }))} className="admin-input">
                  <option value="">All Faculty</option>
                  {facultyList.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.full_name} ({f.department})</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Semester</label>
                <select value={exportFilter.semester} onChange={e => setExportFilter(p => ({ ...p, semester: e.target.value }))} className="admin-input">
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Batch Year</label>
                <select value={exportFilter.batch_year} onChange={e => setExportFilter(p => ({ ...p, batch_year: e.target.value }))} className="admin-input">
                  <option value="">All Batches</option>
                  {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Specific Register Number (optional)</label>
                <input type="text" placeholder="e.g. 911124104015" value={exportFilter.reg_no}
                  onChange={e => setExportFilter(p => ({ ...p, reg_no: e.target.value }))} className="admin-input font-mono" />
              </div>
              <button onClick={handleExport} className="btn-primary w-full mt-3">
                <Download size={16} /> Download CSV Export
              </button>
            </div>
          </div>

          <div className="admin-table-card">
            <h3>Export Guide</h3>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="font-semibold text-blue-900 mb-1">📂 Department-wise Export</p>
                <p className="text-xs">Set <strong>Department</strong> to the department name (e.g. "Computer Science"). Leave other filters blank.</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="font-semibold text-green-900 mb-1">👤 Faculty-wise Export</p>
                <p className="text-xs">Select a <strong>Faculty (Mentor)</strong> from the dropdown. Exports only their assigned students' results.</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="font-semibold text-purple-900 mb-1">🎓 Batch-wise Export</p>
                <p className="text-xs">Select a <strong>Batch Year</strong> to get all students from that admission year.</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="font-semibold text-amber-900 mb-1">📄 Student-wise Export</p>
                <p className="text-xs">Enter a specific <strong>Register Number</strong> to get that single student's complete result history.</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                * The CSV file contains: Reg No, Name, Regulation, Course, Semester, SGPA, CGPA, Total Credits, Arrear Count.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
