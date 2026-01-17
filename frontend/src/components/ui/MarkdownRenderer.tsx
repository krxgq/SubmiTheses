'use client';

import Markdown from 'marked-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Renders clean markdown content
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <Markdown gfm breaks>
        {content}
      </Markdown>
    </div>
  );
}
