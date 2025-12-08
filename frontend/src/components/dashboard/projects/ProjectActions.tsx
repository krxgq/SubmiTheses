'use client';

import { Share2, Printer, Bell, Upload, Edit, Trash2, UserPlus, UserMinus, FileDown } from 'lucide-react';
import { Button } from 'flowbite-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UploadField from './UploadField';
import { UserSelect } from '@/components/ui/UserSelect';
import { projectsApi } from '@/lib/api/projects';
import type { ProjectWithRelations } from '@sumbi/shared-types';
import { useAuth } from '@/hooks/useAuth';

interface ProjectActionsProps {
  project: ProjectWithRelations;
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const { user } = useAuth();
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

  // Check if user can manage this project (admin or supervisor)
  const canManage = user?.role === 'admin' || user?.id === project.supervisor_id;
  const hasStudent = !!project.student_id;

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
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAssignClick = () => {
    setSelectedStudentId(null);
    setShowAssignModal(true);
  };

  const handleAssignConfirm = async () => {
    if (!selectedStudentId) {
      toast.error('Please select a student');
      return;
    }

    setIsAssigning(true);
    try {
      await projectsApi.assignStudent(String(project.id), selectedStudentId);
      toast.success('Student assigned successfully');
      setShowAssignModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign student');
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
      toast.success('Student removed successfully');
      setShowRemoveStudentModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove student');
      console.error('Remove error:', error);
    } finally {
      setIsRemoving(false);
    }
  };

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

      toast.success('Files uploaded successfully');
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
      const response = await fetch(`/api/projects/${project.id}/export-pdf`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('PDF export failed:', errorData);
        throw new Error(errorData.error || 'Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zadani-${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF exported successfully');
    } catch (error: any) {
      console.error('PDF export error:', error);
      toast.error(error.message || 'Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <>
      <div className="bg-background-elevated rounded-lg border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Actions</h3>

        <div className="space-y-2">
          {/* Management Actions - Only for admin/supervisor */}
          {canManage && (
            <>
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
              >
                <Edit className="w-5 h-5 text-primary" />
                <span>Edit Project</span>
              </button>

              {/* Assign or Remove Student */}
              {!hasStudent ? (
                <button
                  onClick={handleAssignClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
                >
                  <UserPlus className="w-5 h-5 text-success" />
                  <span>Assign Student</span>
                </button>
              ) : (
                <button
                  onClick={handleRemoveStudentClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
                >
                  <UserMinus className="w-5 h-5 text-warning" />
                  <span>Remove Student</span>
                </button>
              )}

              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-danger bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-danger" />
                <span>Delete Project</span>
              </button>

              <div className="border-t border-border my-2" />
            </>
          )}

          {/* Upload File */}
          <button
            onClick={handleUploadClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-interactive-secondary rounded-lg hover:bg-interactive-secondary-hover transition-colors"
          >
            <Upload className="w-5 h-5 text-text-accent" />
            <span>Upload File</span>
          </button>

          {/* Export as PDF */}
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
            <span>{isExportingPDF ? 'Exporting...' : 'Export as PDF'}</span>
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

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">Assign Student</h3>
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

            <div className="p-6">
              <UserSelect
                label="Select Student"
                id="student"
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                role="student"
                helperText="Choose a student to assign to this project"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button color="gray" onClick={handleCloseAssignModal} disabled={isAssigning}>
                Cancel
              </Button>
              <Button onClick={handleAssignConfirm} disabled={isAssigning || !selectedStudentId}>
                {isAssigning ? 'Assigning...' : 'Assign Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Modal */}
      {showRemoveStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">Remove Student</h3>
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
                Are you sure you want to remove <strong>{project.student?.full_name || project.student?.email}</strong> from this project?
              </p>
              <p className="text-text-secondary text-sm">
                The student will no longer be assigned to this project.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button color="gray" onClick={handleCloseRemoveStudentModal} disabled={isRemoving}>
                Cancel
              </Button>
              <Button color="warning" onClick={handleRemoveStudentConfirm} disabled={isRemoving}>
                {isRemoving ? 'Removing...' : 'Remove Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background-elevated rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">Delete Project</h3>
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
                Are you sure you want to delete <strong>{project.title}</strong>?
              </p>
              <p className="text-text-secondary text-sm">
                This action cannot be undone. All project data, attachments, and related information will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button color="gray" onClick={handleCloseDeleteModal} disabled={isDeleting}>
                Cancel
              </Button>
              <Button color="failure" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
