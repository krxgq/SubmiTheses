'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api/users';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface UserActionsMenuProps {
  userId: string;
  onUserDeleted?: () => void;
}

export function UserActionsMenu({ userId, onUserDeleted }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update menu position when opened or on scroll/resize
  useEffect(() => {
    const updateMenuPosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY + 8, // 8px gap (mt-2)
          left: rect.right + window.scrollX - 192, // 192px = w-48, align right
        });
      }
    };

    if (isOpen) {
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition, true);
      return () => {
        window.removeEventListener('resize', updateMenuPosition);
        window.removeEventListener('scroll', updateMenuPosition, true);
      };
    }
  }, [isOpen]);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleView = () => {
    router.push(`/users/${userId}`);
    setIsOpen(false);
  };

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
    setIsOpen(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    setIsOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await usersApi.delete(userId);
      toast.success('User deleted successfully');
      onUserDeleted?.(); // Triggers local state update in parent component
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1 hover:bg-background-hover rounded-full transition-colors"
        aria-label="User actions"
      >
        <MoreVertical className="w-5 h-5 text-text-secondary" />
      </button>

      {isOpen && menuPosition && createPortal(
        <div
          ref={menuRef}
          className="fixed w-48 bg-background-elevated rounded-md shadow-lg z-50 border border-border"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="py-1">
            <button
              onClick={handleView}
              className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-background-hover transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-background-hover transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        size="sm"
        footer={
          <ModalActions>
            <Button
              variant="secondary"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </ModalActions>
        }
      >
        <p className="text-text-secondary">
          All user data and associated information will be permanently removed from the system.
        </p>
      </Modal>
    </div>
  );
}
