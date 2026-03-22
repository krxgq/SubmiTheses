'use client';
import { formatUserName } from "@/lib/formatters";

import { Share2, Bell, Upload, Edit, Trash2, UserPlus, UserMinus, FileDown, Lock, Unlock, Users, EyeOff } from 'lucide-react';
import { Button } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UploadField from './UploadField';
import SignUpButton from './SignUpButton';
import { UserSelect } from '@/components/ui/UserSelect';
import { projectsApi } from '@/lib/api/projects';
import { downloadProjectPDF } from '@/lib/downloadPDF';
import type { ProjectWithRelations } from '@sumbi/shared-types';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

// Signup student type from API
interface SignupStudent {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  class: string | null;
  signed_up_at: string;
}

interface ProjectActionsProps {
  project: ProjectWithRelations;
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const t = useTranslations('projectDetail.actions');
  const tSignups = useTranslations('projectDetail.actions.signups');
  const tMessages = useTranslations('projectDetail.messages');
  const tConfirmations = useTranslations('projectDetail.confirmations');
  const tButtons = useTranslations('buttons');

  const authState = useAuth();
  const { user } = authState;

  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Signup-related state
  const [signedUpStudents, setSignedUpStudents] = useState<SignupStudent[]>([]);
  const [isLoadingSignups, setIsLoadingSignups] = useState(false);

  // Permission checks based on user role and project relationship
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  // Check if user is assigned to this project
  const isAssignedStudent = isStudent && project.student_id === user?.id;
  const isSupervisor = isTeacher && project.supervisor_id === user?.id;
  const isOpponent = isTeacher && project.opponent_id === user?.id;
  const isAssignedTeacher = isSupervisor || isOpponent;

  // Derived permissions
  const canManage = isAdmin || isSupervisor; // Edit/Delete/Assign permissions
  const canEdit = isAdmin || (isAssignedStudent && project.status === 'draft') || isSupervisor;
  const canDelete = isAdmin || (isSupervisor && project.status === 'draft');
  const canInteract = isAdmin || isAssignedStudent || isAssignedTeacher; // Upload/Export/Share permissions
  const canLock = (isAdmin || isSupervisor) && project.status === 'draft';
  const canUnlock = (isAdmin || isSupervisor) && project.status === 'locked';
  const canPublish = isAdmin && project.status === 'locked';
  const canUnpublish = isAdmin && project.status === 'public'; // revert public → locked

  const hasStudent = !!project.student_id;

  // Check if user has ANY actions available - if not, hide the entire Actions section
  const hasAnyActions = canEdit || canManage || canDelete || canInteract;

