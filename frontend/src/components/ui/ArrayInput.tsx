"use client";

import { useState } from "react";

interface ArrayInputProps {
  label: string;
  value: string[];
  onChange: (items: string[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  minItems?: number;
  placeholder?: string;
}

// Dynamic array input allowing add/remove of string items
export function ArrayInput({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  minItems = 1,
  placeholder = "Enter item",
}: ArrayInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleItemChange = (index: number, newValue: string) => {
    const newItems = [...value];
    newItems[index] = newValue;
    onChange(newItems);
  };

  const handleAddItem = () => {
    onChange([...value, ""]);
  };

  const handleRemoveItem = (index: number) => {
    if (value.length > minItems) {
      const newItems = value.filter((_, i) => i !== index);
      onChange(newItems);
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Items list */}
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Item number */}
            <span className="text-sm font-medium text-text-secondary w-6">
              {index + 1}.
            </span>

            {/* Input field */}
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              placeholder={placeholder}
              className={`
                flex-1 px-4 py-2
                bg-background-elevated
                border rounded-lg
                text-text-primary
                transition-all duration-200
                focus:outline-none focus:ring-2
                ${
                  error && item.trim().length === 0
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-border hover:border-border-strong focus:border-interactive-primary focus:ring-interactive-primary/20"
                }
              `}
            />

            {/* Remove button */}
            {value.length > minItems && (
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                aria-label={`Remove item ${index + 1}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={handleAddItem}
        className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary-dark transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add {label.toLowerCase().includes("output") ? "Output" : "Item"}
      </button>

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p
          className={`text-xs ${
            error ? "text-red-600 dark:text-red-400" : "text-text-secondary"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
