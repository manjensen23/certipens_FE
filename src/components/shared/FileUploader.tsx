import { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle2, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  isRequired?: boolean;
  acceptedTypes?: string[]; // e.g. ['pdf','jpg','png']
  maxSizeMB?: number;
  uploadedFile?: { name: string; size: number } | null;
  isUploading?: boolean;
  progress?: number;
  error?: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
}

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText size={20} className="text-red-500" />;
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <ImageIcon size={20} className="text-blue-500" />;
  return <FileText size={20} className="text-on-surface-variant" />;
}

export default function FileUploader({
  label,
  isRequired = false,
  acceptedTypes = ['pdf', 'jpg', 'png'],
  maxSizeMB = 5,
  uploadedFile,
  isUploading = false,
  progress = 0,
  error,
  onFileSelect,
  onRemove,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptString = acceptedTypes.map((t) => MIME_MAP[t] || `.${t}`).join(',');

  const validateAndSelect = useCallback(
    (file: File) => {
      setValidationError(null);

      // Check type
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(ext || '')) {
        setValidationError(`Tipe file tidak didukung. Gunakan: ${acceptedTypes.join(', ').toUpperCase()}`);
        return;
      }

      // Check size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setValidationError(`Ukuran file melebihi batas ${maxSizeMB}MB`);
        return;
      }

      onFileSelect(file);
    },
    [acceptedTypes, maxSizeMB, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = validationError || error;

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-on-surface">{label}</label>
        <span
          className={`badge text-[10px] px-1.5 py-0.5 ${isRequired ? 'badge-rejected' : 'badge-draft'}`}
        >
          {isRequired ? 'Wajib' : 'Opsional'}
        </span>
      </div>

      {/* Upload area or uploaded state */}
      {uploadedFile && !isUploading ? (
        /* Uploaded state */
        <div className="flex items-center gap-3 rounded-lg border border-status-verified/30 bg-status-verified-bg p-4">
          <CheckCircle2 size={20} className="text-status-verified shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getFileIcon(uploadedFile.name)}
            <div className="min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{uploadedFile.name}</p>
              <p className="text-xs text-on-surface-variant">{formatFileSize(uploadedFile.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Ganti
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded p-1 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all cursor-pointer ${
            dragActive
              ? 'border-primary bg-primary-alpha-10'
              : displayError
                ? 'border-error/50 bg-error/5'
                : 'border-outline-variant bg-surface-container/30 hover:border-primary/50 hover:bg-primary-alpha-10/50'
          }`}
        >
          {isUploading ? (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Mengupload...
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload size={24} className={`mb-2 ${dragActive ? 'text-primary' : 'text-on-surface-variant'}`} />
              <p className="text-sm text-on-surface-variant">
                <span className="font-semibold text-primary">Klik untuk upload</span> atau drag & drop
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-1">
                {acceptedTypes.map((t) => t.toUpperCase()).join(', ')} • Max {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-1.5 text-xs text-error">
          <AlertCircle size={14} />
          {displayError}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
