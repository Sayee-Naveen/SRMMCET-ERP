import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

export default function ECActivityModal({ onClose, onCreated, students, presetMeta }) {
  const [regulationsList, setRegulationsList] = useState(['R2021', 'R2025']);
  const [categoriesList, setCategoriesList] = useState([
    'Sports', 'Cultural', 'Clubs', 'NSS/NCC', 'Music', 'Dance', 'Literary', 'Social Service'
  ]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);

  const [addingRegulation, setAddingRegulation] = useState(false);
  const [newRegulationInput, setNewRegulationInput] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [addingSubCategory, setAddingSubCategory] = useState(false);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState('');
  const [addingAchievement, setAddingAchievement] = useState(false);
  const [newAchievementInput, setNewAchievementInput] = useState('');

  const [formData, setFormData] = useState({
    reg_no: '', regulation: '', category: '', sub_category: '', title: '',
    organizer: '', level: '', role: '', achievement: '', event_date: '',
    academic_year: '', semester: '', description: '',
    has_certificate: false, certificate_no: '', issuing_authority: '',
    file_url: '', certificate_file_name: '',
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleStudentSelect = (reg_no) => {
    const student = students.find(s => s.reg_no === reg_no);
    setFormData(prev => ({
      ...prev,
      reg_no,
      regulation: student?.regulation || '',
    }));
  };

  const handleCategorySelect = (val) => {
    if (val === '__ADD_NEW__') {
      setAddingCategory(true);
      setNewCategoryInput('');
    } else {
      const presets = presetMeta?.[val];
      setSubCategoriesList(presets?.events || []);
      setAchievementsList(presets?.achievements || []);
      setFormData(prev => ({ ...prev, category: val, sub_category: '', achievement: '' }));
    }
  };

  const handleSaveNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) { setAddingCategory(false); return; }
    if (!categoriesList.includes(trimmed)) setCategoriesList(prev => [...prev, trimmed]);
    setFormData(prev => ({ ...prev, category: trimmed }));
    setAddingCategory(false);
    setNewCategoryInput('');
  };

  const handleRegulationSelect = (val) => {
    if (val === '__ADD_NEW__') { setAddingRegulation(true); setNewRegulationInput(''); }
    else setFormData(prev => ({ ...prev, regulation: val }));
  };

  const handleSaveNewRegulation = () => {
    const trimmed = newRegulationInput.trim();
    if (!trimmed) { setAddingRegulation(false); return; }
    if (!regulationsList.includes(trimmed)) setRegulationsList(prev => [...prev, trimmed]);
    setFormData(prev => ({ ...prev, regulation: trimmed }));
    setAddingRegulation(false);
    setNewRegulationInput('');
  };

  const handleSubCategorySelect = (val) => {
    if (val === '__ADD_NEW__') { setAddingSubCategory(true); setNewSubCategoryInput(''); }
    else setFormData(prev => ({ ...prev, sub_category: val }));
  };

  const handleSaveNewSubCategory = () => {
    const trimmed = newSubCategoryInput.trim();
    if (!trimmed) { setAddingSubCategory(false); return; }
    if (!subCategoriesList.includes(trimmed)) setSubCategoriesList(prev => [...prev, trimmed]);
    setFormData(prev => ({ ...prev, sub_category: trimmed }));
    setAddingSubCategory(false);
    setNewSubCategoryInput('');
  };

  const handleAchievementSelect = (val) => {
    if (val === '__ADD_NEW__') { setAddingAchievement(true); setNewAchievementInput(''); }
    else setFormData(prev => ({ ...prev, achievement: val }));
  };

  const handleSaveNewAchievement = () => {
    const trimmed = newAchievementInput.trim();
    if (!trimmed) { setAddingAchievement(false); return; }
    if (!achievementsList.includes(trimmed)) setAchievementsList(prev => [...prev, trimmed]);
    setFormData(prev => ({ ...prev, achievement: trimmed }));
    setAddingAchievement(false);
    setNewAchievementInput('');
  };

  // Certificate upload — uses /ec/certificates/upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    setUploadingFile(true);
    try {
      const res = await API.post('/ec/certificates/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({
        ...prev,
        file_url: res.data.file_url,
        certificate_file_name: file.name,
        has_certificate: true,
      }));
      toast.success(`Certificate "${file.name}" uploaded!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload certificate file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reg_no) { toast.error('Please select a student'); return; }
    if (!formData.category) { toast.error('Please select a domain / category'); return; }
    if (!formData.title.trim() || !formData.organizer.trim()) {
      toast.error('Please enter the event title and organizer');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        reg_no: formData.reg_no,
        regulation: formData.regulation || 'R2021',
        category: formData.category,
        sub_category: formData.sub_category || 'General',
        title: formData.title.trim(),
        organizer: formData.organizer.trim(),
        level: formData.level || 'College',
        role: formData.role || 'Participant',
        achievement: formData.achievement || 'Participated',
        event_date: formData.event_date || new Date().toISOString().split('T')[0],
        academic_year: formData.academic_year || '2024-2025',
        semester: formData.semester ? parseInt(formData.semester) : 1,
        description: formData.description.trim(),
      };

      if (formData.has_certificate && (formData.file_url || formData.certificate_no || formData.issuing_authority)) {
        payload.certificate = {
          certificate_no: formData.certificate_no || `SRM-EC-${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Certificate of ${payload.achievement} - ${payload.title}`,
          issuing_authority: formData.issuing_authority || payload.organizer,
          issue_date: payload.event_date,
          file_url: formData.file_url,
          file_type: formData.file_url?.endsWith('.pdf') ? 'application/pdf' : 'image/png',
        };
      }

      await API.post('/ec/activities', payload);
      toast.success('Extra-curricular activity successfully recorded!');
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3>Record Extra-Curricular Activity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-3.5">
          {/* Student Selector & Regulation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="form-label">Select Student *</label>
              <select
                value={formData.reg_no}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="form-input"
                required
              >
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.reg_no} value={s.reg_no}>
                    {s.reg_no} - {s.name} ({s.course?.short_name || s.course_id} Sec-{s.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Regulation *</label>
              {addingRegulation ? (
                <div className="flex items-center gap-1">
                  <input type="text" autoFocus placeholder="e.g. R2029" value={newRegulationInput}
                    onChange={(e) => setNewRegulationInput(e.target.value)}
                    className="form-input text-xs border-blue-500 font-bold"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewRegulation(); } }} />
                  <button type="button" onClick={handleSaveNewRegulation} className="btn-primary text-xs py-1.5 px-2"><Check size={13} /></button>
                  <button type="button" onClick={() => setAddingRegulation(false)} className="btn-secondary text-xs py-1.5 px-2 text-gray-500"><X size={13} /></button>
                </div>
              ) : (
                <select value={formData.regulation} onChange={(e) => handleRegulationSelect(e.target.value)}
                  className="form-input font-bold text-blue-900">
                  <option value="">-- Select --</option>
                  {regulationsList.map((r) => (
                    <option key={r} value={r}>{r === 'R2021' ? 'Regulation 2021 (R2021)' : r === 'R2025' ? 'Regulation 2025 (R2025)' : r}</option>
                  ))}
                  <option value="__ADD_NEW__" className="text-blue-700 font-bold bg-blue-50">+ Add Option</option>
                </select>
              )}
            </div>
          </div>

          {/* Category & Sub-Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Domain / Category *</label>
              {addingCategory ? (
                <div className="flex items-center gap-1">
                  <input type="text" autoFocus placeholder="Enter new Category..." value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="form-input text-xs border-blue-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewCategory(); } }} />
                  <button type="button" onClick={handleSaveNewCategory} className="btn-primary text-xs py-1.5 px-2"><Check size={13} /></button>
                  <button type="button" onClick={() => setAddingCategory(false)} className="btn-secondary text-xs py-1.5 px-2 text-gray-500"><X size={13} /></button>
                </div>
              ) : (
                <select value={formData.category} onChange={(e) => handleCategorySelect(e.target.value)}
                  className="form-input font-semibold text-blue-900" required>
                  <option value="">-- Select Domain / Category --</option>
                  {categoriesList.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="__ADD_NEW__" className="text-blue-700 font-bold bg-blue-50">+ Add Option</option>
                </select>
              )}
            </div>

            <div>
              <label className="form-label">Sub-Category / Game *</label>
              {addingSubCategory ? (
                <div className="flex items-center gap-1">
                  <input type="text" autoFocus placeholder="Enter new game / sub-category..." value={newSubCategoryInput}
                    onChange={(e) => setNewSubCategoryInput(e.target.value)}
                    className="form-input text-xs border-blue-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewSubCategory(); } }} />
                  <button type="button" onClick={handleSaveNewSubCategory} className="btn-primary text-xs py-1.5 px-2"><Check size={13} /></button>
                  <button type="button" onClick={() => setAddingSubCategory(false)} className="btn-secondary text-xs py-1.5 px-2 text-gray-500"><X size={13} /></button>
                </div>
              ) : (
                <select value={formData.sub_category} onChange={(e) => handleSubCategorySelect(e.target.value)}
                  className="form-input" required>
                  <option value="">-- Select Game / Sub-Category --</option>
                  {subCategoriesList.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                  <option value="__ADD_NEW__" className="text-blue-700 font-bold bg-blue-50">+ Add Option</option>
                </select>
              )}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="form-label">Event / Activity Title *</label>
            <input type="text" placeholder="e.g. Anna University Zonal 400m Athletics Championship 2024"
              value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input" required />
          </div>

          {/* Organizer & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Organizing Body / Institution *</label>
              <input type="text" placeholder="e.g. Anna University Chennai / SRMMCET"
                value={formData.organizer} onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="form-input" required />
            </div>
            <div>
              <label className="form-label">Competition Level</label>
              <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="form-input">
                <option value="">-- Select Level --</option>
                <option value="Department">Department Level</option>
                <option value="College">College Level</option>
                <option value="Inter-Collegiate">Inter-Collegiate</option>
                <option value="Zonal">Zonal / University Level</option>
                <option value="State Level">State Level</option>
                <option value="National">National Level</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>

          {/* Role & Achievement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Role / Participation</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-input">
                <option value="">-- Select Role --</option>
                <option value="Participant">Participant</option>
                <option value="Winner">Winner</option>
                <option value="Runner-Up">Runner-Up</option>
                <option value="Team Captain">Team Captain</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Cadet">Cadet</option>
                <option value="President / Office Bearer">President / Office Bearer</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>
            <div>
              <label className="form-label">Achievement / Standing</label>
              {addingAchievement ? (
                <div className="flex items-center gap-1">
                  <input type="text" autoFocus placeholder="Enter new achievement..." value={newAchievementInput}
                    onChange={(e) => setNewAchievementInput(e.target.value)}
                    className="form-input text-xs border-amber-500 font-bold"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewAchievement(); } }} />
                  <button type="button" onClick={handleSaveNewAchievement} className="btn-primary text-xs py-1.5 px-2 bg-amber-600 hover:bg-amber-700"><Check size={13} /></button>
                  <button type="button" onClick={() => setAddingAchievement(false)} className="btn-secondary text-xs py-1.5 px-2 text-gray-500"><X size={13} /></button>
                </div>
              ) : (
                <select value={formData.achievement} onChange={(e) => handleAchievementSelect(e.target.value)}
                  className="form-input font-bold text-amber-800">
                  <option value="">-- Select Achievement --</option>
                  {achievementsList.map((ach) => <option key={ach} value={ach}>{ach}</option>)}
                  <option value="__ADD_NEW__" className="text-amber-800 font-bold bg-amber-50">+ Add Option</option>
                </select>
              )}
            </div>
          </div>

          {/* Date, Academic Year & Semester */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="form-label">Event Date</label>
              <input type="date" value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Academic Year</label>
              <input type="text" placeholder="e.g. 2024-2025" value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Semester</label>
              <select value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="form-input">
                <option value="">-- Select Semester --</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description / Remarks</label>
            <textarea rows={2}
              placeholder="Highlights about the performance, event scores, responsibilities, or impact..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input" />
          </div>

          {/* Certificate Upload */}
          <div className="bg-blue-50/40 p-3.5 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Upload size={14} className="text-blue-700" />
                Upload Certificate Proof (If available)
              </label>
              <span className="text-[11px] text-gray-400">PDF, PNG, JPG</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*,.pdf" onChange={handleFileUpload}
                className="text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer" />
              {uploadingFile && <span className="text-xs text-blue-700">Uploading...</span>}
              {formData.certificate_file_name && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle size={13} /> {formData.certificate_file_name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2.5">
              <div>
                <label className="form-label text-[11px]">Certificate Number (Optional)</label>
                <input type="text" placeholder="e.g. SRM-SP-2025-019" value={formData.certificate_no}
                  onChange={(e) => setFormData({ ...formData, certificate_no: e.target.value, has_certificate: true })}
                  className="form-input text-xs font-mono" />
              </div>
              <div>
                <label className="form-label text-[11px]">Issuing Signatory / Authority</label>
                <input type="text" placeholder="e.g. Convenor / Sports Board" value={formData.issuing_authority}
                  onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value, has_certificate: true })}
                  className="form-input text-xs" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">Cancel</button>
            <button type="submit" disabled={saving || uploadingFile} className="btn-primary text-xs">
              <CheckCircle size={14} /> {saving ? 'Saving...' : 'Record Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
