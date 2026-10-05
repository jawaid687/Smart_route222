import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Sparkles,
  Copy
} from 'lucide-react';
import { translations } from '../utils/translations';
import { SAMPLE_JSON_TEMPLATE } from '../utils/presets';
import { validateFloorPlanJson } from '../utils/validator';
import { playClick } from '../utils/audio';

export default function JsonUploadModal({
  isOpen,
  onClose,
  onLoadMapData,
  currentMapData,
  lang
}) {
  const t = translations[lang] || translations.en;

  const [jsonText, setJsonText] = useState('');
  const [localErrors, setLocalErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Process and validate input
  const handleValidateAndLoad = () => {
    playClick();
    if (!jsonText.trim()) {
      setLocalErrors([lang === 'bn' ? 'অনুগ্রহ করে একটি JSON ফাইল আপলোড করুন অথবা পেস্ট করুন।' : 'Please upload a JSON file or paste floor plan JSON code.']);
      return;
    }

    const result = validateFloorPlanJson(jsonText);
    if (!result.isValid) {
      setLocalErrors(result.errors);
      return;
    }

    // Success
    setLocalErrors([]);
    onLoadMapData(result.data);
    onClose();
  };

  // File Upload Handlers
  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setJsonText(content);
        setLocalErrors([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInsertSample = () => {
    playClick();
    setJsonText(SAMPLE_JSON_TEMPLATE);
    setLocalErrors([]);
  };

  const handleDownloadSample = () => {
    playClick();
    const blob = new Blob([SAMPLE_JSON_TEMPLATE], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_escape_sample_plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrent = () => {
    playClick();
    if (!currentMapData) return;
    const blob = new Blob([JSON.stringify(currentMapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_escape_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-cyber-850 border border-cyber-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-700/80 bg-cyber-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neon-blue/10 text-neon-blue border border-neon-blue/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.modalUploadTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'কাস্টম ফ্লোর প্ল্যান JSON লোড বা যাচাই করুন' : 'Load and validate custom JSON floor plan data'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* File Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-cyber-600 hover:border-slate-400 bg-cyber-900/50'
            }`}
            onClick={() => {
              const fileInput = document.getElementById('json-file-input');
              if (fileInput) fileInput.click();
            }}
          >
            <input
              id="json-file-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-cyber-800 flex items-center justify-center text-slate-300">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                {t.dropzoneText}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                *.json (UTF-8)
              </p>
            </div>
          </div>

          {/* Action Row: Sample Insert & Export */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-300">
              {t.pasteLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInsertSample}
                className="px-2.5 py-1 rounded-lg bg-cyber-800 hover:bg-cyber-750 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'নমুনা JSON পেস্ট' : 'Paste Sample'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-2.5 py-1 rounded-lg bg-cyber-800 hover:bg-cyber-750 text-slate-300 border border-cyber-700 flex items-center gap-1 font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadTemplate}</span>
              </button>
              <button
                type="button"
                onClick={handleExportCurrent}
                className="px-2.5 py-1 rounded-lg bg-cyber-800 hover:bg-cyber-750 text-neon-blue border border-neon-blue/30 flex items-center gap-1 font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.exportCurrent}</span>
              </button>
            </div>
          </div>

          {/* Raw JSON Textarea */}
          <div className="relative">
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{\n  "nodes": [...],\n  "edges": [...],\n  "initial_state": { ... }\n}'
              className="w-full bg-cyber-900 border border-cyber-700 rounded-xl p-3 text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
            />
          </div>

          {/* Validation Errors Box inside Modal */}
          {localErrors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-danger-dark/50 border border-danger/60 text-xs text-red-200">
              <div className="flex items-center gap-2 font-bold text-white mb-1.5">
                <AlertCircle className="w-4 h-4 text-danger-glow" />
                <span>{t.jsonValidationFailed}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] max-h-28 overflow-y-auto">
                {localErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Schema Requirements Accordion/Info */}
          <div className="p-3.5 rounded-xl bg-cyber-900/80 border border-cyber-750 text-xs text-slate-400 space-y-1 font-mono">
            <span className="font-semibold text-slate-300 block font-sans text-xs mb-1">
              {t.schemaRequirements}
            </span>
            <p>• {t.schemaNodes}</p>
            <p>• {t.schemaEdges}</p>
            <p>• {t.schemaInitialState}</p>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cyber-700/80 bg-cyber-900/60">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-cyber-800 border border-cyber-700 text-xs font-medium transition-all"
          >
            {t.cancelButton}
          </button>
          <button
            onClick={handleValidateAndLoad}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/60 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.loadButton}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
