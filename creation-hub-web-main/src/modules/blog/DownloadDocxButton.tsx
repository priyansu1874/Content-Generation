import React from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

interface DownloadDocxButtonProps {
  docContent: string;
}

const DownloadDocxButton: React.FC<DownloadDocxButtonProps> = ({ docContent }) => {
  const handleDownload = async () => {
    const paragraphs = [];
    const lines = docContent.split(/\r?\n/).filter(line => line.trim() !== "");

    lines.forEach(line => {
      if (line.startsWith('META_INFO:')) {
        // Meta Information section
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Meta Information',
                bold: true,
                size: 28
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );

        const metaInfo = line.replace('META_INFO:', '').trim().split('|');
        metaInfo.forEach(info => {
          const [label, value] = info.split(':').map(s => s.trim());
          if (label && value) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${label}: `,
                    bold: true,
                    size: 24
                  }),
                  new TextRun({
                    text: value,
                    size: 24
                  })
                ],
                spacing: { before: 100, after: 100 }
              })
            );
          }
        });
      } else if (line.startsWith('# ')) {
        // Main title
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace('# ', ''),
                bold: true,
                size: 36
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
            alignment: AlignmentType.CENTER
          })
        );
      } else if (line.startsWith('### ')) {
        // Subsection titles
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace('### ', ''),
                bold: true,
                size: 26
              })
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 }
          })
        );
      } else if (line.startsWith('## ')) {
        // Section titles
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace('## ', ''),
                bold: true,
                size: 28
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );
      } else if (line.startsWith('*') && line.endsWith('*')) {
        // Italic description
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/^\*|\*$/g, ''),
                italics: true,
                size: 24,
                color: '666666'
              })
            ],
            spacing: { before: 100, after: 200 }
          })
        );
      } else if (line.startsWith('> ')) {
        // CTA box
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace('> ', ''),
                bold: true,
                size: 24,
                color: '2563eb'
              })
            ],
            spacing: { before: 200, after: 200 },
            indent: { left: 400 }
          })
        );
      } else if (line.startsWith('Tags: ')) {
        // Tags
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 20,
                color: '4B5563'
              })
            ],
            spacing: { before: 200 }
          })
        );
      } else if (line === '---') {
        // Horizontal rule
        paragraphs.push(
          new Paragraph({
            text: '________________________________________',
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 }
          })
        );
      } else {
        // Normal paragraphs
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 24
              })
            ],
            spacing: { before: 100, after: 100 }
          })
        );
      }
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "GeneratedDoc.docx");
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
        Download .docx
      </button>
    );
  };
  
  export default DownloadDocxButton;