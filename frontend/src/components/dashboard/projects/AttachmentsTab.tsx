'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download, Trash2, FileText } from 'lucide-react';
import UploadField from './UploadField';
import {
  uploadAttachment,
  getAttachmentsByProjectId,
  getDownloadUrl,
  deleteAttachment,
  type Attachment,
} from '@/lib/api/attachments';
import { Progress } from 'flowbite-react';
import { Button } from '@/components/ui/Button';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectWithRelations } from '@sumbi/shared-types';
import { useTranslations } from 'next-intl';

interface AttachmentsTabProps {
  projectId: string;
  project: ProjectWithRelations; // Project data for permission checks
}

/**
 * AttachmentsTab - Manages file attachments for a project
 * Features: S3 upload with progress, download, delete with confirmation
 */
export default function AttachmentsTab({ projectId, project }: AttachmentsTabProps) {
  const t = useTranslations('projectDetail.attachments');
  const tButtons = useTranslations('buttons');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get current user for permission checks
  const { user } = useAuth();

  // Permission checks based on user role and project relationship
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  // Check if current user can delete attachments
  const isAssignedStudent = isStudent && project.student_id === user?.id;
  const isSupervisor = isTeacher && project.supervisor_id === user?.id;

  // Can delete if:
  // - Admin (always)
  // - Supervisor (always, even when locked)
  // - Assigned student (only if project is not locked)
  const canDeleteAttachments = isAdmin || isSupervisor || (isAssignedStudent && project.status === 'draft');

  // Fetch attachments when component mounts
  useEffect(() => {
    fetchAttachments();
  }, [projectId]);

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      const data = await getAttachmentsByProjectId(projectId);
      setAttachments(data);
    } catch (error: any) {
      toast.error(error.message || t('loadFailed'));
      console.error('Fetch attachments error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0]; // Single file upload
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload to S3 with progress tracking
      const newAttachment = await uploadAttachment(
        projectId,
        file,
        undefined, // description is optional
        (progress) => setUploadProgress(progress)
      );

      // Add to list
      setAttachments((prev) => [newAttachment, ...prev]);
      toast.success(t('fileUploaded', { name: file.name }));
    } catch (error: any) {
      toast.error(error.message || t('fileUploadFailed'));
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      // Get pre-signed download URL from backend
      const { downloadUrl, filename } = await getDownloadUrl(
        projectId,
        attachment.id
      );

      // Trigger browser download using anchor tag
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t('downloading', { name: filename }));
    } catch (error: any) {
      toast.error(error.message || t('downloadFailed'));
      console.error('Download error:', error);
    }
  };

  const handleDeleteClick = (attachment: Attachment) => {
    setAttachmentToDelete(attachment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!attachmentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAttachment(projectId, attachmentToDelete.id);

      // Remove from list
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentToDelete.id));
      toast.success(t('fileDeleted', { name: attachmentToDelete.filename }));
      setDeleteModalOpen(false);
      setAttachmentToDelete(null);
    } catch (error: any) {
      toast.error(error.message || t('fileDeleteFailed'));
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return `0 ${t('sizes.bytes')}`;
    const k = 1024;
    const sizes = [t('sizes.bytes'), t('sizes.kb'), t('sizes.mb'), t('sizes.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('uploadTitle')}</h3>
        <UploadField
          label={t('uploadLabel')}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip"
          maxSize={10}
          multiple={false}
          onChange={handleFileUpload}
          disabled={isUploading}
          helperText={t('uploadHelper')}
        />

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">{t('uploading')}</span>
              <span className="text-sm text-text-secondary">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress progress={uploadProgress} color="blue" size="sm" />
          </div>
        )}
      </div>

      {/* Attachments List */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t('listTitle', { count: attachments.length })}
        </h3>

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background-secondary rounded-lg border border-border p-4 animate-pulse"
              >
                <div className="h-5 bg-background-hover rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-background-hover rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : attachments.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-background-secondary rounded-lg border border-border">
            <FileText className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">{t('noAttachments')}</p>
            <p className="text-text-secondary text-xs mt-1">
              {t('noAttachmentsHelper')}
            </p>
          </div>
        ) : (
          // Attachments list
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="bg-background-secondary rounded-lg border border-border p-4 hover:border-border-strong transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {t('uploaded', { date: formatDate(attachment.uploaded_at) })}
                      </p>
                      {attachment.description && (
                        <p className="text-xs text-text-secondary mt-1 italic">
                          {attachment.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary-hover text-text-inverse flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="w-4 h-4" />
                      {t('download')}
                    </Button>
                    {/* Delete Button - Only show if user has permission */}
                    {canDeleteAttachments && (
                      <Button
                        size="sm"
                        className="bg-danger hover:bg-danger-hover text-text-inverse flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all"
                        onClick={() => handleDeleteClick(attachment)}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('delete')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title={t('deleteTitle')}
        size="md"
        footer={
          <ModalActions>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              {tButtons('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              loading={isDeleting}
            >
              {t('delete')}
            </Button>
          </ModalActions>
        }
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            {t('deleteMessage', { filename: attachmentToDelete?.filename || '' })}
          </p>
          <p className="text-text-secondary text-sm">
            {t('deleteDescription')}
          </p>
        </div>
      </Modal>
    </div>
  );
}
