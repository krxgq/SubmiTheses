import { NextRequest, NextResponse } from 'next/server';
import { projectsApiServer } from '@/lib/api/projects';
import { exportProjectToPDF } from '@/lib/pdfExport';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    console.log('Exporting PDF for project:', projectid);
    
    // Fetch project data
    const project = await projectsApiServer.getProjectById(projectid);
    console.log('Project fetched:', project.title);

    // Generate PDF
    const pdfBuffer = await exportProjectToPDF(project, {
      studentName: project.student?.full_name || 'Not assigned',
      studentClass: '4. A', // TODO: Get from student data
      schoolYear: '2025/2026', // TODO: Get from year data
      fieldOfStudy: 'Informační technologie 18-20-M/01', // TODO: Get from subject/program data
      supervisorName: project.supervisor?.full_name || 'Unknown',
    });
    console.log('PDF generated, buffer length:', pdfBuffer.length);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="zadani-${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF export error in API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
