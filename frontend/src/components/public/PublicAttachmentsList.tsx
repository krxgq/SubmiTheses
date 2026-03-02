'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { publicProjectsApi } from '@/lib/api/projects';
import { useTranslations } from 'next-intl';

interface PublicAttachment {
  id: string;
  filename: string;
  description: string | null;
  uploaded_at: string;
}

interface PublicAttachmentsListProps {
  projectId: string;
}

/**
 * Read-only attachments list for public gallery project pages.
 * Fetches attachments via the public (no-auth) API and provides download links.
 */
export default function PublicAttachmentsList({ projectId }: PublicAttachmentsListProps) {
  const t = useTranslations('projectDetail.attachments');
  const [attachments, setAttachments] = useState<PublicAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch attachment list on mount
  useEffect(() => {
    publicProjectsApi.getAttachments(projectId)
      .then(setAttachments)
      .catch(() => setAttachments([]))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(new Date(dateString));
  };

  // TODO(human): Implement the download handler
  const handleDownload = async (attachment: PublicAttachment) => {
    setDownloadingId(attachment.id);
    try {
      const { downloadUrl, filename } = await publicProjectsApi.getDownloadUrl(projectId, attachment.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // silent fail for public page
    } finally {
      setDownloadingId(null);
    }
  };

  // Don't render the section if no attachments exist
  if (!isLoading && attachments.length === 0) return null;

  return (
    <div className="bg-background-elevated rounded-lg border border-border p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
        {t('listTitle', { count: attachments.length })}
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-background-secondary rounded-lg border border-border p-4 hover:border-border-strong transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="w-5 h-5 text-text-secondary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(attachment.uploaded_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(attachment)}
                  disabled={downloadingId === attachment.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary hover:bg-primary-hover text-text-inverse transition-colors disabled:opacity-50"
                >
                  {downloadingId === attachment.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />
                  }
                  {t('download')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
