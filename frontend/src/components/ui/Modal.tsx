"use client";

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

// Professional Modal component for dialogs and overlays
// Features backdrop blur, smooth animations, and flexible layout sections

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdropClick = true,
  showCloseButton = true,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-backdrop backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeStyles[size]}
          bg-background-elevated
          border border-border
          rounded-xl
          shadow-2xl
          transform transition-all duration-300
          animate-in fade-in zoom-in-95
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-background-hover"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}

        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-border">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-text-primary"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="mt-1 text-sm text-text-secondary"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-background-secondary rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Convenience component for modal actions
interface ModalActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center' | 'between';
}

export const ModalActions = ({
  children,
  align = 'right',
}: ModalActionsProps) => {
  const alignStyles = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center gap-3 ${alignStyles[align]}`}>
      {children}
    </div>
  );
};
