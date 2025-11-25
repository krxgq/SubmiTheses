'use client';

import { Share2, Printer, Bell, Upload } from 'lucide-react';
import { Button } from 'flowbite-react';
import { useState } from 'react';
import UploadField from './UploadField';

export default function ProjectActions() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleShare = () => {
    console.log('Share project');
  };

  const handlePrint = () => {
    // TODO: Implement print functionality
    console.log('Print view - to be implemented');
  };

  const handleNotifications = () => {
    console.log('Toggle notifications');
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setUploadError('');
  };

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    setUploadError('');
  };

  const handleUploadSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload logic here
      // Example: await uploadFiles(projectId, uploadedFiles);

      console.log('Uploading files:', uploadedFiles);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - close modal and reset
      setShowUploadModal(false);
      setUploadedFiles([]);
      setUploadError('');

      // TODO: Show success toast/notification
    } catch (error) {
      setUploadError('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadedFiles([]);
    setUploadError('');
  };

  return (
    <>
      <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Actions</h3>

        <div className="space-y-2">
          {/* Upload File */}
          <button
            onClick={handleUploadClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
          >
            <Upload className="w-5 h-5 text-text-accent" />
            <span>Upload File</span>
          </button>

          {/* Share Project */}
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
          >
            <Share2 className="w-5 h-5 text-text-accent" />
            <span>Share Project</span>
          </button>

          {/* Print View */}
          <button
            onClick={handlePrint}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
          >
            <Printer className="w-5 h-5 text-text-secondary" />
            <span>Print View</span>
          </button>

          {/* Notifications */}
          <button
            onClick={handleNotifications}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
          >
            <Bell className="w-5 h-5 text-text-accent" />
            <span>Notifications</span>
          </button>
        </div>
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">Upload Files</h3>
              <button
                onClick={handleCloseModal}
                className="text-text-secondary hover:text-text-primary"
                disabled={isUploading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <UploadField
                label="Select files to upload"
                accept=".pdf,.doc,.docx,.txt,.zip"
                maxSize={20}
                multiple={true}
                onChange={handleFilesChange}
                onError={setUploadError}
                helperText="Accepted formats: PDF, DOC, DOCX, TXT, ZIP (Max 20MB per file)"
              />

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{uploadError}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button color="gray" onClick={handleCloseModal} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleUploadSubmit} disabled={isUploading || uploadedFiles.length === 0}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
