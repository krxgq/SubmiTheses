import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import type { Paragraph, Strong, Emphasis, Delete, InlineCode, Heading, List, ListItem, PhrasingContent } from 'mdast';

// Same font registration as pdfExport.tsx for consistent Czech character support
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Roboto', fontSize: 11 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  infoText: { fontSize: 11, marginBottom: 5 },
  sectionHeading: { fontSize: 14, fontWeight: 'bold', marginTop: 18, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#cccccc', paddingBottom: 4 },
  subheading: { fontSize: 12, fontWeight: 'bold', fontStyle: 'italic', marginTop: 8, marginBottom: 5 },
  normalText: { fontSize: 11, marginBottom: 3, lineHeight: 1.5 },
  bulletPoint: { fontSize: 11, marginLeft: 10, marginBottom: 3, lineHeight: 1.5 },
  bold: { fontWeight: 'bold' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cccccc', paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', marginBottom: 3 },
  tableCell: { fontSize: 10 },
  averageRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#eeeeee' },
});

export interface ReviewerGradeData {
  reviewer: { id: string; first_name: string | null; last_name: string | null };
  grades: Array<{ id: string | number; value: any; scales: { name: string; desc?: string | null; maxVal: any } }>;
  posudek: string | null;
}

export interface PosudekPDFData {
  project: { title: string };
  student: { first_name: string | null; last_name: string | null } | null;
  schoolYear: string;
  reviewers: ReviewerGradeData[];
  supervisorId: string | null;
}

const PosudekPDFDocument: React.FC<{ data: PosudekPDFData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Document title */}
      <Text style={styles.title}>Posudek maturitního projektu</Text>

      {/* Project metadata */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={[styles.infoText, { width: 110 }]}>Název práce:</Text>
          <Text style={styles.infoText}>{data.project.title}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={[styles.infoText, { width: 110 }]}>Student:</Text>
          <Text style={styles.infoText}>
            {data.student ? `${data.student.first_name ?? ''} ${data.student.last_name ?? ''}`.trim() || '—' : '—'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={[styles.infoText, { width: 110 }]}>Školní rok:</Text>
          <Text style={styles.infoText}>{data.schoolYear}</Text>
        </View>
      </View>

      {/* One section per reviewer */}
      {data.reviewers.map((reviewerData) => {
        const isSupervisor = reviewerData.reviewer.id === data.supervisorId;
        const roleLabel = isSupervisor ? 'Vedoucí' : 'Oponent';
        const fullName = `${reviewerData.reviewer.first_name ?? ''} ${reviewerData.reviewer.last_name ?? ''}`.trim() || '—';

        let totalScore = 0;
        let totalMax = 0;
        reviewerData.grades.forEach((g) => {
          totalScore += Number(g.value);
          totalMax += Number(g.scales.maxVal);
        });
        const avgPct = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(2) : '0.00';

        return (
          <View key={reviewerData.reviewer.id}>
            {/* Reviewer heading */}
            <Text style={styles.sectionHeading}>{fullName} ({roleLabel})</Text>

            {/* Grades table */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { width: '55%', fontWeight: 'bold' }]}>Kritérium</Text>
              <Text style={[styles.tableCell, { width: '15%', fontWeight: 'bold', textAlign: 'right' }]}>Body</Text>
              <Text style={[styles.tableCell, { width: '15%', fontWeight: 'bold', textAlign: 'right' }]}>Max</Text>
              <Text style={[styles.tableCell, { width: '15%', fontWeight: 'bold', textAlign: 'right' }]}>%</Text>
            </View>

            {reviewerData.grades.map((grade) => {
              const val = Number(grade.value);
              const max = Number(grade.scales.maxVal);
              const pct = max > 0 ? ((val / max) * 100).toFixed(1) : '0.0';
              return (
                <View key={String(grade.id)} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '55%' }]}>{grade.scales.name}</Text>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{val}</Text>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{max}</Text>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{pct}%</Text>
                </View>
              );
            })}

            {/* Weighted average */}
            <View style={styles.averageRow}>
              <Text style={[styles.tableCell, styles.bold]}>Celkový průměr: {avgPct} %</Text>
            </View>

            {/* Posudek (written evaluation with markdown support) */}
            {reviewerData.posudek && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subheading}>Posudek</Text>
                {renderMarkdown(reviewerData.posudek)}
              </View>
            )}
          </View>
        );
      })}
    </Page>
  </Document>
);

