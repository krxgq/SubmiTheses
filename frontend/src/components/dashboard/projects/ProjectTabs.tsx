'use client';

import { useState } from 'react';

type TabKey = 'attachments' | 'links' | 'reviews' | 'grades';

/**
 * Tab navigation for project detail sections
 * Client component with tab switching functionality
 * Content sections are placeholders for future implementation
 */
export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('attachments');

  const tabs = [
    { key: 'attachments' as TabKey, label: 'Attachments' },
    { key: 'links' as TabKey, label: 'External Links' },
    { key: 'reviews' as TabKey, label: 'Reviews' },
    { key: 'grades' as TabKey, label: 'Grades' }
  ];

  return (
    <div className="bg-background-elevated rounded-lg border border-border">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.key
                  ? 'border-interactive-primary text-text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'attachments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Project Attachments</h3>
            {/* Placeholder for attachments list */}
            <div className="text-sm text-text-secondary bg-background-secondary rounded-lg p-8 text-center">
              Attachments section - to be implemented
              <br />
              <span className="text-xs">Will display uploaded files, PDFs, documents, etc.</span>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">External Links</h3>
            {/* Placeholder for external links */}
            <div className="text-sm text-text-secondary bg-background-secondary rounded-lg p-8 text-center">
              External links section - to be implemented
              <br />
              <span className="text-xs">Will display related URLs, resources, references, etc.</span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Reviews</h3>
            {/* Placeholder for reviews */}
            <div className="text-sm text-text-secondary bg-background-secondary rounded-lg p-8 text-center">
              Reviews section - to be implemented
              <br />
              <span className="text-xs">Will display supervisor and opponent reviews</span>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Grades</h3>
            {/* Placeholder for grades */}
            <div className="text-sm text-text-secondary bg-background-secondary rounded-lg p-8 text-center">
              Grades section - to be implemented
              <br />
              <span className="text-xs">Will display final grades and evaluation details</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
