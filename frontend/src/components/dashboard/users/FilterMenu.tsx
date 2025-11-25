'use client';

import { useState, useRef, useEffect } from 'react';
import { Funnel, X } from 'lucide-react';

interface FilterMenuProps {
  onFilterChange?: (filters: UserFilters) => void;
}

export interface UserFilters {
  role?: string[];
  year?: string;
}

export function FilterMenu({ onFilterChange }: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({});
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleRoleToggle = (role: string) => {
    const currentRoles = filters.role || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    const newFilters = {
      ...filters,
      role: newRoles.length > 0 ? newRoles : undefined
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const hasActiveFilters = (filters.role && filters.role.length > 0) || filters.year;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className={`p-2 rounded-lg transition-colors ${
          hasActiveFilters
            ? 'bg-primary text-text-inverse'
            : 'bg-background-secondary hover:bg-background-hover'
        }`}
        aria-label="Filter users"
      >
        <Funnel className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background-elevated rounded-lg shadow-lg z-10 border border-border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Filters</h3>
              <button
                onClick={toggleMenu}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  {['admin', 'teacher', 'student'].map((role) => (
                    <label key={role} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.role?.includes(role) || false}
                        onChange={() => handleRoleToggle(role)}
                        className="mr-2"
                      />
                      <span className="text-sm text-text-primary capitalize">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 px-4 text-sm bg-background-secondary hover:bg-background-hover text-text-primary rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
