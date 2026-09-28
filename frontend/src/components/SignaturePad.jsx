import React, { useRef, useState, useEffect } from 'react';
import { Edit3, RotateCcw, Upload, Check } from 'lucide-react';
import { uploadFile } from '../api/medicalDisciplinaryApi';
import toast from 'react-hot-toast';

export default function SignaturePad({ label, onSignatureSaved, initialUrl = '' }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const [signatureUrl, setSignatureUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1e293b'; // slate-800
    }
  }, [mode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      toast.error('Please draw a signature before saving.');
      return;
    }
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setUploading(true);
      try {
        const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });
        const res = await uploadFile(file);
        setSignatureUrl(res.url);
        onSignatureSaved(res.url);
        toast.success('Signature saved successfully');
      } catch (err) {
        toast.error('Failed to upload signature image');
      } finally {
        setUploading(false);
      }
    }, 'image/png');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      setSignatureUrl(res.url);
      onSignatureSaved(res.url);
      toast.success('Signature file uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload signature file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="signature-pad-container p-3 bg-slate-50 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-2 py-1 rounded transition ${mode === 'draw' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            <Edit3 size={12} className="inline mr-1" /> Draw
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-1 rounded transition ${mode === 'upload' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            <Upload size={12} className="inline mr-1" /> Upload File
          </button>
        </div>
      </div>

      {signatureUrl ? (
        <div className="relative p-2 bg-white border border-emerald-300 rounded text-center">
          <div className="text-xs text-emerald-700 font-semibold mb-1 flex items-center justify-center gap-1">
            <Check size={14} /> Signature Saved & Attached
          </div>
          <img
            src={`http://localhost:8000${signatureUrl}`}
            alt="Saved Signature"
            className="h-16 mx-auto object-contain bg-slate-50 p-1 border rounded"
          />
          <button
            type="button"
            onClick={() => {
              setSignatureUrl('');
              onSignatureSaved('');
            }}
            className="mt-2 text-xs text-red-600 underline hover:text-red-800"
          >
            Remove & Replace Signature
          </button>
        </div>
      ) : mode === 'draw' ? (
        <div className="space-y-2">
          <div className="border bg-white rounded cursor-crosshair overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={380}
              height={110}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-28 touch-none"
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={clearCanvas}
              className="px-2.5 py-1 text-slate-600 bg-slate-200 hover:bg-slate-300 rounded flex items-center gap-1"
            >
              <RotateCcw size={12} /> Clear Canvas
            </button>
            <button
              type="button"
              onClick={saveCanvasSignature}
              disabled={uploading || !hasDrawn}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded font-medium transition flex items-center gap-1"
            >
              {uploading ? 'Saving...' : 'Confirm Signature'}
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 bg-white p-4 text-center rounded">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="text-[11px] text-slate-400 mt-1">Upload scanned signature image (PNG, JPG, max 5MB)</p>
        </div>
      )}
    </div>
  );
}
