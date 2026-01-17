"use client";

import { Label } from "flowbite-react";
import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";

interface AcademicYearSelectorProps {
  label?: string;
  value: number; // Start year (e.g., 2025)
  onChange: (startYear: number) => void;
  error?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

// Component for selecting academic years in YYYY/YYYY+1 format with increment/decrement buttons
export function AcademicYearSelector({
  label = "Academic Year",
  value,
  onChange,
  error,
  helperText,
  className = "",
  required = false,
}: AcademicYearSelectorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [quickJumpValue, setQuickJumpValue] = useState(String(value));

  // Update quick jump input when value changes externally
  useEffect(() => {
    setQuickJumpValue(String(value));
  }, [value]);

  const handleIncrement = () => {
    if (value < MAX_YEAR) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > MIN_YEAR) {
      onChange(value - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const handleQuickJumpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuickJumpValue(newValue);

    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= MIN_YEAR && numValue <= MAX_YEAR) {
      onChange(numValue);
    }
  };

  const handleQuickJumpBlur = () => {
    // Ensure the input shows current value on blur
    setQuickJumpValue(String(value));
  };

  const isFloating = isFocused || true; // Always float label since component always has content

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          w-full py-3 pt-6 pb-2
          bg-background-elevated
          border rounded-lg
          transition-all duration-200
          ${
            error
              ? "border-danger"
              : "border-border hover:border-border-strong"
          }
        `}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Year Display with Increment/Decrement Buttons */}
        <div className="flex items-center justify-center gap-3 px-4">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= MIN_YEAR}
            className={`
              p-2 rounded-lg transition-colors
              ${
                value <= MIN_YEAR
                  ? "text-text-disabled cursor-not-allowed"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
              }
            `}
            aria-label="Decrement year"
            title="Previous year"
          >
            <Minus className="w-5 h-5" />
          </button>

          {/* Year Display */}
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-text-primary tabular-nums">
              {value} / {value + 1}
            </div>
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= MAX_YEAR}
            className={`
              p-2 rounded-lg transition-colors
              ${
                value >= MAX_YEAR
                  ? "text-text-disabled cursor-not-allowed"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
              }
            `}
            aria-label="Increment year"
            title="Next year"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Jump Input */}
        <div className="mt-3 px-4">
          <input
            type="number"
            value={quickJumpValue}
            onChange={handleQuickJumpChange}
            onBlur={handleQuickJumpBlur}
            min={MIN_YEAR}
            max={MAX_YEAR}
            placeholder="Quick jump to year..."
            className="
              w-full px-3 py-1.5 text-sm
              bg-background-secondary
              border border-border
              rounded text-text-primary
              placeholder-text-secondary/50
              focus:outline-none focus:ring-1 focus:ring-interactive-primary/30
              transition-all
            "
            aria-label="Quick jump to year"
          />
        </div>
      </div>

      {/* Floating Label */}
      <Label
        className={`
          absolute transition-all duration-200 pointer-events-none text-text-secondary
          left-4
          ${isFloating ? "top-1.5 text-xs" : "top-3.5 text-sm"}
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
