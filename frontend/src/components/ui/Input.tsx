"use client";

import { Label } from "flowbite-react";
import { useState, ReactNode } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showCharCount?: boolean; // Show character counter when maxLength is set
}

// Custom Input component with floating label behavior and custom styling
export function Input({
  label,
  id,
  error,
  helperText,
  className = "",
  leftIcon,
  rightIcon,
  type = "text",
  required = false,
  showCharCount = false,
  maxLength,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    !!props.value || !!props.defaultValue,
  );

  // Get current character count from value
  const currentLength = String(props.value || '').length;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  const isFloating = isFocused || hasValue;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  return (
    <div className={`relative ${className}`}>
      {/* Left Icon */}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10">
          {leftIcon}
        </div>
      )}

      <input
        id={id}
        type={type}
        maxLength={maxLength}
        className={`
          peer w-full py-3 pt-6 pb-2
          ${hasLeftIcon ? "pl-10" : "pl-4"}
          ${hasRightIcon ? "pr-10" : "pr-4"}
          bg-background-elevated
          border rounded-lg
          text-text-primary
          placeholder-transparent
          transition-all duration-200
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

      {/* Right Icon */}
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary z-10">
          {rightIcon}
        </div>
      )}

      <Label
        htmlFor={id}
        className={`
          absolute transition-all duration-200 pointer-events-none text-text-secondary!
          ${hasLeftIcon ? "left-10" : "left-4"}
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
