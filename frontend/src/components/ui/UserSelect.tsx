"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "flowbite-react";
import { usersApi, type User } from "@/lib/api/users";
import { formatUserName } from "@/lib/formatters";

interface UserSelectProps {
  label: string;
  id: string;
  value: string | null;  // UUID of selected user
  onChange: (userId: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  excludeUserId?: string;  // Don't show this user in dropdown
  role?: 'teacher' | 'student';  // Filter by role
}

// Searchable dropdown for selecting users with autocomplete
export function UserSelect({
  label,
  id,
  value,
  onChange,
  error,
  helperText,
  required = false,
  excludeUserId,
  role = 'teacher',  // Default to teacher for backward compatibility
}: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch users by role on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await usersApi.getByRole(role);

        // Filter out excluded user
        const availableUsers = excludeUserId
          ? fetchedUsers.filter((u) => u.id !== excludeUserId)
          : fetchedUsers;

        setUsers(availableUsers);
        setFilteredUsers(availableUsers);
      } catch (err) {
        console.error(`Failed to fetch ${role}s:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [excludeUserId, role]);

  // Update filtered list when search changes
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        formatUserName(user.first_name, user.last_name).toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedUser = users.find((u) => u.id === value);
  const displayValue = selectedUser
    ? `${formatUserName(selectedUser.first_name, selectedUser.last_name) || selectedUser.email} (${selectedUser.email})`
    : "";

  const hasValue = value !== null;
  const isFloating = isFocused || isOpen || hasValue;

  const handleSelect = (userId: string) => {
    onChange(userId);
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
          ${error ? "text-danger dark:text-danger" : "text-text-secondary"}
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
            // If there's exactly one filtered user, select it
            if (filteredUsers.length === 1) {
              handleSelect(filteredUsers[0].id);
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
              ? "border-danger dark:border-danger focus:border-danger focus:ring-danger/20"
              : "border-border hover:border-border-strong focus:border-interactive-primary focus:ring-interactive-primary/20"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        readOnly={!isOpen}
      />

      {/* Dropdown list */}
      {isOpen && !isLoading && (
        <div className="absolute z-20 w-full mt-1 bg-background-elevated border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-secondary">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.id)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-background-secondary transition-colors duration-150 flex flex-col"
              >
                <span className="font-medium text-text-primary">
                  {formatUserName(user.first_name, user.last_name) || user.email}
                </span>
                <span className="text-xs text-text-secondary">{user.email}</span>
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
