'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link2, Paperclip, Save, Trash2, Plus, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import {
  getExternalLinksByProjectId,
  createExternalLink,
  updateExternalLink,
  deleteExternalLink,
  type ExternalLink as ExternalLinkType,
} from '@/lib/api/external-links';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectWithRelations } from '@sumbi/shared-types';
import { useTranslations } from 'next-intl';

interface ExternalLinksTabProps {
  projectId: string;
  project: ProjectWithRelations;
}

// Tracks local edits for each link (dirty state detection)
interface EditingState {
  url: string;
  description: string;
  isDirty: boolean;
}

/**
 * ExternalLinksTab - Manages external links for a project
 * Features: numbered list, URL editing, markdown descriptions, save/delete
 */
export default function ExternalLinksTab({ projectId, project }: ExternalLinksTabProps) {
  const t = useTranslations('projectDetail.externalLinks');
  const tButtons = useTranslations('buttons');

  const [links, setLinks] = useState<ExternalLinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStates, setEditingStates] = useState<Map<string, EditingState>>(new Map());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // New link state (not yet saved to backend)
  const [newLink, setNewLink] = useState<{ url: string; description: string } | null>(null);
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Description modal state
  const [descriptionModal, setDescriptionModal] = useState<{
    isOpen: boolean;
    linkId: string | 'new';
    url: string;
    description: string;
  } | null>(null);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    link: ExternalLinkType;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();

  // Permission checks
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAssignedStudent = isStudent && project.student_id === user?.id;
  const isSupervisor = isTeacher && project.supervisor_id === user?.id;

  // Can modify links: admin, supervisor, or assigned student (if not locked)
  const canModifyLinks = isAdmin || isSupervisor || (isAssignedStudent && project.status === 'draft');

  // Fetch links on mount
  useEffect(() => {
    fetchLinks();
  }, [projectId]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const data = await getExternalLinksByProjectId(projectId);
      setLinks(data);
      // Initialize editing states from fetched data
      const states = new Map<string, EditingState>();
      data.forEach(link => {
        states.set(link.id, {
          url: link.url,
          description: link.description || '',
          isDirty: false,
        });
      });
      setEditingStates(states);
    } catch (error: any) {
      toast.error(error.message || t('loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL input change for existing links
  const handleUrlChange = (linkId: string, newUrl: string) => {
    const link = links.find(l => l.id === linkId);
    if (!link) return;

    setEditingStates(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(linkId) || { url: link.url, description: link.description || '', isDirty: false };
      newMap.set(linkId, {
        ...current,
        url: newUrl,
        isDirty: newUrl !== link.url || current.description !== (link.description || ''),
      });
      return newMap;
    });
  };

  // Save an existing link
  const handleSaveLink = async (linkId: string) => {
    const state = editingStates.get(linkId);
    if (!state || !state.url.trim()) return;

    setSavingIds(prev => new Set(prev).add(linkId));
    try {
      const updated = await updateExternalLink(projectId, linkId, {
        url: state.url,
        description: state.description || undefined,
      });

      // Update local state
      setLinks(prev => prev.map(l => l.id === linkId ? updated : l));
      setEditingStates(prev => {
        const newMap = new Map(prev);
        newMap.set(linkId, { url: updated.url, description: updated.description || '', isDirty: false });
        return newMap;
      });

      toast.success(t('linkSaved'));
    } catch (error: any) {
      toast.error(error.message || t('linkSaveFailed'));
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(linkId);
        return newSet;
      });
    }
  };

  // Add new link row
  const handleAddLink = () => {
    if (newLink) return; // Already adding
    setNewLink({ url: '', description: '' });
  };

  // Save new link to backend
  const handleSaveNewLink = async () => {
    if (!newLink || !newLink.url.trim()) return;

    setIsSavingNew(true);
    try {
      const created = await createExternalLink(projectId, {
        url: newLink.url,
        description: newLink.description || undefined,
      });

      // Add to list and clear new link state
      setLinks(prev => [created, ...prev]);
      setEditingStates(prev => {
        const newMap = new Map(prev);
        newMap.set(created.id, { url: created.url, description: created.description || '', isDirty: false });
        return newMap;
      });
      setNewLink(null);

      toast.success(t('linkSaved'));
    } catch (error: any) {
      toast.error(error.message || t('linkSaveFailed'));
    } finally {
      setIsSavingNew(false);
    }
  };

  // Open description modal
  const handleOpenDescriptionModal = (linkId: string | 'new', url: string, description: string) => {
    setDescriptionModal({ isOpen: true, linkId, url, description });
  };

  // Save description from modal
  const handleSaveDescription = () => {
    if (!descriptionModal) return;

    if (descriptionModal.linkId === 'new') {
      // Update new link description
      setNewLink(prev => prev ? { ...prev, description: descriptionModal.description } : null);
    } else {
      // Update existing link's editing state
      const link = links.find(l => l.id === descriptionModal.linkId);
      if (link) {
        setEditingStates(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(descriptionModal.linkId) || { url: link.url, description: '', isDirty: false };
          newMap.set(descriptionModal.linkId, {
            ...current,
            description: descriptionModal.description,
            isDirty: current.url !== link.url || descriptionModal.description !== (link.description || ''),
          });
          return newMap;
        });
      }
    }

    setDescriptionModal(null);
  };

  // Delete link with confirmation
  const handleDeleteClick = (link: ExternalLinkType) => {
    setDeleteModal({ isOpen: true, link });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;

    setIsDeleting(true);
    try {
      await deleteExternalLink(projectId, deleteModal.link.id);

      setLinks(prev => prev.filter(l => l.id !== deleteModal.link.id));
      setEditingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(deleteModal.link.id);
        return newMap;
      });

      toast.success(t('linkDeleted'));
      setDeleteModal(null);
    } catch (error: any) {
      toast.error(error.message || t('linkDeleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel adding new link
  const handleCancelNewLink = () => {
    setNewLink(null);
  };

  // Check if URL is valid for external link display
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">{t('title')}</h3>
        {canModifyLinks && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleAddLink}
            disabled={!!newLink}
          >
            {t('addLink')}
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary rounded-lg border border-border p-4 animate-pulse"
            >
              <div className="h-5 bg-background-hover rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-background-hover rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : links.length === 0 && !newLink ? (
        // Empty state
        <div className="text-center py-12 bg-background-secondary rounded-lg border border-border">
          <Link2 className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary text-sm">{t('noLinks')}</p>
          <p className="text-text-secondary text-xs mt-1">{t('noLinksHelper')}</p>
        </div>
      ) : (
        // Links list
        <div className="space-y-3">
          {/* New link row (if adding) */}
          {newLink && (
            <div className="bg-background-secondary rounded-lg border-2 border-dashed border-primary p-4">
              <div className="flex items-start gap-3">
                <span className="text-text-secondary font-medium mt-2 min-w-[24px]">
                  {links.length + 1}.
                </span>
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder={t('urlPlaceholder')}
                    className="w-full px-3 py-2 bg-background-elevated border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    autoFocus
                  />
                  {newLink.description && (
                    <div className="text-xs text-text-secondary bg-background rounded p-2 border border-border">
                      <MarkdownRenderer content={newLink.description} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* Description button */}
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => handleOpenDescriptionModal('new', newLink.url, newLink.description)}
                    title={t('addDescription')}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  {/* Save button - always visible for new links */}
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={handleSaveNewLink}
                    disabled={!newLink.url.trim() || isSavingNew}
                    title={t('save')}
                    className="text-success hover:text-success"
                  >
                    {isSavingNew ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </Button>
                  {/* Cancel button */}
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={handleCancelNewLink}
                    disabled={isSavingNew}
                    title={tButtons('cancel')}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Existing links */}
          {links.map((link, index) => {
            const state = editingStates.get(link.id);
            const isSaving = savingIds.has(link.id);
            const currentUrl = state?.url ?? link.url;
            const currentDescription = state?.description ?? link.description ?? '';
            const isDirty = state?.isDirty ?? false;

            return (
              <div
                key={link.id}
                className="bg-background-secondary rounded-lg border border-border p-4 hover:border-border-strong transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Number */}
                  <span className="text-text-secondary font-medium mt-2 min-w-[24px]">
                    {(newLink ? index + 2 : index + 1)}.
                  </span>

                  <div className="flex-1 space-y-2">
                    {/* URL input (editable) or display (read-only) */}
                    {canModifyLinks ? (
                      <input
                        type="url"
                        value={currentUrl}
                        onChange={(e) => handleUrlChange(link.id, e.target.value)}
                        placeholder={t('urlPlaceholder')}
                        className="w-full px-3 py-2 bg-background-elevated border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : (
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        {currentUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Description preview */}
                    {currentDescription && (
                      <div className="text-xs text-text-secondary bg-background rounded p-2 border border-border">
                        <MarkdownRenderer content={currentDescription} />
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    {/* Open URL button (always visible) */}
                    {isValidUrl(currentUrl) && (
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-hover rounded-lg transition-colors"
                        title={t('openLink')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {canModifyLinks && (
                      <>
                        {/* Description button */}
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => handleOpenDescriptionModal(link.id, currentUrl, currentDescription)}
                          title={t('editDescription')}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>

                        {/* Save button - only visible when dirty */}
                        {isDirty && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={() => handleSaveLink(link.id)}
                            disabled={!currentUrl.trim() || isSaving}
                            title={t('save')}
                            className="text-success hover:text-success"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                        )}

                        {/* Delete button */}
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => handleDeleteClick(link)}
                          disabled={isSaving}
                          title={t('delete')}
                          className="text-danger hover:text-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Description Modal */}
      {descriptionModal && (
        <Modal
          isOpen={descriptionModal.isOpen}
          onClose={() => setDescriptionModal(null)}
          title={t('descriptionTitle')}
          size="lg"
          footer={
            <ModalActions>
              <Button variant="secondary" onClick={() => setDescriptionModal(null)}>
                {tButtons('cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveDescription}>
                {t('save')}
              </Button>
            </ModalActions>
          }
        >
          <div className="space-y-4">
            {/* Show URL for context */}
            <div className="text-sm text-text-secondary truncate">
              <span className="font-medium">URL:</span> {descriptionModal.url || t('noUrl')}
            </div>

            {/* Markdown editor for description */}
            <MarkdownEditor
              label={t('descriptionLabel')}
              id="link-description"
              value={descriptionModal.description}
              onChange={(value) => setDescriptionModal({ ...descriptionModal, description: value })}
              helperText={t('descriptionPlaceholder')}
              minHeight={150}
            />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => !isDeleting && setDeleteModal(null)}
          title={t('deleteTitle')}
          size="md"
          footer={
            <ModalActions>
              <Button
                variant="secondary"
                onClick={() => setDeleteModal(null)}
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
            <p className="text-text-primary">{t('deleteMessage')}</p>
            <p className="text-text-secondary text-sm truncate">
              {deleteModal.link.url}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
