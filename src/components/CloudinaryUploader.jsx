import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  X, 
  Link as LinkIcon, 
  AlertCircle 
} from 'lucide-react';

export const CloudinaryUploader = ({
  label = 'Image',
  currentValue = '',
  onUploadSuccess,
  recommendedSize = 'PNG, JPG, or WEBP up to 10MB',
  aspectRatio = 'auto', // 'square' | 'banner' | 'auto'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualInput, setManualInput] = useState(currentValue || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const uploadedUrl = await api.uploadImage(file);
      onUploadSuccess(uploadedUrl);
      setManualInput(uploadedUrl);
    } catch (err) {
      console.error('[Cloudinary Upload Error]', err);
      setUploadError(
        err.message || 'Upload failed. Check your Cloudinary keys or paste URL directly below.'
      );
      setShowManualUrl(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleManualApply = () => {
    if (manualInput.trim()) {
      onUploadSuccess(manualInput.trim());
      setUploadError('');
    }
  };

  const handleClear = () => {
    onUploadSuccess('');
    setManualInput('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Label & Cloudinary Badge */}
      <div className="flex items-center justify-between">
        <label className="text-slate-300 font-medium text-xs flex items-center space-x-1.5">
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-cyan-400 font-mono flex items-center space-x-1 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
          <UploadCloud className="w-3 h-3 text-cyan-400" />
          <span>Cloudinary CDN</span>
        </span>
      </div>

      {/* Upload Box / Image Preview */}
      <div className="space-y-2">
        {currentValue ? (
          <div className="relative group p-2 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-3">
            <div className={`overflow-hidden bg-slate-950 rounded-lg shrink-0 border border-slate-800 ${
              aspectRatio === 'banner' ? 'w-24 h-12' : 'w-14 h-14'
            }`}>
              <img
                src={currentValue}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono text-slate-300 truncate">{currentValue}</div>
              <div className="text-[10px] text-emerald-400 flex items-center space-x-1 mt-0.5">
                <Check className="w-3 h-3" />
                <span>Active Image Loaded</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded-lg transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            {isUploading ? (
              <div className="py-2 flex flex-col items-center justify-center space-y-1 text-cyan-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[11px] font-medium">Uploading to Cloudinary...</span>
              </div>
            ) : (
              <div className="py-1 flex items-center justify-center space-x-2 text-slate-400 hover:text-slate-200">
                <UploadCloud className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-medium">Upload photo via Cloudinary</span>
                <span className="text-[10px] text-slate-500 font-mono">({recommendedSize})</span>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-start space-x-1.5 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{uploadError}</span>
            </div>
          </div>
        )}

        {/* Manual URL Fallback Toggle */}
        <div className="flex items-center justify-between pt-0.5">
          <button
            type="button"
            onClick={() => setShowManualUrl(!showManualUrl)}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center space-x-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showManualUrl ? 'Hide URL field' : 'Or paste direct image URL'}</span>
          </button>
        </div>

        {showManualUrl && (
          <div className="flex items-center space-x-1.5 animate-fadeIn">
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleManualApply(); } }}
              className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleManualApply}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
