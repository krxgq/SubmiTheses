"use client";

import { Label } from "flowbite-react";
import { useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  id: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  className?: string;
  placeholder?: string;
}

// Custom Select component with floating label behavior matching Input and Textarea
export function Select({
  label,
  id,
  options,
  value,
  onChange,
  error,
  helperText,
  className = "",
  placeholder,
  required = false,
  ...props
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Label floats when select is focused or has a value selected
  const isFloating = isFocused || !!value;

  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        value={value}
        className={`
          peer w-full py-3 pt-6 pb-2 px-4
          bg-background-elevated
          border rounded-lg
          text-text-primary
          transition-all duration-200
          cursor-pointer
          focus:outline-none focus:ring-2
          ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-border hover:border-border-strong focus:border-interactive-primary focus:ring-interactive-primary/20"
          }
        `}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        required={required}
        {...props}
      >
        {/* Optional placeholder as first option */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {/* Map through options to create option elements */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Floating label */}
      <Label
        htmlFor={id}
        className={`
          absolute transition-all duration-200 pointer-events-none left-4 text-text-secondary!
          ${isFloating ? "top-1.5 text-xs bg-background-elevated px-1" : "top-3.5 text-sm"}
          ${error ? "text-danger" : ""}
        `}
      >
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </Label>

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p
          className={`mt-1.5 text-xs ${
            error ? "text-danger" : "text-text-secondary"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
