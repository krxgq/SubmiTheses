import { exportProjectToPDF } from './pdfExport';
import { formatUserName } from "@/lib/formatters";
import type { ProjectWithRelations } from '@sumbi/shared-types';

/**
 * Download project as PDF
 * Generates PDF client-side and triggers download
 */
export async function downloadProjectPDF(project: ProjectWithRelations): Promise<void> {
  // Generate PDF client-side using @react-pdf/renderer
  const pdfBuffer = await exportProjectToPDF(project, {
    studentName: formatUserName(project.student?.first_name, project.student?.last_name) || 'Not assigned',
    studentClass: '4. A',
    schoolYear: '2025/2026',
    fieldOfStudy: 'Informační technologie 18-20-M/01',
    supervisorName: formatUserName(project.supervisor?.first_name, project.supervisor?.last_name) || 'Unknown',
  });
  
  // Create blob and trigger download
  const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `zadani-${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
