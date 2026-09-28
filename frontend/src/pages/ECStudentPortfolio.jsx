import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ECCertificateModal from '../components/ECCertificateModal';
import {
  User, Award, FileCheck, Printer, ArrowLeft, FolderOpen, ListFilter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ECStudentPortfolio() {
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [selectedReg, setSelectedReg] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedActivityForCert, setSelectedActivityForCert] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students?all_students=true');
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedReg(res.data[0].reg_no);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    }
  };

  useEffect(() => {
    if (selectedReg) {
      fetchStudentPortfolio(selectedReg);
    }
  }, [selectedReg]);

  const fetchStudentPortfolio = async (regNo) => {
    setLoading(true);
    try {
      const res = await API.get(`/ec/portfolio/${regNo}`);
      setPortfolio(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student portfolio');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Sports': return 'badge-sports';
      case 'Cultural': return 'badge-cultural';
      case 'Clubs': return 'badge-clubs';
      case 'NSS/NCC': return 'badge-nss';
      case 'Music': return 'badge-music';
      case 'Dance': return 'badge-dance';
      case 'Literary': return 'badge-literary';
      case 'Social Service': return 'badge-social';
      default: return 'badge-clubs';
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/extra-curricular" className="text-blue-700 hover:text-blue-900 text-xs font-semibold flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Overview
            </Link>
          </div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-blue-800" size={22} /> Student Extra-Curricular Portfolio & Transcript
          </h2>
          <p className="text-xs text-gray-500">
            Official accreditation record of student achievements, awards and certificates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/extra-curricular/activities" className="btn-secondary text-xs">
            <ListFilter size={15} /> All Activities
          </Link>
          <Link to="/extra-curricular/certificates" className="btn-secondary text-xs">
            <FolderOpen size={15} /> Certificate Vault
          </Link>
        </div>
      </div>

      {/* Student Selector Card */}
      <div className="card mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="text-blue-700" size={20} />
            <label className="font-semibold text-gray-700 text-sm">Select Student Profile:</label>
            <select
              value={selectedReg}
              onChange={(e) => setSelectedReg(e.target.value)}
              className="form-input text-xs font-medium max-w-xs"
            >
              {students.map((s) => (
                <option key={s.reg_no} value={s.reg_no}>
                  {s.reg_no} - {s.name} ({s.course?.short_name || 'UG'} Sec-{s.section}) [{s.regulation}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs"
            >
              <Printer size={15} /> Print Transcript
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800">
              Regulation: {portfolio?.student?.regulation || 'R2021'}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-500">Loading student portfolio...</div>
      ) : portfolio && (
        <>
          {/* Student Info Banner */}
          <div className="student-card mb-4">
            <div className="student-card-grid">
              <div>
                <p className="label">Student Name</p>
                <p className="val">{portfolio.student.name}</p>
              </div>
              <div>
                <p className="label">Register Number</p>
                <p className="val font-mono text-blue-900">{portfolio.student.reg_no}</p>
              </div>
              <div>
                <p className="label">Department & Degree</p>
                <p className="val">
                  {portfolio.student.course?.degree || 'B.Tech'} {portfolio.student.course?.short_name || 'CSE'}
                </p>
              </div>
              <div>
                <p className="label">Regulation / Section</p>
                <p className="val">{portfolio.student.regulation} | Sec {portfolio.student.section}</p>
              </div>
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="card p-3 text-center border-l-4 border-l-blue-600">
              <div className="text-xs text-gray-500 font-semibold">Total Participations</div>
              <div className="text-xl font-extrabold text-gray-900 mt-1">{portfolio.total_activities}</div>
            </div>
            <div className="card p-3 text-center border-l-4 border-l-emerald-600">
              <div className="text-xs text-gray-500 font-semibold">Certificates Attached</div>
              <div className="text-xl font-extrabold text-emerald-800 mt-1">{portfolio.total_certificates}</div>
            </div>
            <div className="card p-3 text-center border-l-4 border-l-amber-500">
              <div className="text-xs text-gray-500 font-semibold">Podium & Honors</div>
              <div className="text-xl font-extrabold text-amber-700 mt-1">{portfolio.total_awards}</div>
            </div>
          </div>

          {/* Activities List / Transcript */}
          <div className="table-card">
            <div className="table-header-title">
              <h3>
                <Award className="inline mr-2 text-blue-700" size={20} />
                Extra-Curricular Student Transcript & Portfolio Record
              </h3>
              <span className="text-xs text-gray-400">
                Official accreditation record for student achievements
              </span>
            </div>

            {portfolio.activities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No extra-curricular activities recorded for this student yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Date</th>
                      <th>Regulation</th>
                      <th>Domain</th>
                      <th>Activity / Event</th>
                      <th>Organizer</th>
                      <th>Standing / Role</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.activities.map((act, idx) => (
                      <tr key={act.id}>
                        <td className="text-center font-medium text-xs">{idx + 1}</td>
                        <td className="text-xs text-gray-500 whitespace-nowrap">{act.event_date}</td>
                        <td>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {act.regulation || 'R2021'}
                          </span>
                        </td>
                        <td>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getCategoryBadgeClass(act.category)}`}>
                            {act.category}
                          </span>
                        </td>
                        <td>
                          <div className="font-bold text-gray-900 text-xs">{act.title}</div>
                          <div className="text-[10px] text-gray-500">{act.sub_category} • {act.level}</div>
                        </td>
                        <td className="text-xs text-gray-700">{act.organizer}</td>
                        <td>
                          <div className="font-bold text-amber-800 text-xs">{act.achievement}</div>
                          <div className="text-[10px] text-gray-400">{act.role}</div>
                        </td>
                        <td>
                          {act.certificates && act.certificates.length > 0 ? (
                            <button
                              onClick={() => setSelectedActivityForCert(act)}
                              className="btn-secondary text-[11px] py-0.5 px-2 text-blue-700 hover:text-blue-900 flex items-center gap-1"
                            >
                              <FileCheck size={12} /> View
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Certificate Viewer Modal */}
      {selectedActivityForCert && (
        <ECCertificateModal
          activity={selectedActivityForCert}
          onClose={() => setSelectedActivityForCert(null)}
        />
      )}
    </div>
  );
}
