import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import CertificateModal from '../components/CertificateModal';
import {
  FileCheck, Search, ExternalLink, RefreshCw, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificateVault() {
  const { user } = useContext(AuthContext);

  const [certificates, setCertificates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [selectedActivityForCert, setSelectedActivityForCert] = useState(null);

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [certRes, actRes] = await Promise.all([
        API.get('/certificates', { params: { search } }),
        API.get('/activities'),
      ]);
      setCertificates(certRes.data);
      setActivities(actRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const findActivityByCert = (cert) => {
    return activities.find((a) => a.id === cert.activity_id);
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="text-blue-800" size={22} /> Certificate Document Vault
          </h2>
          <p className="text-xs text-gray-500">
            Institutional repository of uploaded certificate documents and proofs
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn-secondary text-xs"
        >
          <RefreshCw size={14} /> Refresh Records
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card p-3 mb-4">
        <div className="search-box-container">
          <Search className="search-box-icon" size={16} />
          <input
            type="text"
            placeholder="Search by certificate number, title, or issuing authority..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input search-input text-xs"
          />
        </div>
      </div>

      {/* Certificates Table */}
      <div className="table-card">
        <div className="table-header-title">
          <h3>
            <FileCheck className="inline mr-2 text-blue-700" size={18} />
            Attached Certificates ({certificates.length} records)
          </h3>
          <span className="text-xs text-gray-400">
            Click 'Inspect Proof' to preview uploaded certificate or credentials
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading certificate records...</div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No certificates found. Records will appear here when activities are logged with certificate proofs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="results-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Certificate No</th>
                  <th>Title & Issuing Authority</th>
                  <th>Student & Reg No</th>
                  <th>Regulation</th>
                  <th>Issue Date</th>
                  <th>Proof File</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert, idx) => {
                  const act = findActivityByCert(cert);
                  return (
                    <tr key={cert.id}>
                      <td className="text-center font-medium text-xs text-gray-400">{idx + 1}</td>
                      <td className="font-mono font-bold text-blue-900 text-xs">
                        {cert.certificate_no || 'SRM-CERT'}
                      </td>
                      <td>
                        <div className="font-bold text-gray-900 text-xs max-w-[240px] truncate" title={cert.title}>
                          {cert.title || act?.title}
                        </div>
                        <div className="text-[10px] text-gray-500">{cert.issuing_authority || act?.organizer}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-gray-800 text-xs">{act?.student?.name || act?.reg_no || '—'}</div>
                        <div className="text-[10px] font-mono text-gray-500">{act?.reg_no}</div>
                      </td>
                      <td>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {act?.regulation || 'R2021'}
                        </span>
                      </td>
                      <td className="text-xs text-gray-600">{cert.issue_date || '—'}</td>
                      <td>
                        {cert.file_url ? (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <FileText size={13} /> Attached
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Citation</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            if (act) setSelectedActivityForCert(act);
                          }}
                          className="btn-secondary text-[11px] py-1 px-2.5 text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Inspect Proof
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
