import React from 'react';
import { X, Award, Calendar, Hash, FileText, Download, Printer, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificateModal({ activity, certificate, onClose }) {
  if (!activity) return null;

  const cert = certificate || (activity.certificates && activity.certificates[0]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Award className="text-amber-600" size={20} />
            <h3>Activity Certificate & Proof Document</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          {/* If there is an actual uploaded file (image or PDF) */}
          {cert?.file_url && (
            <div className="card p-3 bg-gray-50 border text-center">
              <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-center gap-1.5">
                <FileText size={16} className="text-blue-700" />
                Uploaded Proof Document
              </div>
              {cert.file_url.endsWith('.pdf') ? (
                <div className="p-4 bg-white rounded border">
                  <p className="text-xs text-gray-600 mb-2 font-mono">{cert.file_url.split('/').pop()}</p>
                  <a
                    href={cert.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={13} /> Open PDF Document
                  </a>
                </div>
              ) : (
                <div className="max-h-72 overflow-hidden rounded border bg-white flex items-center justify-center">
                  <img
                    src={cert.file_url}
                    alt="Certificate Proof"
                    className="max-h-72 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Certificate Graphical Layout */}
          <div className="cert-graphic border-4 border-amber-600/60 bg-amber-50/20 p-6 rounded-lg text-center relative overflow-hidden shadow-inner">
            <div className="text-xs uppercase font-extrabold tracking-widest text-blue-900 mb-1">
              SRM Madurai College for Engineering & Technology
            </div>
            <div className="text-xl font-serif font-black text-gray-900 mb-1">
              CERTIFICATE OF MERIT & PARTICIPATION
            </div>
            <div className="text-xs text-gray-500 mb-4 italic">
              Extra-Curricular Activities & Student Achievements Record
            </div>

            <div className="text-sm text-gray-700 leading-relaxed max-w-lg mx-auto mb-4">
              This is to certify that <span className="font-bold text-gray-900">{activity.student?.name || activity.reg_no}</span> (Reg No: <span className="font-mono font-bold text-blue-900">{activity.reg_no}</span>) belonging to regulation <span className="font-bold text-blue-800">{activity.regulation || 'R2021'}</span> has actively participated in and achieved <span className="font-bold text-amber-700 underline">{activity.achievement}</span> in <span className="font-bold text-gray-900">"{activity.title}"</span> ({activity.sub_category}).
            </div>

            <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto text-xs bg-white/80 p-3 rounded border border-gray-200 mb-4">
              <div>
                <span className="text-gray-500 block">Category:</span>
                <span className="font-bold text-gray-800">{activity.category}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Competition Level:</span>
                <span className="font-bold text-gray-800">{activity.level}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Organized By:</span>
                <span className="font-bold text-gray-800">{activity.organizer}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Event Date:</span>
                <span className="font-bold text-gray-800">{activity.event_date}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Regulation:</span>
                <span className="font-bold text-blue-900">{activity.regulation || 'R2021'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Certificate No:</span>
                <span className="font-mono font-bold text-blue-800">{cert?.certificate_no || 'Document Attached'}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between items-end text-xs text-gray-500">
              <div className="text-left">
                <div className="font-bold text-gray-800">{cert?.issuing_authority || activity.organizer}</div>
                <div className="text-[10px]">Issuing Body / Convenor</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-blue-900">SRM MCET Institutional Record</div>
                <div className="text-[10px] text-gray-400">Student Affairs & Extra-Curricular Cell</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary text-xs py-1.5"
            >
              <Printer size={14} /> Print Certificate
            </button>
            <button
              type="button"
              onClick={() => toast.success('Certificate download prepared!')}
              className="btn-primary text-xs py-1.5"
            >
              <Download size={14} /> Download Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
