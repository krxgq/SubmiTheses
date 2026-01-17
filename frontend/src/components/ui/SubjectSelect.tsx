"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "flowbite-react";
import { getActiveSubjects, type Subject } from "@/lib/api/subjects";

interface SubjectSelectProps {
  label: string;
  id: string;
  value: bigint | null; // Subject ID
  onChange: (subjectId: bigint) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
}

// Searchable dropdown for selecting subjects with i18n support
export function SubjectSelect({
  label,
  id,
  value,
  onChange,
  error,
  helperText,
  required = false,
}: SubjectSelectProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch active subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const activeSubjects = await getActiveSubjects();
        setSubjects(activeSubjects);
        setFilteredSubjects(activeSubjects);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Update filtered list when search changes
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = subjects.filter((subject) => {
      // Search in subject name
      const name = subject.name.toLowerCase();
      return name.includes(query);
    });
    setFilteredSubjects(filtered);
  }, [searchQuery, subjects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSubject = subjects.find((s) => s.id === value);
  const displayValue = selectedSubject ? selectedSubject.name : "";

  const hasValue = value !== null;
  const isFloating = isFocused || isOpen || hasValue;

  const handleSelect = (subjectId: bigint) => {
    onChange(subjectId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Floating label */}
      <Label
        htmlFor={id}
        className={`
          absolute transition-all duration-200 pointer-events-none left-4 z-10
          ${isFloating ? "top-1.5 text-xs" : "top-3.5 text-sm"}
          ${error ? "text-danger" : "text-text-secondary!"}
        `}
      >
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </Label>

      {/* Input field */}
      <input
        id={id}
        type="text"
        value={isOpen ? searchQuery : displayValue}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setIsOpen(true);
        }}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          // Prevent Enter from submitting the parent form
          if (e.key === 'Enter') {
            e.preventDefault();
            // If there's exactly one filtered subject, select it
            if (filteredSubjects.length === 1) {
              handleSelect(filteredSubjects[0].id);
            }
          }
        }}
        placeholder={label}
        disabled={isLoading}
        className={`
          peer w-full py-3 pt-6 pb-2 px-4
          bg-background-elevated
          border rounded-lg
          text-text-primary
          placeholder-transparent
          transition-all duration-200
          focus:outline-none focus:ring-2
          ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-border hover:border-border-strong focus:border-interactive-primary focus:ring-interactive-primary/20"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        readOnly={!isOpen}
      />

      {/* Dropdown list */}
      {isOpen && !isLoading && (
        <div className="absolute z-20 w-full mt-1 bg-background-elevated border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSubjects.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-secondary">
              No subjects found
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <button
                key={subject.id.toString()}
                type="button"
                onClick={() => handleSelect(subject.id)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-background-secondary transition-colors duration-150"
              >
                <span className="font-medium text-text-primary">
                  {subject.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p
          className={`mt-1.5 text-xs ${
            error ? "text-danger dark:text-danger" : "text-text-secondary"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
