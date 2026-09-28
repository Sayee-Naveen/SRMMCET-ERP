import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { User, Award, Save, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { sortData, SortHeader } from '../utils/sortUtils';

export default function Results() {
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [selectedReg, setSelectedReg] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semester, setSemester] = useState(1);

  const [sheetItems, setSheetItems] = useState([]);
  const [gradeScale, setGradeScale] = useState([]);
  const [marksState, setMarksState] = useState({});
  const [savedResults, setSavedResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sorting for sheet table
  const [sheetSort, setSheetSort] = useState({ key: null, dir: 'asc' });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      setStudents(res.data);
      if (res.data.length > 0) setSelectedReg(res.data[0].reg_no);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    }
  };

  useEffect(() => {
    if (!selectedReg) return;
    const stu = students.find(s => s.reg_no === selectedReg);
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
    } catch (err) { console.error(err); }
  };

  const fetchHistoricalResults = async (reg_no) => {
    try {
      const res = await API.get(`/results/${reg_no}`);
      setSavedResults(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (selectedStudent && semester) fetchSemesterSheet();
  }, [selectedStudent, semester]);

  const fetchSemesterSheet = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/semester-sheet?reg_no=${selectedStudent.reg_no}&semester=${semester}`);
      setSheetItems(res.data);
      const initialMarks = {};
      res.data.forEach(item => {
        initialMarks[item.subject_id] = {
          grade_letter: item.grade_letter || '',
          grade_point: item.grade_point || 0.0,
          is_pass: item.is_pass,
          attempt: item.attempt || 1,
        };
      });
      setMarksState(initialMarks);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load semester evaluation sheet');
    } finally { setLoading(false); }
  };

  const handleGradeChange = (subject_id, letter) => {
    const scale = gradeScale.find(g => g.grade_letter === letter);
    setMarksState(prev => ({
      ...prev,
      [subject_id]: {
        ...prev[subject_id],
        grade_letter: letter,
        grade_point: scale ? scale.grade_point : 0.0,
        is_pass: scale ? scale.is_pass : (letter !== 'U' && letter !== 'SA' && letter !== 'WH' && letter !== 'WC'),
      },
    }));
  };

  const calculateLiveSGPA = () => {
    let totalCP = 0, totalCR = 0;
    sheetItems.forEach(item => {
      const m = marksState[item.subject_id];
      if (m && m.grade_letter) { totalCP += item.credits * m.grade_point; totalCR += item.credits; }
    });
    return totalCR > 0 ? (totalCP / totalCR).toFixed(2) : '0.00';
  };

  const calculateTotalCredits = () => sheetItems.reduce((acc, item) => acc + item.credits, 0);

  const handleSaveMarks = async () => {
    const markList = [];
    for (const item of sheetItems) {
      const m = marksState[item.subject_id];
      if (!m || !m.grade_letter) { toast.error(`Please select grade for ${item.subject_code}`); return; }
      markList.push({ subject_id: item.subject_id, grade_letter: m.grade_letter, grade_point: m.grade_point, attempt: item.attempt, is_pass: m.is_pass });
    }
    setSaving(true);
    try {
      const res = await API.post('/marks', { reg_no: selectedStudent.reg_no, semester, marks: markList });
      toast.success(`Marks saved! SGPA: ${res.data.sgpa} | CGPA: ${res.data.cgpa}`);
      fetchHistoricalResults(selectedStudent.reg_no);
      fetchSemesterSheet();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save marks');
    } finally { setSaving(false); }
  };

  const toggleSheetSort = (key) => {
    setSheetSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const arrearCount = sheetItems.filter(i => i.is_arrear).length;

  // Sort sheet items — keep arrears after regulars by default unless user explicitly sorts
  const sortedSheetItems = sheetSort.key
    ? sortData(sheetItems, sheetSort.key, sheetSort.dir)
    : [...sheetItems].sort((a, b) => {
        if (a.is_arrear === b.is_arrear) return 0;
        return a.is_arrear ? 1 : -1; // regulars first
      });

  const categoryColor = (cat) => {
    const map = {
      'Core': 'bg-blue-50 text-blue-700',
      'Honors': 'bg-purple-100 text-purple-800',
      'Minors': 'bg-indigo-100 text-indigo-800',
      'Naan Mudhalvan': 'bg-orange-100 text-orange-800',
      'Internship': 'bg-teal-100 text-teal-800',
      'Project': 'bg-emerald-100 text-emerald-800',
      'Open Elective': 'bg-yellow-100 text-yellow-800',
      'Professional Elective': 'bg-cyan-100 text-cyan-800',
    };
    return map[cat] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="results-container">
      {/* Controls Bar */}
      <div className="controls-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="text-blue-700" size={20} />
            <label className="font-semibold text-gray-700">Select Student:</label>
            <select value={selectedReg} onChange={e => setSelectedReg(e.target.value)} className="student-select">
              {students.map(s => (
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
            {arrearCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <AlertTriangle size={14} /> {arrearCount} Active Arrear{arrearCount > 1 ? 's' : ''} Carried Over
              </span>
            )}
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
        {[1, 2, 3, 4, 5, 6, 7, 8].map(semNum => (
          <button key={semNum} onClick={() => setSemester(semNum)} className={`sem-tab ${semester === semNum ? 'active' : ''}`}>
            Semester {semNum}
          </button>
        ))}
      </div>

      {/* Results Table & Grade Entry */}
      <div className="table-card">
        <div className="table-header-title flex justify-between items-center">
          <div>
            <h3>
              <Award className="inline mr-2 text-blue-700" size={20} />
              Semester {semester} Evaluation Sheet ({selectedStudent?.regulation || 'R2021'})
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Regular subjects + active arrear subjects carried over from earlier semesters (Anna University Standard). Click column headers to sort.
            </p>
          </div>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded">
            Scale: {selectedStudent?.regulation === 'R2025' ? 'Absolute (S, A+, A, B+, B, C+, C, U)' : 'Relative (O, A+, A, B+, B, C, U)'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading semester subjects and carryover arrears...</div>
        ) : sheetItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No subjects configured for Semester {semester} ({selectedStudent?.regulation}) yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <SortHeader label="Code" sortKey="subject_code" currentKey={sheetSort.key} direction={sheetSort.dir} onSort={toggleSheetSort} />
                    <SortHeader label="Subject Title" sortKey="subject_name" currentKey={sheetSort.key} direction={sheetSort.dir} onSort={toggleSheetSort} />
                    <SortHeader label="Category" sortKey="category" currentKey={sheetSort.key} direction={sheetSort.dir} onSort={toggleSheetSort} />
                    <SortHeader label="Credits" sortKey="credits" currentKey={sheetSort.key} direction={sheetSort.dir} onSort={toggleSheetSort} />
                    <SortHeader label="Orig Sem" sortKey="original_semester" currentKey={sheetSort.key} direction={sheetSort.dir} onSort={toggleSheetSort} />
                    <SortHeader label="Attempt" sortKey="attempt" currentKey={sheetSort.key} direction={sheetSort.dir} onSort={toggleSheetSort} />
                    <th>Grade Letter</th>
                    <th>Grade Point</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSheetItems.map((item, idx) => {
                    const mark = marksState[item.subject_id] || { grade_letter: '', grade_point: 0, is_pass: true };
                    return (
                      <tr key={item.subject_id} className={item.is_arrear ? 'bg-amber-50/60' : ''}>
                        <td className="text-center font-medium">{idx + 1}</td>
                        <td className="font-mono font-bold text-blue-900">{item.subject_code}</td>
                        <td className="font-medium text-gray-800">
                          {item.subject_name}
                          {item.is_arrear && (
                            <div className="text-xs text-amber-700 font-semibold mt-0.5">
                              ⚠️ Arrear from Semester {item.original_semester} (Attempt {item.attempt})
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          {item.is_arrear ? (
                            <span className="px-2 py-0.5 rounded font-bold text-xs bg-amber-100 text-amber-900 border border-amber-300">ARREAR</span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded font-medium text-xs ${categoryColor(item.category)}`}>
                              {item.category || 'Regular'}
                            </span>
                          )}
                        </td>
                        <td className="text-center font-semibold">{item.credits}</td>
                        <td className="text-center text-xs text-gray-500">{item.original_semester || item.semester || semester}</td>
                        <td className="text-center font-mono font-bold text-xs">
                          <span className={`px-2 py-0.5 rounded ${item.attempt > 1 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            Attempt {item.attempt}
                          </span>
                        </td>
                        <td className="text-center">
                          <select value={mark.grade_letter} onChange={e => handleGradeChange(item.subject_id, e.target.value)} className="grade-select">
                            <option value="">-- Grade --</option>
                            {gradeScale.map(g => (
                              <option key={g.id} value={g.grade_letter}>{g.grade_letter} ({g.grade_point} pts)</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center font-mono font-bold text-gray-800">
                          {mark.grade_letter ? mark.grade_point : '—'}
                        </td>
                        <td className="text-center">
                          {mark.grade_letter ? (
                            mark.is_pass ? (
                              <span className="status-pass flex items-center justify-center gap-1">
                                <CheckCircle2 size={12} /> PASS
                              </span>
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
                  <span className="text-gray-600 text-sm">Exam Credits: </span>
                  <span className="font-bold text-gray-800 text-base">{calculateTotalCredits()}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Current SGPA: </span>
                  <span className="font-bold text-blue-800 text-xl font-mono">{calculateLiveSGPA()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchSemesterSheet} className="btn-secondary" disabled={saving}>
                  <RefreshCw size={16} /> Reset
                </button>
                <button onClick={handleSaveMarks} className="btn-primary" disabled={saving}>
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
            {savedResults.map(r => (
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
