'use client';

import { Link } from '@/lib/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Upload } from 'lucide-react';
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

  const statusBadgeVariants: Record<string, 'neutral' | 'warning' | 'danger' | 'success'> = {
    draft: 'neutral',
    submitted: 'warning',
    locked: 'danger',
    public: 'success',
  };

  // Format last updated date
  const lastUpdatedFormatted = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString()
    : undefined;

  return (
    <div className="mb-6">
      {/* Title row: accent bar anchors the title, action buttons on right */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="border-l-4 border-primary pl-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{project.title}</h1>
            {project.status && (
              <Badge variant={statusBadgeVariants[project.status] ?? 'neutral'} dot>
                {t(`status.${project.status}`)}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary">
            <Badge variant="primary">{project.subject}</Badge>
            {lastUpdatedFormatted && (
              <span>{t('lastUpdated')} {lastUpdatedFormatted}</span>
            )}
          </div>
        </div>

        {/* Action buttons — compact on mobile, full size on desktop */}
        {canInteract && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              loading={isExportingPDF}
              leftIcon={!isExportingPDF ? <Download className="w-4 h-4" /> : undefined}
            >
              {isExportingPDF ? t('exporting') : t('exportPdf')}
            </Button>
            {isAssignedStudent && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadClick}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                {t('uploadFile')}
              </Button>
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
              <Button variant="secondary" size="md" onClick={handleCloseModal} disabled={isUploading}>
                {tButtons('cancel')}
              </Button>
              <Button variant="primary" size="md" onClick={handleUploadSubmit} loading={isUploading} disabled={isUploading || uploadedFiles.length === 0}>
                {t('uploadButton')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
