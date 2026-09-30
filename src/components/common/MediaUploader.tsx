'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, FileVideo, Image as ImageIcon, FileText, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { DEFAULT_FILE_LIMITS, ALLOWED_MIME_TYPES } from '@/lib/validation/schemas';

export interface UploadedFileMeta {
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  url?: string;
}

interface MediaUploaderProps {
  acceptType: 'image' | 'audio' | 'video' | 'document';
  maxSizeMb?: number;
  onFileUpload: (file: UploadedFileMeta) => void;
  onFileRemove?: () => void;
  currentFile?: UploadedFileMeta | null;
  label?: string;
  description?: string;
}

export function MediaUploader({
  acceptType,
  maxSizeMb,
  onFileUpload,
  onFileRemove,
  currentFile,
  label,
  description,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const limitBytes = (maxSizeMb ? maxSizeMb * 1024 * 1024 : DEFAULT_FILE_LIMITS[acceptType]);
  const allowedMimes = ALLOWED_MIME_TYPES[acceptType];

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate size
    if (file.size > limitBytes) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is ${(limitBytes / (1024 * 1024)).toFixed(0)}MB.`);
      return;
    }

    // Validate mime
    const isMimeValid = allowedMimes.some((m) => file.type.startsWith(m.replace('*', '')) || file.type === m);
    if (!isMimeValid && file.type) {
      setErrorMessage(`Invalid file format (${file.type}). Allowed: ${allowedMimes.join(', ')}`);
      return;
    }

    // Simulate progress upload
    setIsUploading(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setProgress(100);
            const objectUrl = URL.createObjectURL(file);
            onFileUpload({
              name: file.name,
              type: acceptType,
              size: file.size,
              url: objectUrl,
            });
          }, 300);
          return 90;
        }
        return prev + 25;
      });
    }, 150);
  };

  const getIcon = () => {
    switch (acceptType) {
      case 'audio': return <FileAudio className="w-8 h-8 text-amber-400" />;
      case 'video': return <FileVideo className="w-8 h-8 text-purple-400" />;
      case 'document': return <FileText className="w-8 h-8 text-blue-400" />;
      default: return <ImageIcon className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">{label}</label>}

      {currentFile ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl glass-panel-highlight border border-emerald-500/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentFile.name}</p>
              <p className="text-xs text-slate-400">
                {(currentFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
              </p>
            </div>
          </div>
          {onFileRemove && (
            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors ml-2"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            errorMessage
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-slate-700 hover:border-amber-500/50 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={allowedMimes.join(',')}
            onChange={handleSelect}
          />

          {isUploading ? (
            <div className="w-full max-w-xs flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-200 mb-2">Uploading securely ({progress}%)...</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 p-3 rounded-2xl bg-white/5">{getIcon()}</div>
              <p className="text-sm font-semibold text-slate-200 mb-1">
                Click to upload {acceptType}
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                {description || `Supported formats: ${allowedMimes.map((m) => m.split('/')[1]).join(', ')} up to ${(limitBytes / (1024 * 1024)).toFixed(0)}MB`}
              </p>
            </>
          )}

          {errorMessage && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
