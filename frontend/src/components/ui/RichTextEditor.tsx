"use client";

import { Label } from "flowbite-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface RichTextEditorProps {
  label: string;
  id: string;
  value: string; // markdown content
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  minHeight?: number;
}

export function RichTextEditor({
  label,
  id,
  value,
  onChange,
  error,
  helperText,
  required = false,
  minHeight = 200,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="text-text-secondary">Loading editor...</div>;
  }

  // Determine the actual theme being used
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const colorMode = currentTheme === 'dark' ? 'dark' : 'light';

  return (
    <div className="relative" data-color-mode={colorMode}>
      <Label
        htmlFor={id}
        className={`
          mb-2 block text-sm font-medium
          ${error ? "text-red-500 dark:text-red-400" : "text-text-secondary"}
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div
        className={`
          border rounded-lg overflow-hidden
          ${error ? "border-red-500" : "border-border"}
        `}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          height={minHeight}
          preview="edit"
          hideToolbar={false}
          enableScroll={true}
          visibleDragbar={false}
        />
      </div>

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p
          className={`mt-1.5 text-xs ${
            error ? "text-red-600 dark:text-red-400" : "text-text-secondary"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
