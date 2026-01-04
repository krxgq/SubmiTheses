"use client";

import { Label } from "flowbite-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// Dynamic import for MDX Editor to avoid SSR issues
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
);

interface RichTextEditorProps {
  label: string;
  id: string;
  value: string; // markdown content
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  minHeight?: number;
  maxHeight?: number | string; // Maximum height - accepts px (number) or vh/% (string)
  maxLength?: number; // Maximum character count
  showCharCount?: boolean; // Show character counter when maxLength is set
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
  maxHeight,
  maxLength,
  showCharCount = false,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editorPlugins, setEditorPlugins] = useState<any[]>([]);
  const { theme, systemTheme } = useTheme();

  // Get current character count from value
  const currentLength = value.length;

  // Handle onChange with maxLength enforcement
  const handleChange = (newValue: string) => {
    if (maxLength && newValue.length > maxLength) {
      // Don't allow exceeding maxLength
      return;
    }
    onChange(newValue);
  };

  useEffect(() => {
    setMounted(true);

    // Load plugins asynchronously
    import('@mdxeditor/editor').then((mod) => {
      setEditorPlugins([
        mod.headingsPlugin(),
        mod.listsPlugin(),
        mod.quotePlugin(),
        mod.thematicBreakPlugin(),
        mod.markdownShortcutPlugin(),
        mod.linkPlugin(),
        mod.linkDialogPlugin(),
        mod.codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
        mod.toolbarPlugin({
          toolbarContents: () => (
            <>
              <mod.UndoRedo />
              <mod.BoldItalicUnderlineToggles />
              <mod.BlockTypeSelect />
              <mod.CreateLink />
              <mod.ListsToggle />
              <mod.CodeToggle />
              <mod.InsertThematicBreak />
            </>
          ),
        }),
      ]);
    });
  }, []);

  if (!mounted || editorPlugins.length === 0) {
    return <div className="text-text-secondary">Loading editor...</div>;
  }

  // Determine the actual theme being used
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <div className="relative">
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
          border rounded-lg overflow-auto
          ${error ? "border-red-500" : "border-border"}
          ${isDark ? 'dark-theme dark-editor' : ''}
        `}
        style={{
          minHeight,
          maxHeight: maxHeight || 'none',
        }}
      >
        <MDXEditor
          markdown={value}
          onChange={handleChange}
          plugins={editorPlugins}
          contentEditableClassName="prose dark:prose-invert min-h-[200px] p-4"
          className={isDark ? 'dark-theme dark-editor' : ''}
        />
      </div>

      {/* Helper text or error message */}
      <div className="flex justify-between items-start mt-1.5">
        {(helperText || error) && (
          <p
            className={`text-xs ${
              error ? "text-red-600 dark:text-red-400" : "text-text-secondary"
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
