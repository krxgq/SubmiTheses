"use client";

import { useState, useRef } from "react";
import { Label } from "flowbite-react";
import { Bold, Italic, Heading, List, Link as LinkIcon, Code } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MarkdownEditorProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  minHeight?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

// Markdown editor with toolbar buttons that insert syntax and live preview
export function MarkdownEditor({
  label,
  id,
  value,
  onChange,
  error,
  helperText,
  required = false,
  minHeight = 200,
  maxLength,
  showCharCount = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentLength = value.length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (maxLength && e.target.value.length > maxLength) {
      return; // Block typing when maxLength is reached
    }
    onChange(e.target.value);
  };

  // Insert markdown syntax at cursor or wrap selected text
  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    onChange(newText);

    // Restore focus and cursor position after markdown insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Insert markdown syntax at the start of current line
  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewline + 1;

    const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <Label
        htmlFor={id}
        className={`block text-sm font-medium ${
          error ? "text-danger" : "text-text-secondary"
        }`}
      >
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </Label>

      {/* Toolbar with markdown formatting buttons */}
      <div className="flex gap-1 p-2 border border-border rounded-lg bg-background-elevated">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-2 hover:bg-background-secondary rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="p-2 hover:bg-background-secondary rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertAtLineStart('## ')}
          className="p-2 hover:bg-background-secondary rounded transition-colors"
          title="Heading"
        >
          <Heading className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertAtLineStart('- ')}
          className="p-2 hover:bg-background-secondary rounded transition-colors"
          title="List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('[', '](url)')}
          className="p-2 hover:bg-background-secondary rounded transition-colors"
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('`', '`')}
          className="p-2 hover:bg-background-secondary rounded transition-colors"
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs for mobile - switch between write and preview */}
      <div className="flex gap-2 border-b border-border md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'write'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Editor area: side-by-side on desktop, tabs on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Textarea - raw markdown input */}
        <div className={activeTab === 'preview' ? 'hidden md:block' : ''}>
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            required={required}
            className={`
              w-full p-4 font-mono text-sm
              bg-background-elevated
              border rounded-lg
              text-text-primary
              resize-y
              focus:outline-none focus:ring-2
              ${
                error
                  ? "border-danger focus:ring-danger/20"
                  : "border-border hover:border-border-strong focus:border-primary focus:ring-primary/20"
              }
            `}
            style={{ minHeight }}
            placeholder="Type markdown here..."
          />
        </div>

        {/* Preview - rendered markdown */}
        <div className={activeTab === 'write' ? 'hidden md:block' : ''}>
          <div
            className="border border-border rounded-lg p-4 bg-background overflow-auto"
            style={{ minHeight }}
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-text-tertiary italic">Preview will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Helper text and character count */}
      <div className="flex justify-between items-start mt-1.5">
        {(helperText || error) && (
          <p
            className={`text-xs ${
              error ? "text-danger" : "text-text-secondary"
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
