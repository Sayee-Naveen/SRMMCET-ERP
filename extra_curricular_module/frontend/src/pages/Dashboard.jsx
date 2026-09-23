import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ActivityModal from '../components/ActivityModal';
import CertificateModal from '../components/CertificateModal';
import {
  Trophy, Award, FileCheck, Users, Plus,
  Shield, Music, Flame, BookOpen, Heart, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [presetMeta, setPresetMeta] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedActivityForCert, setSelectedActivityForCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, stRes, metaRes] = await Promise.all([
        API.get('/analytics/summary'),
        API.get('/students'),
        API.get('/categories/domains-meta'),
      ]);
      setSummary(sumRes.data);
      setStudents(stRes.data);
      setPresetMeta(metaRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Sports': return Trophy;
      case 'Cultural': return Sparkles;
      case 'Clubs': return Users;
      case 'NSS/NCC': return Shield;
      case 'Music': return Music;
      case 'Dance': return Flame;
      case 'Literary': return BookOpen;
      case 'Social Service': return Heart;
      default: return Award;
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
      {/* Banner */}
      <div className="module-header-banner">
        <div>
          <h2>Extra-Curricular Activities & Achievements Module</h2>
          <p>
            Comprehensive Tracking for Sports, Cultural, Clubs, NSS/NCC, Music, Dance, Literary, Social Service & Certificates
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gold"
        >
          <Plus size={18} /> Record New Activity
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-500">Loading module analytics...</div>
      ) : summary && (
        <>
          {/* KPI Stat Cards (No points, no ranking, no verification) */}
          <div className="stat-grid">
            <StatCard
              title="Total Activities Logged"
              value={summary.total_activities}
              icon={Trophy}
              color="blue"
              subtitle="Across all 8 domains"
            />
            <StatCard
              title="Certificates Attached"
              value={summary.total_certificates}
              icon={FileCheck}
              color="emerald"
              subtitle="Proofs uploaded & documented"
            />
            <StatCard
              title="Honors & Achievements"
              value={summary.total_awards}
              icon={Award}
              color="purple"
              subtitle="Golds, Silvers & 1st Places"
            />
            <StatCard
              title="Active Students"
              value={summary.total_students_participated}
              icon={Users}
              color="amber"
              subtitle="Students with recorded activities"
            />
          </div>

          {/* Domain Breakdown Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Award className="text-blue-700" size={18} /> Domains & Sub-Area Distribution
              </h3>
              <span className="text-xs text-gray-500">8 Institutional Pillars</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {summary.category_breakdown.map((cat) => {
                const CatIcon = getCategoryIcon(cat.category);
                return (
                  <div
                    key={cat.category}
                    className="card p-3 text-center border hover:border-blue-500 transition-all cursor-pointer group"
                  >
                    <div className="inline-flex p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 text-blue-700 transition-colors mb-1.5">
                      <CatIcon size={20} />
                    </div>
                    <div className="font-bold text-xs text-gray-800 truncate" title={cat.category}>
                      {cat.category}
                    </div>
                    <div className="text-lg font-black text-blue-900 mt-0.5">
                      {cat.count}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {cat.certificates_count} certs
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Stream (Full width, No ranking / No student leaderboard) */}
          <div className="card">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Sparkles className="text-blue-700" size={16} /> Recent Activity Stream
              </h3>
              <span className="text-xs text-blue-700 font-semibold">Latest Entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Regulation</th>
                    <th>Category</th>
                    <th>Event & Sub-Area</th>
                    <th>Achievement / Standing</th>
                    <th>Certificate Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_activities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-400">No activities recorded yet</td>
                    </tr>
                  ) : (
                    summary.recent_activities.map((act) => (
                      <tr key={act.id}>
                        <td>
                          <div className="font-bold text-gray-900">{act.student?.name || act.reg_no}</div>
                          <div className="text-[10px] font-mono text-gray-500">{act.reg_no} ({act.student?.department || 'UG'})</div>
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
                          <div className="font-semibold text-gray-800 max-w-[240px] truncate" title={act.title}>
                            {act.title}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">{act.sub_category} • {act.level}</div>
                        </td>
                        <td className="font-bold text-amber-800 text-xs">
                          {act.achievement}
                        </td>
                        <td>
                          {act.certificates && act.certificates.length > 0 ? (
                            <button
                              onClick={() => setSelectedActivityForCert(act)}
                              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                            >
                              <FileCheck size={13} /> View Proof
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <ActivityModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadDashboardData}
          students={students}
          presetMeta={presetMeta}
        />
      )}

      {/* Certificate Viewer Modal */}
      {selectedActivityForCert && (
        <CertificateModal
          activity={selectedActivityForCert}
          onClose={() => setSelectedActivityForCert(null)}
        />
      )}
    </div>
  );
}
