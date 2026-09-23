import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { BookOpen, Users, UserCheck, ShieldAlert, Plus, Edit, Trash, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('subjects');

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [sections, setSections] = useState([]);

  // Form states
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

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [cRes, subRes, stRes, fRes, secRes] = await Promise.all([
        API.get('/admin/courses'),
        API.get('/admin/subjects'),
        API.get('/admin/students'),
        API.get('/admin/faculty'),
        API.get('/admin/sections'),
      ]);
      setCourses(cRes.data);
      setSubjects(subRes.data);
      setStudents(stRes.data);
      setFacultyList(fRes.data);
      setSections(secRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin management data');
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/subjects', newSub);
      toast.success(`Subject ${newSub.subject_code} added successfully!`);
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
      console.error(err);
      toast.error('Failed to add subject');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/students', newStudent);
      toast.success(`Student ${newStudent.name} added!`);
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
      console.error(err);
      toast.error('Failed to create student');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header-card">
        <h2>🛠️ Admin Management Control Panel</h2>
        <p>Manually configure courses, subjects, regulations, faculty, and student sections.</p>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`admin-tab ${activeTab === 'subjects' ? 'active' : ''}`}
        >
          <BookOpen size={16} /> Manage Subjects
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`admin-tab ${activeTab === 'students' ? 'active' : ''}`}
        >
          <Users size={16} /> Manage Students
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`admin-tab ${activeTab === 'faculty' ? 'active' : ''}`}
        >
          <UserCheck size={16} /> Faculty & Sections
        </button>
      </div>

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="admin-section-grid">
          {/* Add Form */}
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
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Subject Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
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
                    className="admin-input"
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

          {/* Subjects Table */}
          <div className="admin-table-card">
            <h3>Subject Catalog ({subjects.length} entries)</h3>
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

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="admin-section-grid">
          {/* Add Student Form */}
          <div className="admin-form-card">
            <h3>Create Student Record</h3>
            <form onSubmit={handleAddStudent} className="space-y-3 mt-3">
              <div>
                <label className="admin-label">Register Number (12 digits)</label>
                <input
                  type="text"
                  placeholder="e.g. 911124104005"
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
                  placeholder="e.g. Vignesh R"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Regulation (Admin set)</label>
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
                <Plus size={16} /> Save Student Record
              </button>
            </form>
          </div>

          {/* Students List */}
          <div className="admin-table-card">
            <h3>Registered Students ({students.length})</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Regulation</th>
                    <th>Batch</th>
                    <th>Sem</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.student_id}>
                      <td className="font-mono font-bold text-blue-900">{st.reg_no}</td>
                      <td>{st.name}</td>
                      <td className="text-center font-bold text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">
                        {st.regulation}
                      </td>
                      <td className="text-center">{st.batch_year}</td>
                      <td className="text-center">{st.current_sem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY & SECTIONS TAB */}
      {activeTab === 'faculty' && (
        <div className="admin-section-grid">
          <div className="admin-table-card w-full">
            <h3>Faculty Accounts & Section Assignments</h3>
            <div className="overflow-x-auto mt-3">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Department</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.map((f) => (
                    <tr key={f.faculty_id}>
                      <td className="font-mono font-bold text-blue-900">{f.username}</td>
                      <td>{f.full_name}</td>
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
    </div>
  );
}
