import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { User, Award, Save, RefreshCw, CheckCircle, AlertCircle, Calendar, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Results() {
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [selectedReg, setSelectedReg] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semester, setSemester] = useState(1);

  const [subjects, setSubjects] = useState([]);
  const [gradeScale, setGradeScale] = useState([]);
  const [marksState, setMarksState] = useState({}); // { subject_id: { grade_letter, grade_point, is_pass } }
  const [savedResults, setSavedResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Students assigned to logged-in user
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedReg(res.data[0].reg_no);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    }
  };

  // 2. Fetch selected Student details + Grade Scale
  useEffect(() => {
    if (!selectedReg) return;
    const stu = students.find((s) => s.reg_no === selectedReg);
    if (stu) {
      setSelectedStudent(stu);
      fetchGradeScale(stu.regulation);
      fetchHistoricalResults(stu.reg_no);
    }
  }, [selectedReg, students]);

  const fetchGradeScale = async (regulation) => {
    try {
      const res = await API.get(`/grade-scale?regulation=${regulation}`);
      setGradeScale(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistoricalResults = async (reg_no) => {
    try {
      const res = await API.get(`/results/${reg_no}`);
      setSavedResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Fetch Subjects & existing Marks when Student or Semester changes
  useEffect(() => {
    if (selectedStudent && semester) {
      fetchSubjectsAndMarks();
    }
  }, [selectedStudent, semester]);

  const fetchSubjectsAndMarks = async () => {
    setLoading(true);
    try {
      // Fetch subjects for course, sem, regulation
      const subRes = await API.get(
        `/subjects?course_id=${selectedStudent.course_id}&semester=${semester}&regulation=${selectedStudent.regulation}`
      );
      setSubjects(subRes.data);

      // Fetch existing marks
      const markRes = await API.get(`/marks?reg_no=${selectedStudent.reg_no}&semester=${semester}`);
      
      const initialMarks = {};
      subRes.data.forEach((sub) => {
        const existing = markRes.data.find((m) => m.subject_id === sub.subject_id);
        if (existing) {
          initialMarks[sub.subject_id] = {
            grade_letter: existing.grade_letter,
            grade_point: existing.grade_point,
            is_pass: existing.is_pass,
            attempt: existing.attempt || 1,
          };
        } else {
          // Default unassigned
          initialMarks[sub.subject_id] = {
            grade_letter: '',
            grade_point: 0.0,
            is_pass: true,
            attempt: 1,
          };
        }
      });
      setMarksState(initialMarks);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load semester subjects or marks');
    } finally {
      setLoading(false);
    }
  };

  // Grade selection change handler
  const handleGradeChange = (subject_id, letter) => {
    const scale = gradeScale.find((g) => g.grade_letter === letter);
    setMarksState((prev) => ({
      ...prev,
      [subject_id]: {
        ...prev[subject_id],
        grade_letter: letter,
        grade_point: scale ? scale.grade_point : 0.0,
        is_pass: scale ? scale.is_pass : true,
      },
    }));
  };

  // Calculate live SGPA
  const calculateLiveSGPA = () => {
    let totalCP = 0;
    let totalCR = 0;
    subjects.forEach((sub) => {
      const m = marksState[sub.subject_id];
      if (m && m.grade_letter) {
        totalCP += sub.credits * m.grade_point;
        totalCR += sub.credits;
      }
    });
    return totalCR > 0 ? (totalCP / totalCR).toFixed(2) : '0.00';
  };

  const calculateTotalCredits = () => {
    return subjects.reduce((acc, sub) => acc + sub.credits, 0);
  };

  // Save marks to API
  const handleSaveMarks = async () => {
    const markList = [];
    for (const sub of subjects) {
      const m = marksState[sub.subject_id];
      if (!m || !m.grade_letter) {
        toast.error(`Please select grade for ${sub.subject_code}`);
        return;
      }
      markList.push({
        subject_id: sub.subject_id,
        grade_letter: m.grade_letter,
        grade_point: m.grade_point,
        attempt: m.attempt || 1,
        is_pass: m.is_pass,
      });
    }

    setSaving(true);
    try {
      const payload = {
        reg_no: selectedStudent.reg_no,
        semester: semester,
        marks: markList,
      };
      const res = await API.post('/marks', payload);
      toast.success(`Marks saved successfully! SGPA: ${res.data.sgpa}`);
      fetchHistoricalResults(selectedStudent.reg_no);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="results-container">
      {/* Controls Bar */}
      <div className="controls-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="text-blue-700" size={20} />
            <label className="font-semibold text-gray-700">Select Student:</label>
            <select
              value={selectedReg}
              onChange={(e) => setSelectedReg(e.target.value)}
              className="student-select"
            >
              {students.map((s) => (
                <option key={s.reg_no} value={s.reg_no}>
                  {s.reg_no} - {s.name} ({s.course?.short_name || 'UG'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800">
              Regulation: {selectedStudent?.regulation || 'R2021'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
              Batch: {selectedStudent?.batch_year || 2024}
            </span>
          </div>
        </div>
      </div>

      {/* Student Info Banner */}
      {selectedStudent && (
        <div className="student-card">
          <div className="student-card-grid">
            <div>
              <p className="label">Student Name</p>
              <p className="val">{selectedStudent.name}</p>
            </div>
            <div>
              <p className="label">Register Number</p>
              <p className="val font-mono">{selectedStudent.reg_no}</p>
            </div>
            <div>
              <p className="label">Degree & Course</p>
              <p className="val">{selectedStudent.course?.course_name || 'B.E. Computer Science'}</p>
            </div>
            <div>
              <p className="label">Section / Regulation</p>
              <p className="val">Section {selectedStudent.section} | {selectedStudent.regulation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Semester Tab Switcher */}
      <div className="sem-tabs-bar">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => (
          <button
            key={semNum}
            onClick={() => setSemester(semNum)}
            className={`sem-tab ${semester === semNum ? 'active' : ''}`}
          >
            Semester {semNum}
          </button>
        ))}
      </div>

      {/* Results Table & Grade Entry */}
      <div className="table-card">
        <div className="table-header-title">
          <h3>
            <Award className="inline mr-2 text-blue-700" size={20} />
            Semester {semester} Result Entry Sheet ({selectedStudent?.regulation || 'R2021'})
          </h3>
          <span className="text-sm text-gray-500 font-normal">
            Grading Scale: {selectedStudent?.regulation === 'R2025' ? 'Absolute (S, A+, A, B+, B, C+, C, U)' : 'Relative (O, A+, A, B+, B, C, U)'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading subjects and marks data...</div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No subjects configured for Semester {semester} ({selectedStudent?.regulation}) yet. Use Admin Panel to add subjects.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Subject Code</th>
                    <th>Subject Title</th>
                    <th>Credits</th>
                    <th>Type</th>
                    <th>Grade Letter</th>
                    <th>Grade Point</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub, idx) => {
                    const mark = marksState[sub.subject_id] || { grade_letter: '', grade_point: 0, is_pass: true };
                    return (
                      <tr key={sub.subject_id}>
                        <td className="text-center font-medium">{idx + 1}</td>
                        <td className="font-mono font-bold text-blue-900">{sub.subject_code}</td>
                        <td className="font-medium text-gray-800">{sub.subject_name}</td>
                        <td className="text-center font-semibold">{sub.credits}</td>
                        <td className="text-center text-xs">
                          <span className={`px-2 py-0.5 rounded ${sub.subject_type === 'Theory' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {sub.subject_type}
                          </span>
                        </td>
                        <td className="text-center">
                          <select
                            value={mark.grade_letter}
                            onChange={(e) => handleGradeChange(sub.subject_id, e.target.value)}
                            className="grade-select"
                          >
                            <option value="">-- Select Grade --</option>
                            {gradeScale.map((g) => (
                              <option key={g.id} value={g.grade_letter}>
                                {g.grade_letter} ({g.grade_point} pts)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center font-mono font-bold text-gray-800">
                          {mark.grade_letter ? mark.grade_point : '—'}
                        </td>
                        <td className="text-center">
                          {mark.grade_letter ? (
                            mark.is_pass ? (
                              <span className="status-pass">PASS</span>
                            ) : (
                              <span className="status-fail">RE-APPEAR</span>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Calculation Bar */}
            <div className="table-footer-bar">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-600 text-sm">Total Semester Credits: </span>
                  <span className="font-bold text-gray-800 text-base">{calculateTotalCredits()}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Calculated SGPA: </span>
                  <span className="font-bold text-blue-800 text-xl font-mono">{calculateLiveSGPA()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSubjectsAndMarks}
                  className="btn-secondary"
                  disabled={saving}
                >
                  <RefreshCw size={16} /> Reset
                </button>
                <button
                  onClick={handleSaveMarks}
                  className="btn-primary"
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save & Calculate Results'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Historical SGPA / CGPA Summary */}
      {savedResults.length > 0 && (
        <div className="history-summary-card">
          <h4>Cumulative Academic Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            {savedResults.map((r) => (
              <div key={r.semester} className="summary-stat-box">
                <div className="text-xs text-gray-500 font-semibold">SEMESTER {r.semester}</div>
                <div className="text-2xl font-bold font-mono text-blue-900 mt-1">SGPA: {r.sgpa}</div>
                <div className="text-xs text-gray-600 mt-1">CGPA: {r.cgpa} | Credits: {r.total_credits}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
