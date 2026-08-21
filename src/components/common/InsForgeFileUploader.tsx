import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Copy,
  Check,
  RefreshCw,
  Database,
  ExternalLink,
  File,
  Image as ImageIcon,
} from 'lucide-react';
import { AttachedFile, FileUploadCategory } from '../../types';
import {
  uploadFileToInsForge,
  formatFileSize,
  isImageFile,
  DEFAULT_STORAGE_BUCKET,
} from '../../services/storageService';

interface InsForgeFileUploaderProps {
  onFileUploaded: (file: AttachedFile) => void;
  onFileRemoved?: () => void;
  currentFile?: AttachedFile | null;
  category?: FileUploadCategory;
  recordId?: string;
  accept?: string;
  label?: string;
  description?: string;
  compact?: boolean;
}

export const InsForgeFileUploader: React.FC<InsForgeFileUploaderProps> = ({
  onFileUploaded,
  onFileRemoved,
  currentFile,
  category = 'PAYMENT_PROOF' as FileUploadCategory,
  recordId,
  accept = 'image/*,application/pdf',
  label = 'Unggah Lampiran / Bukti',
  description = 'Format PNG, JPG, WEBP, atau PDF (Maks. 10MB)',
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFile(files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    await processFile(files[0]);
  };

  const processFile = async (file: File) => {
    // Check size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 15MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadFileToInsForge(file, {
        category,
        recordId,
        bucket: DEFAULT_STORAGE_BUCKET,
      });

      if (result.success && result.file) {
        onFileUploaded(result.file);
      } else {
        setUploadError(result.error || 'Gagal mengunggah file ke InsForge Storage');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Terjadi kesalahan saat unggah file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (onFileRemoved) {
      onFileRemoved();
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>{label}</span>
          </label>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>InsForge Storage</span>
          </span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id={`insforge-file-input-${category}-${recordId || 'default'}`}
      />

      {/* If a file is uploaded, show the File Preview Card */}
      {currentFile ? (
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 flex flex-col gap-3 relative transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail or File Icon */}
              {isImageFile(currentFile.type, currentFile.name) ? (
                <div
                  onClick={() => setPreviewModalOpen(true)}
                  className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 border border-emerald-200 shrink-0 cursor-pointer relative group"
                >
                  <img
                    src={currentFile.url}
                    alt={currentFile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300/60 flex flex-col items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">
                    {currentFile.name.split('.').pop() || 'DOC'}
                  </span>
                </div>
              )}

              {/* File details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-zinc-900 truncate" title={currentFile.name}>
                    {currentFile.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 flex-wrap">
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                    {formatFileSize(currentFile.size)}
                  </span>
                  <span className="text-emerald-700 font-semibold">Tersimpan di Cloud</span>
                </div>

                {/* Storage Key */}
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                  <span className="text-zinc-400">Key:</span>
                  <span className="truncate max-w-[160px] sm:max-w-[240px]" title={currentFile.key}>
                    {currentFile.key}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyKey(currentFile.key)}
                    className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                    title="Salin Key Storage"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {isImageFile(currentFile.type, currentFile.name) && (
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="p-1.5 rounded-lg text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
                  title="Lihat Pratinjau Gambar"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 transition-all cursor-pointer"
                title="Ganti File"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-all cursor-pointer"
                title="Hapus Lampiran"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50/80 scale-[0.99]'
              : 'border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50/30 bg-zinc-50/50'
          } ${compact ? 'py-3' : 'py-5'}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-emerald-700 py-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-bold">Mengunggah ke InsForge Storage...</p>
              <p className="text-[10px] text-zinc-500">Menyimpan file & menghasilkan storage key</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-extrabold text-zinc-800">
                Klik untuk unggah <span className="font-normal text-zinc-500">atau seret file ke sini</span>
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{description}</p>
            </>
          )}
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalOpen && currentFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 space-y-4">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm text-zinc-900 truncate">{currentFile.name}</h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {formatFileSize(currentFile.size)} • {currentFile.bucket || DEFAULT_STORAGE_BUCKET}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] flex items-center justify-center overflow-auto bg-zinc-950">
              {isImageFile(currentFile.type, currentFile.name) ? (
                <img
                  src={currentFile.url}
                  alt={currentFile.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="p-8 text-center text-white space-y-2">
                  <FileText className="w-16 h-16 mx-auto text-emerald-400" />
                  <p className="text-sm font-bold">{currentFile.name}</p>
                  <a
                    href={currentFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                  >
                    <span>Buka File Dokumen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs">
              <div className="text-[11px] font-mono text-zinc-500 truncate max-w-[260px]">
                Key: {currentFile.key}
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
