'use client';

import { Link } from '@/lib/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from 'flowbite-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import UploadField from '@/components/dashboard/projects/UploadField';
import { attachmentsApi } from '@/lib/api/attachments';
import type { ProjectWithRelations } from '@sumbi/shared-types';

interface ProjectHeaderProps {
  project: ProjectWithRelations;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const t = useTranslations('projects');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

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
      setUploadError(t('noFilesSelected'));
      return;
    }

    setIsUploading(true);
    try {
      // Upload files to the API
      const data = await attachmentsApi.upload(project.id, uploadedFiles);

      // Success - close modal and reset
      setShowUploadModal(false);
      setUploadedFiles([]);
      setUploadError('');
    } catch (error) {
      setUploadError(t('uploadError'));
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

  // Status badge styling based on status - using CSS variables
  const statusStyles: Record<'draft' | 'submitted' | 'locked' | 'public', string> = {
    'draft': 'bg-interactive-secondary text-text-accent',
    'submitted': 'bg-background-secondary text-[var(--color-warning)]',
    'locked': 'bg-background-secondary text-[var(--color-danger)]',
    'public': 'bg-background-secondary text-[var(--color-success)]',
  };

  // Format last updated date
  const lastUpdatedFormatted = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString()
    : undefined;

  return (
    <div className="mb-6">
      {/* Title section with status and category */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
            {project.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[project.status]}`}>
                {t(`status.${project.status}`)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="px-3 py-1 bg-interactive-secondary text-text-accent rounded-md font-medium">
              {project.subject}
            </span>
            {lastUpdatedFormatted && (
              <span>{t('lastUpdated')} {lastUpdatedFormatted}</span>
            )}
          </div>
        </div>

        {/* Action buttons (Export PDF, Upload File) */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium text-text-primary bg-background-elevated border border-border rounded-lg hover:bg-background-hover flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('exportPdf')}
          </button>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 text-sm font-medium text-text-inverse bg-interactive-primary rounded-lg hover:bg-interactive-primary-hover flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {t('uploadFile')}
          </button>
        </div>
      </div>

      {/* Upload File Modal */}
      {/*TODO: remade it to reusable component */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">{t('uploadFiles')}</h3>
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
                label={t('chooseFiles')}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                maxSize={10}
                multiple={true}
                onChange={handleFilesChange}
                onError={setUploadError}
                helperText="Accepted formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, TXT, ZIP (Max 10MB per file)"
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
                {isUploading ? t('uploading') : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
