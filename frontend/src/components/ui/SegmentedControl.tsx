"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

// Modern Segmented Control component for toggles (grid/list view, etc.)
// Features smooth sliding animation and compact design

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl = ({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps) => {
  return (
    <div
      className={`inline-flex items-center bg-background-secondary rounded-xl p-1 gap-1 ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 ease-in-out
              flex items-center gap-2
              ${
                isActive
                  ? 'bg-background-elevated shadow-sm text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {Icon && <Icon size={16} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
