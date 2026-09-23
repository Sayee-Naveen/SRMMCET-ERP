import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
  getMedicalRecords, createMedicalRecord, deleteMedicalRecord,
  getDisciplinaryActions, createDisciplinaryAction, updateDisciplinaryStatus, deleteDisciplinaryAction,
  uploadFile
} from '../api/medicalDisciplinaryApi';
import toast from 'react-hot-toast';
import {
  Heart, AlertTriangle, Plus, FileText, CheckCircle, ShieldAlert,
  Search, User, Calendar, Trash2, Eye, X, Upload, Activity, Clock
} from 'lucide-react';

export default function MedicalDisciplinary() {
  const { user } = useContext(AuthContext);

  // Student selection state
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('medical'); // 'medical' or 'disciplinary'

  // Data states
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [disciplinaryActions, setDisciplinaryActions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showDisciplinaryModal, setShowDisciplinaryModal] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState('');

  // Medical Form State
  const [medicalForm, setMedicalForm] = useState({
    record_type: 'Routine Checkup',
    incident_date: new Date().toISOString().split('T')[0],
    diagnosis_details: '',
    doctor_hospital_name: '',
    treatment_prescribed: '',
    document_url: ''
  });
  const [submittingMedical, setSubmittingMedical] = useState(false);

  // Disciplinary Form State
  const [disciplinaryForm, setDisciplinaryForm] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    action_date: new Date().toISOString().split('T')[0],
    category: 'Attendance Shortage',
    report_description: '',
    action_taken: 'Written Warning',
    status: 'Active',
    supporting_doc_url: ''
  });
  const [submittingDisciplinary, setSubmittingDisciplinary] = useState(false);

  // Fetch initial student list
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await API.get('/students');
      setStudents(res.data);
      if (res.data.length > 0) {
        setSelectedStudentId(res.data[0].student_id);
        setSelectedStudent(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load student directory');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch records when selected student or tab changes
  useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(s => s.student_id === parseInt(selectedStudentId));
      setSelectedStudent(student || null);
      fetchRecords(selectedStudentId);
    }
  }, [selectedStudentId, activeTab]);

  const fetchRecords = async (studentId) => {
    setLoadingData(true);
    try {
      if (activeTab === 'medical') {
        const data = await getMedicalRecords(studentId);
        setMedicalRecords(data);
      } else {
        const data = await getDisciplinaryActions(studentId);
        setDisciplinaryActions(data);
      }
    } catch (err) {
      toast.error(`Failed to load ${activeTab} records`);
    } finally {
      setLoadingData(false);
    }
  };

  // Handle Medical Record submission
  const handleCreateMedical = async (e) => {
    e.preventDefault();
    if (!medicalForm.diagnosis_details || medicalForm.diagnosis_details.length < 5) {
      toast.error('Diagnosis details must be at least 5 characters');
      return;
    }
    setSubmittingMedical(true);
    try {
      await createMedicalRecord(selectedStudentId, medicalForm);
      toast.success('Medical record added successfully');
      setShowMedicalModal(false);
      setMedicalForm({
        record_type: 'Routine Checkup',
        incident_date: new Date().toISOString().split('T')[0],
        diagnosis_details: '',
        doctor_hospital_name: '',
        treatment_prescribed: '',
        document_url: ''
      });
      fetchRecords(selectedStudentId);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save medical record');
    } finally {
      setSubmittingMedical(false);
    }
  };

  // Handle Disciplinary Action submission
  const handleCreateDisciplinary = async (e) => {
    e.preventDefault();
    if (!disciplinaryForm.report_description || disciplinaryForm.report_description.length < 5) {
      toast.error('Report description must be at least 5 characters');
      return;
    }
    setSubmittingDisciplinary(true);
    try {
      await createDisciplinaryAction(selectedStudentId, disciplinaryForm);
      toast.success('Disciplinary action logged successfully');
      setShowDisciplinaryModal(false);
      setDisciplinaryForm({
        incident_date: new Date().toISOString().split('T')[0],
        action_date: new Date().toISOString().split('T')[0],
        category: 'Attendance Shortage',
        report_description: '',
        action_taken: 'Written Warning',
        status: 'Active',
        supporting_doc_url: ''
      });
      fetchRecords(selectedStudentId);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save disciplinary action');
    } finally {
      setSubmittingDisciplinary(false);
    }
  };

  // File uploader handler for modals
  const handleFileUpload = async (e, fieldSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      fieldSetter(res.url);
      toast.success('Supporting document uploaded');
    } catch (err) {
      toast.error('File upload failed');
    }
  };

  // Status Updater
  const handleStatusChange = async (actionId, newStatus) => {
    try {
      await updateDisciplinaryStatus(actionId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchRecords(selectedStudentId);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Delete handlers
  const handleDeleteMedical = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;
    try {
      await deleteMedicalRecord(id);
      toast.success('Record deleted');
      fetchRecords(selectedStudentId);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleDeleteDisciplinary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disciplinary record?')) return;
    try {
      await deleteDisciplinaryAction(id);
      toast.success('Record deleted');
      fetchRecords(selectedStudentId);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // Filtering
  const filteredMedical = medicalRecords.filter(r =>
    r.diagnosis_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctor_hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.record_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDisciplinary = disciplinaryActions.filter(a =>
    a.report_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.action_taken?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="medical-disciplinary-container max-w-7xl mx-auto p-4 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-indigo-600" size={24} />
            Student Medical & Disciplinary Records Module
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain medical leaves, health reports, infractions, and sanction reports.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <User size={18} className="text-slate-500" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Select Student</span>
            {loadingStudents ? (
              <span className="text-xs text-slate-400">Loading student directory...</span>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.name} ({s.reg_no}) - {s.section}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Selected Student Information Summary Strip */}
      {selectedStudent && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-800 text-white p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-lg border-2 border-indigo-400">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base">{selectedStudent.name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 mt-0.5">
                <span>Reg No: <strong>{selectedStudent.reg_no}</strong></span>
                <span>•</span>
                <span>Batch: <strong>{selectedStudent.batch_year}</strong></span>
                <span>•</span>
                <span>Regulation: <strong>{selectedStudent.regulation}</strong></span>
                <span>•</span>
                <span>Sem: <strong>{selectedStudent.current_sem}</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle size={12} /> Record Active
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('medical')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'medical'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart size={16} className={activeTab === 'medical' ? 'text-red-500 fill-red-100' : ''} />
            Medical Records ({medicalRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('disciplinary')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'disciplinary'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert size={16} className={activeTab === 'disciplinary' ? 'text-amber-500' : ''} />
            Disciplinary Actions ({disciplinaryActions.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Add Button */}
          {activeTab === 'medical' ? (
            <button
              onClick={() => setShowMedicalModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus size={16} /> Log Medical Record
            </button>
          ) : (
            <button
              onClick={() => setShowDisciplinaryModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus size={16} /> Log Disciplinary Action
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Contents */}
      {loadingData ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading records data...
        </div>
      ) : activeTab === 'medical' ? (
        /* MEDICAL TAB CONTENT */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredMedical.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Heart size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No medical records found</p>
              <p className="text-xs text-slate-400">Click "Log Medical Record" above to record a new medical entry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 font-bold">Type</th>
                    <th className="p-3 font-bold">Incident Date</th>
                    <th className="p-3 font-bold">Diagnosis / Condition</th>
                    <th className="p-3 font-bold">Hospital / Doctor</th>
                    <th className="p-3 font-bold">Treatment Prescribed</th>
                    <th className="p-3 font-bold">Attachment</th>
                    <th className="p-3 font-bold">Recorded By</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredMedical.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-block tracking-wider ${
                          r.record_type === 'Emergency' ? 'bg-red-100 text-red-700 border border-red-200' :
                          r.record_type === 'Medical Leave' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          r.record_type === 'Chronic Condition' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {r.record_type}
                        </span>
                      </td>
                      <td className="p-3 font-medium whitespace-nowrap">{r.incident_date}</td>
                      <td className="p-3 max-w-xs">{r.diagnosis_details}</td>
                      <td className="p-3">{r.doctor_hospital_name || 'N/A'}</td>
                      <td className="p-3 max-w-xs">{r.treatment_prescribed || 'N/A'}</td>
                      <td className="p-3 whitespace-nowrap">
                        {r.document_url ? (
                          <button
                            onClick={() => setPreviewDocUrl(r.document_url)}
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 text-[11px] inline-flex items-center gap-1 font-medium"
                          >
                            <FileText size={12} /> Document
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">{r.recorded_by || 'System'}</td>
                      <td className="p-3 text-right">
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteMedical(r.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition rounded"
                            title="Delete Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* DISCIPLINARY TAB CONTENT */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredDisciplinary.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <ShieldAlert size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No disciplinary actions logged</p>
              <p className="text-xs text-slate-400">Click "Log Disciplinary Action" to add an infraction record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 font-bold">Category</th>
                    <th className="p-3 font-bold">Incident Date</th>
                    <th className="p-3 font-bold">Action Date</th>
                    <th className="p-3 font-bold">Incident Description</th>
                    <th className="p-3 font-bold">Action Taken</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Supporting Document</th>
                    <th className="p-3 font-bold">Logged By</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredDisciplinary.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">{a.category}</td>
                      <td className="p-3 whitespace-nowrap">{a.incident_date}</td>
                      <td className="p-3 whitespace-nowrap">{a.action_date}</td>
                      <td className="p-3 max-w-xs">{a.report_description}</td>
                      <td className="p-3 font-medium text-amber-900 bg-amber-50/50 rounded">{a.action_taken}</td>
                      <td className="p-3">
                        <select
                          value={a.status}
                          onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                            a.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            a.status === 'Revoked' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                            a.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Pending Review">Pending Review</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Revoked">Revoked</option>
                        </select>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {a.supporting_doc_url ? (
                          <button
                            onClick={() => setPreviewDocUrl(a.supporting_doc_url)}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border rounded text-[10px] font-medium"
                          >
                            Report Doc
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">{a.recorded_by || 'Committee'}</td>
                      <td className="p-3 text-right">
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteDisciplinary(a.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition rounded"
                            title="Delete Action"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE MEDICAL RECORD MODAL */}
      {showMedicalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Heart size={20} className="text-red-500" /> Log Medical Record
              </h3>
              <button onClick={() => setShowMedicalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMedical} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Record Type *</label>
                  <select
                    value={medicalForm.record_type}
                    onChange={(e) => setMedicalForm({ ...medicalForm, record_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Chronic Condition">Chronic Condition</option>
                    <option value="Allergy Notice">Allergy Notice</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Incident Date *</label>
                  <input
                    type="date"
                    value={medicalForm.incident_date}
                    onChange={(e) => setMedicalForm({ ...medicalForm, incident_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 mb-1 block">Diagnosis / Symptoms / Condition *</label>
                <textarea
                  rows={3}
                  value={medicalForm.diagnosis_details}
                  onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis_details: e.target.value })}
                  placeholder="Enter medical details..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Doctor / Hospital Name</label>
                  <input
                    type="text"
                    value={medicalForm.doctor_hospital_name}
                    onChange={(e) => setMedicalForm({ ...medicalForm, doctor_hospital_name: e.target.value })}
                    placeholder="e.g. City Hospital, Dr. Smith"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Treatment / Leave Advice</label>
                  <input
                    type="text"
                    value={medicalForm.treatment_prescribed}
                    onChange={(e) => setMedicalForm({ ...medicalForm, treatment_prescribed: e.target.value })}
                    placeholder="e.g. Rest for 3 days"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Document File Attachment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="font-medium text-slate-700 mb-1 block">Medical Report Document Attachment (PDF/Image)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, (url) => setMedicalForm({ ...medicalForm, document_url: url }))}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {medicalForm.document_url && (
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-1">✓ Document Uploaded</span>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowMedicalModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMedical}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow"
                >
                  {submittingMedical ? 'Saving...' : 'Save Medical Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DISCIPLINARY ACTION MODAL */}
      {showDisciplinaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-500" /> Log Disciplinary Action
              </h3>
              <button onClick={() => setShowDisciplinaryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDisciplinary} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Category *</label>
                  <select
                    value={disciplinaryForm.category}
                    onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Attendance Shortage">Attendance Shortage</option>
                    <option value="Misconduct">Misconduct</option>
                    <option value="Academic Malpractice">Academic Malpractice</option>
                    <option value="Property Damage">Property Damage</option>
                    <option value="Other">Other Infraction</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Action Taken *</label>
                  <select
                    value={disciplinaryForm.action_taken}
                    onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_taken: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Verbal Warning">Verbal Warning</option>
                    <option value="Written Warning">Written Warning</option>
                    <option value="Parent Summoned">Parent Summoned</option>
                    <option value="Fine Imposed">Fine Imposed</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Expulsion">Expulsion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Incident Date *</label>
                  <input
                    type="date"
                    value={disciplinaryForm.incident_date}
                    onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, incident_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 mb-1 block">Action Date *</label>
                  <input
                    type="date"
                    value={disciplinaryForm.action_date}
                    onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, action_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 mb-1 block">Incident Report & Findings *</label>
                <textarea
                  rows={3}
                  value={disciplinaryForm.report_description}
                  onChange={(e) => setDisciplinaryForm({ ...disciplinaryForm, report_description: e.target.value })}
                  placeholder="Describe infraction and committee findings..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Sanction Letter Attachment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="font-medium text-slate-700 mb-1 block">Supporting Report / Sanction Document Upload</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, (url) => setDisciplinaryForm({ ...disciplinaryForm, supporting_doc_url: url }))}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {disciplinaryForm.supporting_doc_url && (
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-1">✓ Document Uploaded</span>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDisciplinaryModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDisciplinary}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow"
                >
                  {submittingDisciplinary ? 'Saving...' : 'Log Disciplinary Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText size={16} /> Document Preview
              </h4>
              <button onClick={() => setPreviewDocUrl('')} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-auto">
              {previewDocUrl.endsWith('.pdf') ? (
                <iframe
                  src={`http://localhost:8000${previewDocUrl}`}
                  className="w-full h-[500px] rounded border"
                  title="PDF Viewer"
                />
              ) : (
                <img
                  src={`http://localhost:8000${previewDocUrl}`}
                  alt="Attachment Preview"
                  className="max-h-[500px] object-contain rounded shadow"
                />
              )}
            </div>
            <div className="flex justify-end">
              <a
                href={`http://localhost:8000${previewDocUrl}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
