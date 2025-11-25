'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from '@/lib/navigation';

interface UserActionsMenuProps {
  userId: string;
}

export function UserActionsMenu({ userId }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
    console.log('Delete user:', userId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-1 hover:bg-background-hover rounded-full transition-colors"
        aria-label="User actions"
      >
        <MoreVertical className="w-5 h-5 text-text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background-elevated rounded-md shadow-lg z-50 border border-border">
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
        </div>
      )}
    </div>
  );
}
