import { exportPosudekToPDF, type ReviewerGradeData } from './pdfPosudekExport';
import type { ProjectWithRelations } from '@sumbi/shared-types';

// Shape returned by projectsApi.getAllGrades()
type GradesPayload = Record<string, ReviewerGradeData>;

// Generates and triggers browser download of the posudek PDF.
// Accepts grades already fetched by GradesDisplay — no extra API call needed.
export async function downloadPosudekPDF(
  project: ProjectWithRelations,
  grades: GradesPayload
): Promise<void> {
  const pdfBuffer = await exportPosudekToPDF({
    project: { title: project.title },
    student: project.student ?? null,
    schoolYear: project.year?.name ?? 'Unknown',
    reviewers: Object.values(grades),
    supervisorId: project.supervisor_id ? String(project.supervisor_id) : null,
  });

  const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `posudek-${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
