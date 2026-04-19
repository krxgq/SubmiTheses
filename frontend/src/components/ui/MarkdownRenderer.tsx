'use client';

import Markdown from 'marked-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Renders clean markdown content — normalizes escaped \n sequences before parsing
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <Markdown gfm breaks>
        {content.replace(/\\n/g, '\n')}
      </Markdown>
    </div>
  );
}
