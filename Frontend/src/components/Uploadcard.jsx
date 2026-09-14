import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle2, Trash2, FileCode, FileSpreadsheet } from 'lucide-react';

export const UploadCard = ({ onFileUpload, isUploading, documents = [], onDeleteDocument }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
        }`}
      >
        <div className="max-w-xs mx-auto flex flex-col items-center space-y-4">
          {/* Central Upload Circle Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Upload className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">Drag & Drop files here</h4>
            <p className="text-xs text-slate-400 mt-1">or [ Browse Files ]</p>
          </div>

          {/* Supported File Type Badges (Matching Screenshot) */}
          <div className="flex items-center space-x-2 pt-1">
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600" title="PDF">
              <FileText className="w-4 h-4" />
            </div>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600" title="DOC">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600" title="Spreadsheet">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600" title="Image">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>

          <label className="cursor-pointer bg-[#1e1b4b] hover:bg-[#2d2975] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-2xs">
            <span>{isUploading ? 'Extracting File...' : 'Browse Computer'}</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={handleChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Uploaded Files Checklist (Matching Screenshot) */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Parsed Documents ({documents.length})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => {
              return (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{doc.file_name}</p>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Extracted
                      </span>
                    </div>
                  </div>

                  {onDeleteDocument && (
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadCard;