// Parses and renders markdown as @react-pdf/renderer primitives (copied from pdfExport.tsx)
function renderMarkdown(markdown: string): React.ReactElement[] {
  // Normalize escaped \n sequences to actual newlines so remark recognizes paragraph breaks
  const result = remark().use(remarkGfm).parse(markdown.replace(/\\n/g, '\n'));
  const elements: React.ReactElement[] = [];
  let keyCounter = 0;

  const extractText = (node: any): string => {
    if (node.type === 'text') return node.value;
    if (node.children) return node.children.map((c: any) => extractText(c)).join('');
    if (node.value) return node.value;
    return '';
  };

  const renderInlineNodes = (nodes: PhrasingContent[]): React.ReactNode =>
    nodes.map((node) => {
      const key = `inline-${keyCounter++}`;
      switch (node.type) {
        case 'text': return (node as any).value;
        case 'strong': return <Text key={key} style={{ fontWeight: 'bold' }}>{extractText(node)}</Text>;
        case 'emphasis': return <Text key={key} style={{ fontStyle: 'italic' }}>{extractText(node)}</Text>;
        case 'delete': return <Text key={key} style={{ textDecoration: 'line-through' }}>{extractText(node)}</Text>;
        case 'inlineCode': return <Text key={key} style={{ fontFamily: 'Courier', backgroundColor: '#f5f5f5' }}>{(node as InlineCode).value}</Text>;
        case 'link': return <Text key={key} style={{ textDecoration: 'underline', color: '#0066cc' }}>{extractText(node)}</Text>;
        case 'break': return '\n';
        default: return null;
      }
    });

  const renderNode = (node: any): React.ReactElement | React.ReactElement[] | null => {
    const key = `node-${keyCounter++}`;
    switch (node.type) {
      case 'heading': {
        const sizes = [14, 13, 12, 11, 11, 11];
        const fontSize = sizes[(node as Heading).depth - 1] || 11;
        return <Text key={key} style={[{ fontSize, fontWeight: 'bold', fontStyle: 'italic', marginTop: 8, marginBottom: 4 }]}>{extractText(node)}</Text>;
      }
      case 'paragraph':
        return <Text key={key} style={{ fontSize: 11, marginBottom: 3, lineHeight: 1.5 }}>{renderInlineNodes((node as Paragraph).children)}</Text>;
      case 'list':
        return (
          <View key={key} style={{ marginBottom: 5 }}>
            {(node as List).children.map((item, idx) => (
              <Text key={`${key}-${idx}`} style={{ fontSize: 11, marginLeft: 10, marginBottom: 3, lineHeight: 1.5 }}>• {extractText(item as ListItem)}</Text>
            ))}
          </View>
        );
      case 'blockquote':
        return <Text key={key} style={{ fontSize: 11, marginLeft: 15, fontStyle: 'italic', marginBottom: 3 }}>{extractText(node)}</Text>;
      case 'code':
        return <Text key={key} style={{ fontFamily: 'Courier', backgroundColor: '#f5f5f5', padding: 5, marginBottom: 3 }}>{node.value}</Text>;
      case 'thematicBreak':
        return <View key={key} style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 8 }} />;
      default:
        return null;
    }
  };

  result.children.forEach((node) => {
    const rendered = renderNode(node);
    if (rendered) {
      Array.isArray(rendered) ? elements.push(...rendered) : elements.push(rendered);
    }
  });

  return elements;
}

export async function exportPosudekToPDF(data: PosudekPDFData): Promise<Buffer> {
  const doc = <PosudekPDFDocument data={data} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
