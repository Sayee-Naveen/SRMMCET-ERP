import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ECActivityModal from '../components/ECActivityModal';
import ECCertificateModal from '../components/ECCertificateModal';
import {
  Trophy, Search, Plus, FileCheck, Trash2, ArrowLeft, FolderOpen, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ECActivitiesList() {
  const { user } = useContext(AuthContext);

  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [presetMeta, setPresetMeta] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegulation, setSelectedRegulation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedActivityForCert, setSelectedActivityForCert] = useState(null);

  const categories = [
    'All', 'Sports', 'Cultural', 'Clubs', 'NSS/NCC', 'Music', 'Dance', 'Literary', 'Social Service'
  ];

  useEffect(() => {
    fetchMetadataAndStudents();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory, selectedRegulation, selectedLevel, searchQuery]);

  const fetchMetadataAndStudents = async () => {
    try {
      const [stRes, metaRes] = await Promise.all([
        API.get('/students?all_students=true'),
        API.get('/ec/categories/domains-meta'),
      ]);
      setStudents(stRes.data);
      setPresetMeta(metaRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedRegulation !== 'All') params.regulation = selectedRegulation;
      if (selectedLevel !== 'All') params.level = selectedLevel;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await API.get('/ec/activities', { params });
      setActivities(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity record?')) return;
    try {
      await API.delete(`/ec/activities/${id}`);
      toast.success('Activity removed');
      fetchActivities();
    } catch (err) {
      toast.error('Failed to delete activity');
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
            <Trophy className="text-blue-800" size={22} /> Extra-Curricular Activities Registry
          </h2>
          <p className="text-xs text-gray-500">
            Browse, search and manage student participation across sports, cultural, clubs and social service
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/extra-curricular/portfolio" className="btn-secondary text-xs">
            <Users size={15} /> Student Portfolios
          </Link>
          <Link to="/extra-curricular/certificates" className="btn-secondary text-xs">
            <FolderOpen size={15} /> Certificate Vault
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs"
          >
            <Plus size={16} /> Record New Activity
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? '🌟 All Domains' : cat}
          </button>
        ))}
      </div>

      {/* Search & Regulation Filters */}
      <div className="card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          {/* Search box */}
          <div className="search-box-container md:col-span-2">
            <Search className="search-box-icon" size={16} />
            <input
              type="text"
              placeholder="Search by event title, organizer, sub-area, or reg number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input search-input text-xs"
            />
          </div>

          {/* Selective Regulation Filter */}
          <div>
            <select
              value={selectedRegulation}
              onChange={(e) => setSelectedRegulation(e.target.value)}
              className="form-input text-xs font-semibold text-blue-900"
            >
              <option value="All">All Regulations</option>
              <option value="R2021">Regulation 2021 (R2021)</option>
              <option value="R2025">Regulation 2025 (R2025)</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-input text-xs"
            >
              <option value="All">All Competition Levels</option>
              <option value="Department">Department Level</option>
              <option value="College">College Level</option>
              <option value="Inter-Collegiate">Inter-Collegiate</option>
              <option value="Zonal">Zonal / University</option>
              <option value="State Level">State Level</option>
              <option value="National">National Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Table Card */}
      <div className="table-card">
        <div className="table-header-title">
          <h3>
            <span className="font-extrabold text-blue-900 mr-2">{activities.length}</span>
            Activities Found ({selectedCategory} domain)
          </h3>
          <span className="text-xs text-gray-400">
            Click 'Certificate' to view attached proofs
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No activities matching current filters. Click "Record New Activity" to add one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="results-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Student Info</th>
                  <th>Regulation</th>
                  <th>Domain</th>
                  <th>Event Title & Organizer</th>
                  <th>Role & Level</th>
                  <th>Achievement</th>
                  <th>Certificate</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act, idx) => (
                  <tr key={act.id}>
                    <td className="text-center font-medium text-gray-400 text-xs">{idx + 1}</td>
                    <td>
                      <div className="font-bold text-gray-900 text-xs">{act.student?.name || act.reg_no}</div>
                      <div className="text-[10px] font-mono text-blue-900">
                        {act.reg_no} ({act.student?.course?.short_name || 'UG'})
                      </div>
                    </td>
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
                      <div className="font-semibold text-gray-900 text-xs max-w-[220px] truncate" title={act.title}>
                        {act.title}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[220px]">
                        {act.sub_category} • {act.organizer}
                      </div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-gray-800">{act.role}</div>
                      <div className="text-[10px] text-gray-500">{act.level}</div>
                    </td>
                    <td>
                      <span className="font-bold text-amber-800 text-xs">
                        {act.achievement}
                      </span>
                    </td>
                    <td>
                      {act.certificates && act.certificates.length > 0 ? (
                        <button
                          onClick={() => setSelectedActivityForCert(act)}
                          className="btn-secondary text-[11px] py-0.5 px-2 text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                        >
                          <FileCheck size={12} /> View Proof
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {user && (user.role === 'admin' || user.role === 'faculty') && (
                        <button
                          onClick={() => handleDelete(act.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete Activity"
                        >
                          <Trash2 size={14} />
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

      {/* Add Modal */}
      {showAddModal && (
        <ECActivityModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchActivities}
          students={students}
          presetMeta={presetMeta}
        />
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
