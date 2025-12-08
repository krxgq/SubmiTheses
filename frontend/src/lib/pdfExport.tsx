import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import type { ProjectWithRelations, ProjectScheduleEntry } from "@sumbi/shared-types";
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import type { Root, Paragraph, Text as MdText, Strong, Emphasis, Delete, InlineCode, Heading, List, ListItem, BlockContent, PhrasingContent } from 'mdast';

interface PDFExportOptions {
  studentName: string;
  studentClass: string;
  schoolYear: string;
  fieldOfStudy: string;
  supervisorName: string;
}

// Register fonts with Czech character support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Roboto',
    fontSize: 11,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  studentInfoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  studentInfoCol: {
    width: '50%',
  },
  infoText: {
    fontSize: 11,
    marginBottom: 5,
  },
  mainHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 5,
  },
  normalText: {
    fontSize: 11,
    marginBottom: 3,
    lineHeight: 1.5,
  },
  bulletPoint: {
    fontSize: 11,
    marginLeft: 10,
    marginBottom: 3,
    lineHeight: 1.5,
  },
  scheduleItem: {
    fontSize: 11,
    marginBottom: 3,
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  },
});

interface PDFDocumentProps {
  project: ProjectWithRelations;
  options: PDFExportOptions;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ project, options }) => {
  const description = project.project_description;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>
          Zadání maturitního projektu z informatických předmětů
        </Text>

        {/* Student Info - Single column with consistent label width */}
        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={[styles.infoText, { width: 110 }]}>Jméno a příjmení:</Text>
            <Text style={styles.infoText}>{options.studentName}</Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={[styles.infoText, { width: 110 }]}>Pro školní rok:</Text>
            <Text style={styles.infoText}>{options.schoolYear}</Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={[styles.infoText, { width: 110 }]}>Třída:</Text>
            <Text style={styles.infoText}>{options.studentClass}</Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={[styles.infoText, { width: 110 }]}>Obor:</Text>
            <Text style={styles.infoText}>{options.fieldOfStudy}</Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 3, marginTop: 5 }}>
            <Text style={[styles.infoText, { width: 110 }]}>Téma práce:</Text>
            <Text style={styles.infoText}>{description?.topic || project.title}</Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={[styles.infoText, { width: 110 }]}>Vedoucí práce:</Text>
            <Text style={styles.infoText}>{options.supervisorName}</Text>
          </View>
        </View>

        {/* Main Heading */}
        <Text style={styles.mainHeading}>
          Způsob zpracování, cíle práce, pokyny k obsahu a rozsahu práce
        </Text>

        {/* Project Goal */}
        {description?.project_goal && (
          <View>
            <Text style={styles.subheading}>Cíl projektu:</Text>
            <Text style={styles.normalText}>{description.project_goal}</Text>
          </View>
        )}

        {/* Specification */}
        {description?.specification && (
          <View>
            <Text style={styles.subheading}>Specifikace projektu:</Text>
            {renderMarkdown(description.specification)}
          </View>
        )}

        {/* Schedule */}
        {description?.schedule && description.schedule.length > 0 && (
          <View>
            <Text style={styles.subheading}>Stručný časový harmonogram:</Text>
            {(description.schedule as ProjectScheduleEntry[]).map((item, index) => (
              <Text key={index} style={styles.scheduleItem}>
                <Text style={styles.bold}>{item.month}:</Text> {item.tasks}
              </Text>
            ))}
          </View>
        )}

        {/* Required Outputs */}
        {description?.needed_output && description.needed_output.length > 0 && (
          <View>
            <Text style={styles.subheading}>Požadované výstupy:</Text>
            {description.needed_output.map((output, index) => (
              <Text key={index} style={styles.bulletPoint}>• {output}</Text>
            ))}
          </View>
        )}

        {/* Grading */}
        {description?.grading_criteria && description.grading_criteria.length > 0 && (
          <View>
            <Text style={styles.subheading}>Hodnocení:</Text>
            <Text style={styles.normalText}>Projekt bude hodnocen na základě:</Text>
            {description.grading_criteria.map((criterion, index) => (
              <Text key={index} style={styles.bulletPoint}>• {criterion}</Text>
            ))}
            {description?.grading_notes && (
              <Text style={[styles.normalText, { marginTop: 5 }]}>
                {description.grading_notes}
              </Text>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

function renderMarkdown(markdown: string): React.ReactElement[] {
  // Use remark to parse markdown with GFM (GitHub Flavored Markdown) support
  const result = remark()
    .use(remarkGfm)
    .parse(markdown);

  const elements: React.ReactElement[] = [];
  let keyCounter = 0;

  const renderNode = (node: any, index: number): React.ReactElement | React.ReactElement[] | null => {
    const key = `node-${keyCounter++}`;

    switch (node.type) {
      case 'heading':
        const headingNode = node as Heading;
        const headingText = extractText(headingNode);
        const headingSizes = [14, 13, 12, 11, 11, 11];
        const fontSize = headingSizes[headingNode.depth - 1] || 11;
        return (
          <Text key={key} style={[styles.subheading, { fontSize, marginTop: 8, marginBottom: 4 }]}>
            {headingText}
          </Text>
        );

      case 'paragraph':
        const paragraphNode = node as Paragraph;
        return (
          <Text key={key} style={[styles.normalText, { marginBottom: 3 }]}>
            {renderInlineNodes(paragraphNode.children)}
          </Text>
        );

      case 'list':
        const listNode = node as List;
        return (
          <View key={key} style={{ marginBottom: 5 }}>
            {listNode.children.map((item, idx) => {
              const listItem = item as ListItem;
              const text = extractText(listItem);
              return (
                <Text key={`${key}-${idx}`} style={styles.bulletPoint}>
                  • {text}
                </Text>
              );
            })}
          </View>
        );

      case 'blockquote':
        const blockquoteText = extractText(node);
        return (
          <Text key={key} style={[styles.normalText, { marginLeft: 15, fontStyle: 'italic', marginBottom: 3 }]}>
            {blockquoteText}
          </Text>
        );

      case 'code':
        return (
          <Text key={key} style={{ fontFamily: 'Courier', backgroundColor: '#f5f5f5', padding: 5, marginBottom: 3 }}>
            {node.value}
          </Text>
        );

      case 'thematicBreak':
        return (
          <View key={key} style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 8 }} />
        );

      default:
        return null;
    }
  };

  const renderInlineNodes = (nodes: PhrasingContent[]): React.ReactNode => {
    return nodes.map((node, idx) => {
      const key = `inline-${keyCounter++}`;

      switch (node.type) {
        case 'text':
          return (node as MdText).value;

        case 'strong':
          const strongNode = node as Strong;
          return (
            <Text key={key} style={styles.bold}>
              {extractText(strongNode)}
            </Text>
          );

        case 'emphasis':
          const emphasisNode = node as Emphasis;
          return (
            <Text key={key} style={{ fontStyle: 'italic' }}>
              {extractText(emphasisNode)}
            </Text>
          );

        case 'delete':
          const deleteNode = node as Delete;
          return (
            <Text key={key} style={{ textDecoration: 'line-through' }}>
              {extractText(deleteNode)}
            </Text>
          );

        case 'inlineCode':
          const codeNode = node as InlineCode;
          return (
            <Text key={key} style={{ fontFamily: 'Courier', backgroundColor: '#f5f5f5', padding: 2 }}>
              {codeNode.value}
            </Text>
          );

        case 'link':
          const linkText = extractText(node);
          return (
            <Text key={key} style={{ textDecoration: 'underline', color: '#0066cc' }}>
              {linkText}
            </Text>
          );

        case 'break':
          return '\n';

        default:
          return null;
      }
    });
  };

  const extractText = (node: any): string => {
    if (node.type === 'text') {
      return node.value;
    }
    if (node.children) {
      return node.children.map((child: any) => extractText(child)).join('');
    }
    if (node.value) {
      return node.value;
    }
    return '';
  };

  result.children.forEach((node, idx) => {
    const rendered = renderNode(node, idx);
    if (rendered) {
      if (Array.isArray(rendered)) {
        elements.push(...rendered);
      } else {
        elements.push(rendered);
      }
    }
  });

  return elements;
}


export async function exportProjectToPDF(
  project: ProjectWithRelations,
  options: PDFExportOptions
): Promise<Buffer> {
  const doc = <PDFDocument project={project} options={options} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
