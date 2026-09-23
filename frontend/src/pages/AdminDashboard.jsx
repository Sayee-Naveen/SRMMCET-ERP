import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  BookOpen, Users, UserCheck, Plus, Edit2, Trash2, Building2,
  CheckSquare, Square, X, Save, AlertCircle, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('departments');

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Assignment states
  const [selectedFacultyForAssignment, setSelectedFacultyForAssignment] = useState('');
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudentIdsToAssign, setSelectedStudentIdsToAssign] = useState([]);

  // Form states
  const [newDept, setNewDept] = useState({ dept_name: '', dept_code: '' });
  const [newFaculty, setNewFaculty] = useState({
    username: '',
    password: '',
    full_name: '',
    department: 'Computer Science',
    role: 'faculty',
  });
  const [newSub, setNewSub] = useState({
    subject_code: '',
    subject_name: '',
    credits: 3.0,
    subject_type: 'Theory',
    semester: 1,
    course_id: 1,
    regulation: 'R2021',
  });
  const [newStudent, setNewStudent] = useState({
    reg_no: '',
    name: '',
    course_id: 1,
    batch_year: 2024,
    regulation: 'R2021',
    current_sem: 1,
    section: 'A',
  });

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [dRes, cRes, subRes, stRes, fRes] = await Promise.all([
        API.get('/admin/departments'),
        API.get('/admin/courses'),
        API.get('/admin/subjects'),
        API.get('/admin/students'),
        API.get('/admin/faculty'),
      ]);
      setDepartments(dRes.data);
      setCourses(cRes.data);
      setSubjects(subRes.data);
      setStudents(stRes.data);
      setFacultyList(fRes.data);
      if (fRes.data.length > 0 && !selectedFacultyForAssignment) {
        setSelectedFacultyForAssignment(fRes.data[0].faculty_id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative data');
    }
  };

  // Load students assigned to selected faculty
  useEffect(() => {
    if (selectedFacultyForAssignment) {
      fetchFacultyAssignedStudents(selectedFacultyForAssignment);
    }
  }, [selectedFacultyForAssignment]);

  const fetchFacultyAssignedStudents = async (facultyId) => {
    try {
      const res = await API.get(`/admin/faculty/${facultyId}/students`);
      setAssignedStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Department Handlers
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/departments', newDept);
      toast.success(`Department ${newDept.dept_name} created!`);
      setNewDept({ dept_name: '', dept_code: '' });
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create department');
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await API.delete(`/admin/departments/${deptId}`);
      toast.success('Department deleted');
      loadAllData();
    } catch (err) {
      toast.error('Failed to delete department');
    }
  };

  // 2. Faculty Handlers
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/faculty', newFaculty);
      toast.success(`Faculty account for ${newFaculty.full_name} created!`);
      setNewFaculty({
        username: '',
        password: '',
        full_name: '',
        department: departments[0]?.dept_name || 'Computer Science',
        role: 'faculty',
      });
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create faculty account');
    }
  };

  // 3. Student Create & Edit Handlers
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/students', newStudent);
      toast.success(`Student ${newStudent.name} registered!`);
      setNewStudent({
        reg_no: '',
        name: '',
        course_id: 1,
        batch_year: 2024,
        regulation: 'R2021',
        current_sem: 1,
        section: 'A',
      });
      loadAllData();
    } catch (err) {
      toast.error('Failed to register student');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await API.put(`/admin/students/${editingStudent.student_id}`, editingStudent);
      toast.success(`Student ${editingStudent.name} updated!`);
      setEditingStudent(null);
      loadAllData();
    } catch (err) {
      toast.error('Failed to update student');
    }
  };

  // 4. Assign Students to Faculty Handlers
  const handleAssignStudents = async () => {
    if (selectedStudentIdsToAssign.length === 0) {
      toast.error('Select at least one student to assign');
      return;
    }
    try {
      await API.post(`/admin/faculty/${selectedFacultyForAssignment}/assign-students`, {
        student_ids: selectedStudentIdsToAssign,
      });
      toast.success('Students assigned to faculty successfully!');
      setSelectedStudentIdsToAssign([]);
      fetchFacultyAssignedStudents(selectedFacultyForAssignment);
    } catch (err) {
      toast.error('Failed to assign students');
    }
  };

  const handleRemoveStudentFromFaculty = async (studentId) => {
    try {
      await API.delete(`/admin/faculty/${selectedFacultyForAssignment}/remove-student/${studentId}`);
      toast.success('Assignment removed');
      fetchFacultyAssignedStudents(selectedFacultyForAssignment);
    } catch (err) {
      toast.error('Failed to remove assignment');
    }
  };

  // 5. Subject Handlers
  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/subjects', newSub);
      toast.success(`Subject ${newSub.subject_code} added!`);
      setNewSub({
        subject_code: '',
        subject_name: '',
        credits: 3.0,
        subject_type: 'Theory',
        semester: 1,
        course_id: 1,
        regulation: 'R2021',
      });
      loadAllData();
    } catch (err) {
      toast.error('Failed to add subject');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header-card">
        <h2>🛠️ Academic Cell Administrator Console</h2>
        <p>Manage departments, faculty accounts, student allocations, and syllabus configurations.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('departments')}
          className={`admin-tab ${activeTab === 'departments' ? 'active' : ''}`}
        >
          <Building2 size={16} /> Departments
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`admin-tab ${activeTab === 'faculty' ? 'active' : ''}`}
        >
          <UserCheck size={16} /> Faculty Accounts
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`admin-tab ${activeTab === 'students' ? 'active' : ''}`}
        >
          <Users size={16} /> Students & Regulation
        </button>
        <button
          onClick={() => setActiveTab('allocation')}
          className={`admin-tab ${activeTab === 'allocation' ? 'active' : ''}`}
        >
          <CheckSquare size={16} /> Assign Students to Faculty
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`admin-tab ${activeTab === 'subjects' ? 'active' : ''}`}
        >
          <BookOpen size={16} /> Subject Catalog
        </button>
      </div>

      {/* 1. DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Add New Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={newDept.dept_name}
                  onChange={(e) => setNewDept({ ...newDept, dept_name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g. AIDS"
                  value={newDept.dept_code}
                  onChange={(e) => setNewDept({ ...newDept, dept_code: e.target.value.toUpperCase() })}
                  className="admin-input font-mono"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full mt-2">
                <Plus size={16} /> Create Department
              </button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>Registered Departments ({departments.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Department Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d.dept_id}>
                      <td className="font-mono font-bold text-blue-900">{d.dept_code}</td>
                      <td className="font-medium text-gray-800">{d.dept_name}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteDepartment(d.dept_id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Department"
                        >
                          <Trash2 size={16} />
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

      {/* 2. FACULTY ACCOUNTS TAB */}
      {activeTab === 'faculty' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Create Faculty Account</h3>
            <form onSubmit={handleAddFaculty} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Faculty Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. Ramanathan"
                  value={newFaculty.full_name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, full_name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Username</label>
                <input
                  type="text"
                  placeholder="e.g. prof.raman"
                  value={newFaculty.username}
                  onChange={(e) => setNewFaculty({ ...newFaculty, username: e.target.value })}
                  className="admin-input font-mono"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newFaculty.password}
                  onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Department</label>
                <select
                  value={newFaculty.department}
                  onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                  className="admin-input"
                >
                  {departments.length > 0 ? (
                    departments.map((d) => (
                      <option key={d.dept_id} value={d.dept_name}>
                        {d.dept_name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="admin-label">Role</label>
                <select
                  value={newFaculty.role}
                  onChange={(e) => setNewFaculty({ ...newFaculty, role: e.target.value })}
                  className="admin-input"
                >
                  <option value="faculty">Faculty Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-2">
                <Plus size={16} /> Create Account
              </button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>Faculty Directory ({facultyList.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.map((f) => (
                    <tr key={f.faculty_id}>
                      <td className="font-mono font-bold text-blue-900">{f.username}</td>
                      <td className="font-medium text-gray-800">{f.full_name}</td>
                      <td>{f.department}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${f.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {f.role.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. STUDENTS & REGULATION (WITH EDIT CAPABILITY) */}
      {activeTab === 'students' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Register New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Register Number (12 Digits AU)</label>
                <input
                  type="text"
                  placeholder="e.g. 911124104015"
                  value={newStudent.reg_no}
                  onChange={(e) => setNewStudent({ ...newStudent, reg_no: e.target.value })}
                  className="admin-input font-mono"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Naveen K"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Regulation (Admin choice)</label>
                  <select
                    value={newStudent.regulation}
                    onChange={(e) => setNewStudent({ ...newStudent, regulation: e.target.value })}
                    className="admin-input font-bold text-blue-800"
                  >
                    <option value="R2021">R2021</option>
                    <option value="R2025">R2025</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Batch Year</label>
                  <input
                    type="number"
                    value={newStudent.batch_year}
                    onChange={(e) => setNewStudent({ ...newStudent, batch_year: parseInt(e.target.value) })}
                    className="admin-input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="admin-label">Course</label>
                <select
                  value={newStudent.course_id}
                  onChange={(e) => setNewStudent({ ...newStudent, course_id: parseInt(e.target.value) })}
                  className="admin-input"
                >
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-2">
                <Plus size={16} /> Register Student
              </button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>Student Roster ({students.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Regulation</th>
                    <th>Course</th>
                    <th>Sem</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.student_id}>
                      <td className="font-mono font-bold text-blue-900">{st.reg_no}</td>
                      <td className="font-medium text-gray-800">{st.name}</td>
                      <td className="text-center font-bold text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">
                        {st.regulation}
                      </td>
                      <td className="text-xs text-gray-600">{st.course?.short_name || 'UG'}</td>
                      <td className="text-center">{st.current_sem}</td>
                      <td>
                        <button
                          onClick={() => setEditingStudent({ ...st })}
                          className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"
                        >
                          <Edit2 size={13} /> Edit
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

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-blue-900">Edit Student Record</h3>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="space-y-3">
              <div>
                <label className="admin-label">Register Number</label>
                <input
                  type="text"
                  value={editingStudent.reg_no}
                  onChange={(e) => setEditingStudent({ ...editingStudent, reg_no: e.target.value })}
                  className="admin-input font-mono"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Regulation</label>
                  <select
                    value={editingStudent.regulation}
                    onChange={(e) => setEditingStudent({ ...editingStudent, regulation: e.target.value })}
                    className="admin-input font-bold text-blue-800"
                  >
                    <option value="R2021">R2021</option>
                    <option value="R2025">R2025</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Current Sem</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editingStudent.current_sem}
                    onChange={(e) => setEditingStudent({ ...editingStudent, current_sem: parseInt(e.target.value) })}
                    className="admin-input"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ALLOCATION TAB (ASSIGN STUDENTS TO FACULTY) */}
      {activeTab === 'allocation' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Assign Students</h3>
            <div className="mt-3">
              <label className="admin-label">Select Faculty Member</label>
              <select
                value={selectedFacultyForAssignment}
                onChange={(e) => setSelectedFacultyForAssignment(e.target.value)}
                className="admin-input font-bold"
              >
                {facultyList.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>
                    {f.full_name} ({f.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="admin-label mb-2">Check Students to Assign:</label>
              <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
                {students.map((st) => {
                  const isChecked = selectedStudentIdsToAssign.includes(st.student_id);
                  const isAlreadyAssigned = assignedStudents.some((a) => a.student_id === st.student_id);
                  return (
                    <div
                      key={st.student_id}
                      onClick={() => {
                        if (isAlreadyAssigned) return;
                        setSelectedStudentIdsToAssign((prev) =>
                          isChecked ? prev.filter((id) => id !== st.student_id) : [...prev, st.student_id]
                        );
                      }}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${isAlreadyAssigned ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isChecked ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      {isAlreadyAssigned ? (
                        <CheckSquare size={16} className="text-gray-400" />
                      ) : isChecked ? (
                        <CheckSquare size={16} className="text-blue-700" />
                      ) : (
                        <Square size={16} className="text-gray-400" />
                      )}
                      <span>{st.reg_no} - {st.name} ({st.regulation})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAssignStudents}
              className="btn-primary w-full mt-4"
              disabled={selectedStudentIdsToAssign.length === 0}
            >
              Assign Selected ({selectedStudentIdsToAssign.length})
            </button>
          </div>

          <div className="admin-table-card">
            <h3>Currently Assigned Students ({assignedStudents.length})</h3>
            <p className="text-xs text-gray-500 mb-3">
              These students will be visible to this faculty member when they log in to enter/edit semester results.
            </p>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Student Name</th>
                    <th>Regulation</th>
                    <th>Course</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-400 py-4">
                        No students assigned directly to this faculty yet.
                      </td>
                    </tr>
                  ) : (
                    assignedStudents.map((st) => (
                      <tr key={st.student_id}>
                        <td className="font-mono font-bold text-blue-900">{st.reg_no}</td>
                        <td className="font-medium text-gray-800">{st.name}</td>
                        <td className="text-center text-xs font-semibold">{st.regulation}</td>
                        <td className="text-xs text-gray-600">{st.course?.short_name || 'UG'}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveStudentFromFaculty(st.student_id)}
                            className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBJECTS CATALOG TAB */}
      {activeTab === 'subjects' && (
        <div className="admin-section-grid">
          <div className="admin-form-card">
            <h3>Add New Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS3401"
                  value={newSub.subject_code}
                  onChange={(e) => setNewSub({ ...newSub, subject_code: e.target.value })}
                  className="admin-input font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="admin-label">Subject Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design and Analysis of Algorithms"
                  value={newSub.subject_name}
                  onChange={(e) => setNewSub({ ...newSub, subject_name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSub.credits}
                    onChange={(e) => setNewSub({ ...newSub, credits: parseFloat(e.target.value) })}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Semester</label>
                  <select
                    value={newSub.semester}
                    onChange={(e) => setNewSub({ ...newSub, semester: parseInt(e.target.value) })}
                    className="admin-input"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Regulation</label>
                  <select
                    value={newSub.regulation}
                    onChange={(e) => setNewSub({ ...newSub, regulation: e.target.value })}
                    className="admin-input font-bold text-blue-800"
                  >
                    <option value="R2021">R2021</option>
                    <option value="R2025">R2025</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Course</label>
                  <select
                    value={newSub.course_id}
                    onChange={(e) => setNewSub({ ...newSub, course_id: parseInt(e.target.value) })}
                    className="admin-input"
                  >
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.short_name} ({c.degree})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-2">
                <Plus size={16} /> Save Subject
              </button>
            </form>
          </div>

          <div className="admin-table-card">
            <h3>Subject Catalog ({subjects.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Credits</th>
                    <th>Sem</th>
                    <th>Reg</th>
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => (
                    <tr key={sub.subject_id}>
                      <td className="font-mono font-bold text-blue-900">{sub.subject_code}</td>
                      <td>{sub.subject_name}</td>
                      <td className="text-center font-bold">{sub.credits}</td>
                      <td className="text-center">{sub.semester}</td>
                      <td className="text-center font-semibold text-xs text-blue-800">{sub.regulation}</td>
                      <td className="text-xs text-gray-600">{sub.course_id === 1 ? 'CSE' : 'IT'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
