'use client';

import { FileInput, Label } from 'flowbite-react';
import { Upload, X, File } from 'lucide-react';
import { useState } from 'react';

interface UploadFieldProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  helperText?: string;
}

export default function UploadField({
  label = 'Upload files',
  accept,
  maxSize = 10,
  multiple = false,
  onChange,
  onError,
  disabled = false,
  helperText,
}: UploadFieldProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} exceeds maximum size of ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        if (type.includes('/*')) {
          return mimeType.startsWith(type.split('/')[0]);
        }
        return mimeType === type;
      });

      if (!isAccepted) {
        return `File ${file.name} is not an accepted file type`;
      }
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    let errorMessage = '';

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errorMessage = error;
        break;
      }
      validFiles.push(file);
    }

    if (errorMessage) {
      onError?.(errorMessage);
      return;
    }

    const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
    setSelectedFiles(newFiles);
    onChange?.(newFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onChange?.(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {label && (
        <Label htmlFor="file-upload" className="mb-2 block">
          {label}
        </Label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? 'border-interactive-primary bg-background-hover'
            : 'border-border hover:border-border-strong'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center px-6 py-8 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <Upload className="w-10 h-10 text-text-secondary mb-3" />
          <p className="text-sm text-text-primary font-medium mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-text-secondary">
            {accept ? `Accepted: ${accept}` : 'Any file type'} (Max {maxSize}MB)
          </p>
        </label>

        <FileInput
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {helperText && (
        <p className="mt-2 text-xs text-text-secondary">{helperText}</p>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-text-primary">
            Selected files ({selectedFiles.length})
          </p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="w-5 h-5 text-text-secondary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-3 p-1 hover:bg-background-hover rounded transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-text-secondary hover:text-danger" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