  const handleEdit = () => {
    router.push(`/projects/${project.id}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await projectsApi.deleteProject(String(project.id));
      toast.success(tMessages('projectDeleted'));
      router.push('/projects');
    } catch (error: any) {
      toast.error(error.message || tMessages('projectDeleteFailed'));
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAssignClick = async () => {
    setSelectedStudentId(null);
    setShowAssignModal(true);

    // Fetch signed-up students when modal opens
    setIsLoadingSignups(true);
    try {
      const { signups } = await projectsApi.getProjectSignups(String(project.id));
      setSignedUpStudents(signups);
    } catch (error) {
      console.error('[ProjectActions] Error fetching signups:', error);
      setSignedUpStudents([]);
    } finally {
      setIsLoadingSignups(false);
    }
  };

  const handleAssignConfirm = async () => {
    if (!selectedStudentId) {
      toast.error(tMessages('selectStudent'));
      return;
    }

    setIsAssigning(true);
    try {
      await projectsApi.assignStudent(String(project.id), selectedStudentId);
      toast.success(tMessages('studentAssigned'));
      setShowAssignModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || tMessages('studentAssignFailed'));
      console.error('Assign error:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveStudentClick = () => {
    setShowRemoveStudentModal(true);
  };

  const handleRemoveStudentConfirm = async () => {
    setIsRemoving(true);
    try {
      await projectsApi.removeStudent(String(project.id));
      toast.success(tMessages('studentRemoved'));
      setShowRemoveStudentModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || tMessages('studentRemoveFailed'));
      console.error('Remove error:', error);
    } finally {
      setIsRemoving(false);
    }
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
      setUploadError(tMessages('selectFile'));
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - close modal and reset
      setShowUploadModal(false);
      setUploadedFiles([]);
      setUploadError('');

      toast.success(tMessages('filesUploaded'));
    } catch (error) {
      setUploadError(tMessages('filesUploadFailed'));
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

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedStudentId(null);
  };

  const handleCloseRemoveStudentModal = () => {
    setShowRemoveStudentModal(false);
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await downloadProjectPDF(project);
      toast.success(tMessages('pdfExported'));
    } catch (error: any) {
      console.error('PDF export error:', error);
      toast.error(error.message || tMessages('pdfExportFailed'));
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleLock = async () => {
    setIsLocking(true);
    try {
      await projectsApi.lockProject(String(project.id));
      toast.success(tMessages('projectLocked'));
      // Force page reload to show updated status
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || tMessages('projectLockFailed'));
      console.error('Lock error:', error);
      setIsLocking(false);
    }
  };

  const handleUnlock = async () => {
    setIsLocking(true);
    try {
      await projectsApi.unlockProject(String(project.id));
      toast.success(tMessages('projectUnlocked'));
      // Force page reload to show updated status
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || tMessages('projectUnlockFailed'));
      console.error('Unlock error:', error);
      setIsLocking(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await projectsApi.publishProject(String(project.id));
      toast.success(tMessages('projectPublished'));
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || tMessages('projectPublishFailed'));
      console.error('Publish error:', error);
      setIsPublishing(false);
    }
  };

  // Unpublish: revert public → locked (admin only)
  const handleUnpublish = async () => {
    setIsPublishing(true);
    try {
      await projectsApi.lockProject(String(project.id));
      toast.success(tMessages('projectUnpublished'));
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || tMessages('projectUnpublishFailed'));
      console.error('Unpublish error:', error);
      setIsPublishing(false);
    }
  };

  // Early return if user has no actions available - hide entire Actions section
  if (!hasAnyActions) {
    return null;
  }

  return (
    <>
      <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('title')}</h3>

        <div className="space-y-2">
          {/* Edit Button - Admin, assigned student (draft only), or supervisor */}
          {canEdit && (
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
            >
              <Edit className="w-5 h-5 text-primary" />
              <span>{t('editProject')}</span>
            </button>
          )}

          {/* Lock Button - Admin or supervisor can lock any unlocked project */}
          {canLock && (
            <button
              onClick={handleLock}
              disabled={isLocking}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors disabled:opacity-50"
            >
              <Lock className="w-5 h-5 text-warning" />
              <span>{isLocking ? t('locking') : t('lockProject')}</span>
            </button>
          )}

          {/* Unlock Button - Admin or supervisor can unlock locked projects */}
          {canUnlock && (
            <button
              onClick={handleUnlock}
              disabled={isLocking}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors disabled:opacity-50"
            >
              <Unlock className="w-5 h-5 text-success" />
              <span>{isLocking ? t('unlocking') : t('unlockProject')}</span>
            </button>
          )}

          {/* Publish Button - Admin only */}
          {canPublish && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-inverse bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" />
              <span>{isPublishing ? t('publishing') : t('publishProject')}</span>
            </button>
          )}

          {/* Unpublish Button - Admin only, when project is public */}
          {canUnpublish && (
            <button
              onClick={handleUnpublish}
              disabled={isPublishing}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-warning bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors disabled:opacity-50"
            >
              <EyeOff className="w-5 h-5" />
              <span>{isPublishing ? t('unpublishing') : t('unpublishProject')}</span>
            </button>
          )}

          {/* Locked Indicator */}
          {project.status === 'locked' && (
            <div className="p-3 bg-warning/10 border border-warning rounded-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-warning flex-shrink-0" />
              <span className="text-sm text-warning font-medium">{t('projectLocked')}</span>
            </div>
          )}

          {/* Student Signup - For students viewing available projects */}
          <SignUpButton project={project} />

          {/* Student Assignment - Only for admin/supervisor */}
          {canManage && (
            <>
              {!hasStudent ? (
                <button
                  onClick={handleAssignClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
                >
                  <UserPlus className="w-5 h-5 text-success" />
                  <span>{t('assignStudent')}</span>
                </button>
              ) : (
                <button
                  onClick={handleRemoveStudentClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
                >
                  <UserMinus className="w-5 h-5 text-warning" />
                  <span>{t('removeStudent')}</span>
                </button>
              )}
            </>
          )}

          {/* Delete Button - Admin or supervisor (draft only) */}
          {canDelete && (
            <>
              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-danger" />
                <span>{t('deleteProject')}</span>
              </button>
            </>
          )}

          {/* Separator if there are management actions */}
          {(canEdit || canManage || canDelete) && <div className="border-t border-border my-2" />}

          {/* Upload and Export - Only for admin, assigned student, supervisor, or opponent */}
          {canInteract && (
            <>
              <button
                onClick={handleUploadClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
              >
                <Upload className="w-5 h-5 text-text-accent" />
                <span>{t('uploadFile')}</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors disabled:opacity-50"
              >
                {isExportingPDF ? (
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <FileDown className="w-5 h-5 text-text-accent" />
                )}
                <span>{isExportingPDF ? t('exporting') : t('exportPdf')}</span>
              </button>
            </>
          )}

        </div>
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">{t('uploadFile')}</h3>
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
                label={t('selectFiles')}
                accept=".pdf,.doc,.docx,.txt,.zip"
                maxSize={20}
                multiple={true}
                onChange={handleFilesChange}
                onError={setUploadError}
                helperText={t('acceptedFormats')}
              />

              {uploadError && (
                <div className="p-3 bg-danger/10 border border-danger rounded-lg">
                  <p className="text-sm text-danger">{uploadError}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button className="bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleCloseModal} disabled={isUploading}>
                {tButtons('cancel')}
              </Button>
              <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleUploadSubmit} disabled={isUploading || uploadedFiles.length === 0}>
                {isUploading ? t('uploading') : t('upload')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">{t('assignStudent')}</h3>
              <button
                onClick={handleCloseAssignModal}
                className="text-text-secondary hover:text-text-primary"
                disabled={isAssigning}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6  space-y-4">
              {/* Loading signups */}
              {isLoadingSignups && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}

              {!isLoadingSignups && (
                <>
                  {/* Signed-up students section - always shown at top if any */}
                  {signedUpStudents.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Users className="w-4 h-4" />
                        <span>{tSignups('interestedStudents')} ({signedUpStudents.length})</span>
                      </div>

                      <div className="space-y-2">
                        {signedUpStudents.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`w-full p-3 rounded-lg border text-left transition-colors ${
                              selectedStudentId === student.id
                                ? 'border-primary bg-primary/10'
                                : 'border-primary/30 bg-primary/5 hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-text-primary">
                                {formatUserName(student.first_name, student.last_name) || student.email}
                              </div>
                              <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                                {tSignups('interested')}
                              </span>
                            </div>
                            <div className="text-sm text-text-secondary flex items-center gap-2 mt-1">
                              <span>{student.email}</span>
                              {student.class && (
                                <>
                                  <span className="text-text-muted">·</span>
                                  <span>{student.class}</span>
                                </>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider between signed-up and all students */}
                  {signedUpStudents.length > 0 && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 border-t border-border"></div>
                      <span className="text-xs text-text-muted">{tSignups('orSelectFromAll')}</span>
                      <div className="flex-1 border-t border-border"></div>
                    </div>
                  )}

                  {/* Student select for all students */}
                  <UserSelect
                    label={signedUpStudents.length > 0 ? tSignups('allStudents') : t('selectStudent')}
                    id="student"
                    value={selectedStudentId}
                    onChange={setSelectedStudentId}
                    role="student"
                    helperText={t('selectStudentHelper')}
                    required
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button className="bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleCloseAssignModal} disabled={isAssigning}>
                {tButtons('cancel')}
              </Button>
              <Button className="bg-primary hover:bg-primary-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleAssignConfirm} disabled={isAssigning || !selectedStudentId}>
                {isAssigning ? t('assigning') : t('assignStudent')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Modal */}
      {showRemoveStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">{tConfirmations('removeStudentTitle')}</h3>
              <button
                onClick={handleCloseRemoveStudentModal}
                className="text-text-secondary hover:text-text-primary"
                disabled={isRemoving}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-text-primary mb-2">
                {tConfirmations('removeStudentMessage', { name: formatUserName(project.student?.first_name, project.student?.last_name) || project.student?.email || '' })}
              </p>
              <p className="text-text-secondary text-sm">
                {tConfirmations('removeStudentDescription')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button className="bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleCloseRemoveStudentModal} disabled={isRemoving}>
                {tButtons('cancel')}
              </Button>
              <Button className="bg-warning hover:bg-warning-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleRemoveStudentConfirm} disabled={isRemoving}>
                {isRemoving ? t('removing') : t('removeStudent')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">{tConfirmations('deleteProjectTitle')}</h3>
              <button
                onClick={handleCloseDeleteModal}
                className="text-text-secondary hover:text-text-primary"
                disabled={isDeleting}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-text-primary mb-2">
                {tConfirmations('deleteProjectMessage', { title: project.title })}
              </p>
              <p className="text-text-secondary text-sm">
                {tConfirmations('deleteProjectDescription')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button className="bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleCloseDeleteModal} disabled={isDeleting}>
                {tButtons('cancel')}
              </Button>
              <Button className="bg-danger hover:bg-danger-hover text-text-inverse px-6 py-2.5 rounded-lg font-medium transition-all" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? t('deleting') : t('deleteProject')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
