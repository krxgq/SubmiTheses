'use client';

import { Link } from '@/lib/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from 'flowbite-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import UploadField from '@/components/dashboard/projects/UploadField';
import { attachmentsApi } from '@/lib/api/attachments';
import { downloadProjectPDF } from '@/lib/downloadPDF';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectWithRelations } from '@sumbi/shared-types';

interface ProjectHeaderProps {
  project: ProjectWithRelations;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const t = useTranslations('projects');
  const tButtons = useTranslations('buttons');
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Permission checks - same as ProjectActions component
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  const isAssignedStudent = isStudent && project.student_id === user?.id;
  const isSupervisor = isTeacher && project.supervisor_id === user?.id;
  const isOpponent = isTeacher && project.opponent_id === user?.id;
  const isAssignedTeacher = isSupervisor || isOpponent;

  // Can interact = can upload and export
  const canInteract = isAdmin || isAssignedStudent || isAssignedTeacher;

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
      // Upload files to the API (one at a time)
      for (const file of uploadedFiles) {
        await attachmentsApi.uploadAttachment({
          file,
          projectId: String(project.id),
        });
      }

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

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await downloadProjectPDF(project);
      toast.success(t('pdfExportSuccess'));
    } catch (error: any) {
      console.error('PDF export error:', error);
      toast.error(error.message || t('pdfExportFailed'));
    } finally {
      setIsExportingPDF(false);
    }
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
      {/* Title row: title/meta on left, action buttons on right */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{project.title}</h1>
            {project.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[project.status as keyof typeof statusStyles]}`}>
                {t(`status.${project.status}`)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary">
            <span className="px-3 py-1 bg-interactive-secondary text-text-accent rounded-md font-medium">
              {project.subject}
            </span>
            {lastUpdatedFormatted && (
              <span>{t('lastUpdated')} {lastUpdatedFormatted}</span>
            )}
          </div>
        </div>

        {/* Action buttons — Export PDF for all canInteract, Upload only for assigned student */}
        {canInteract && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-6 py-3 text-base font-medium text-text-primary bg-background-elevated border border-border rounded-lg hover:bg-background-hover flex items-center gap-2 disabled:opacity-50"
            >
              {isExportingPDF ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {isExportingPDF ? t('exporting') : t('exportPdf')}
            </button>
            {isAssignedStudent && (
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 text-base font-medium text-text-inverse bg-interactive-primary rounded-lg hover:bg-interactive-primary-hover flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {t('uploadFile')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {/*TODO: remade it to reusable component */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop">
          <div className="bg-background-elevated rounded-lg shadow-xl w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl mx-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
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

            <div className="p-3 sm:p-6 space-y-4">
              <UploadField
                label={t('chooseFiles')}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                maxSize={10}
                multiple={true}
                onChange={handleFilesChange}
                onError={setUploadError}
                helperText={t('fileFormatsHelper')}
              />

              {uploadError && (
                <div className="p-3 bg-danger/10 border border-danger rounded-lg">
                  <p className="text-sm text-danger">{uploadError}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleCloseModal} disabled={isUploading}>
                {tButtons('cancel')}
              </Button>
              <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleUploadSubmit} disabled={isUploading || uploadedFiles.length === 0}>
                {isUploading ? t('uploading') : t('uploadButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
