"use client";

import { Label } from "flowbite-react";
import { useState } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  className?: string;
  showCharCount?: boolean; // Show character counter when maxLength is set
}

// Custom Textarea component with floating label behavior matching Input component style
export function Textarea({
  label,
  id,
  error,
  helperText,
  className = "",
  required = false,
  rows = 3,
  showCharCount = false,
  maxLength,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    !!props.value || !!props.defaultValue,
  );

  // Get current character count from value
  const currentLength = String(props.value || '').length;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  const isFloating = isFocused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        className={`
          peer w-full py-3 pt-6 pb-2 px-4
          bg-background-elevated
          border rounded-lg
          text-text-primary
          placeholder-transparent
          transition-all duration-200
          resize-y
          focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-border hover:border-border-strong focus:border-interactive-primary focus:ring-interactive-primary/20"
          }
        `}
        placeholder={label}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        required={required}
        {...props}
      />

      <Label
        htmlFor={id}
        className={`
          absolute transition-all duration-200 pointer-events-none left-4 text-text-secondary!
          ${isFloating ? "top-1.5 text-xs" : "top-3.5 text-sm"}
          ${error ? "text-red-500" : ""}
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Helper text or error message */}
      <div className="flex justify-between items-start mt-1.5">
        {(helperText || error) && (
          <p
            className={`text-xs ${
              error ? "text-red-600" : "text-text-secondary"
            }`}
          >
            {error || helperText}
          </p>
        )}
        {showCharCount && maxLength && (
          <p className="text-xs text-text-secondary ml-auto">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
