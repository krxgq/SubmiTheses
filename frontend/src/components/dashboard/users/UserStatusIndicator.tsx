'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

interface UserStatusIndicatorProps {
  emailVerified: boolean;
}

/**
 * Displays a colored dot indicator showing user email verification status
 * Shows tooltip on hover explaining the status
 */
export function UserStatusIndicator({ emailVerified }: UserStatusIndicatorProps) {
  const t = useTranslations('users.status');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  // Update tooltip position when shown or on scroll/resize
  useEffect(() => {
    const updateTooltipPosition = () => {
      if (dotRef.current && showTooltip) {
        const rect = dotRef.current.getBoundingClientRect();
        setTooltipPosition({
          top: rect.bottom + window.scrollY + 8, // 8px gap below the dot
          left: rect.left + window.scrollX + (rect.width / 2), // Center horizontally
        });
      }
    };

    if (showTooltip) {
      updateTooltipPosition();
      window.addEventListener('resize', updateTooltipPosition);
      window.addEventListener('scroll', updateTooltipPosition, true);
      return () => {
        window.removeEventListener('resize', updateTooltipPosition);
        window.removeEventListener('scroll', updateTooltipPosition, true);
      };
    }
  }, [showTooltip]);

  // Don't show indicator for verified users
  if (emailVerified) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center justify-center cursor-help"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
          aria-label={t('pending')}
        />
      </div>

      {showTooltip && tooltipPosition && createPortal(
        <div
          className="fixed z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateX(-50%)', // Center horizontally
          }}
        >
          {t('pending')}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{
              top: '-4px',
              left: '50%',
              marginLeft: '-4px',
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
