import JSZip from 'jszip';
import type { ProcessedSection } from '../types/split';
import { PDFError } from '../types/pdf';
import { sanitizeFilename } from './splitService';

/**
 * Generate Markdown notes file from processed sections
 * @param sections - Processed sections with summaries and keywords
 * @returns Markdown string
 */
export const generateMarkdown = (sections: ProcessedSection[]): string => {
  const lines: string[] = [
    '# PDF Section Notes',
    '',
    `Generated on ${new Date().toLocaleString()}`,
    '',
    '---',
    '',
  ];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    // If title is just "Section N" or empty, render as "Section N (pages X-Y)"
    let heading = '';
    let showPagesLine = true;
    
    if (section.title === `Section ${i + 1}` || section.title.trim() === '') {
      heading = `Section ${i + 1} (pages ${section.startPage + 1}-${section.endPage + 1})`;
      showPagesLine = false; // Pages already in heading
    } else {
      heading = `Section ${i + 1}: ${section.title}`;
      showPagesLine = true; // Show pages line separately
    }

    lines.push(`## ${heading}`);
    
    // Only show Pages line if not already in heading
    if (showPagesLine) {
      lines.push(`**Pages**: ${section.startPage + 1}-${section.endPage + 1}`);
    }
    
    lines.push('');

    if (section.summary) {
      lines.push('### Summary');
      lines.push(section.summary);
      lines.push('');
    }

    if (section.keywords && section.keywords.length > 0) {
      lines.push('### Keywords');
      lines.push(section.keywords.join(', '));
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
};

/**
 * Create ZIP archive with PDF files and Markdown notes
 * @param sectionPDFs - Array of {name, data} for PDF files
 * @param markdown - Markdown notes content
 * @returns Promise resolving to ZIP blob
 */
export const createZip = async (
  sectionPDFs: Array<{ name: string; data: Uint8Array }>,
  markdown: string
): Promise<Blob> => {
  try {
    const zip = new JSZip();

    // Add PDF files
    for (const pdf of sectionPDFs) {
      zip.file(pdf.name, pdf.data);
    }

    // Add Markdown notes
    zip.file('NOTES.md', markdown);

    // Generate ZIP blob
    return await zip.generateAsync({ type: 'blob' });
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw new PDFError(
      'Failed to create export ZIP file.',
      'ZIP_CREATION_ERROR',
      error
    );
  }
};

/**
 * Trigger browser download of blob
 * @param blob - Blob to download
 * @param filename - Name for downloaded file
 */
export const downloadZip = (blob: Blob, filename: string): void => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading ZIP:', error);
    throw new PDFError(
      'Failed to download export file.',
      'DOWNLOAD_ERROR',
      error
    );
  }
};

/**
 * Generate PDF filename for section
 * @param sectionNumber - Section index (1-based)
 * @param title - Section title
 * @param startPage - Start page number (1-based)
 * @param endPage - End page number (1-based)
 * @returns Sanitized filename
 */
export const generatePDFFilename = (
  sectionNumber: number,
  title: string,
  startPage: number,
  endPage: number
): string => {
  const sanitized = sanitizeFilename(title.trim());
  if (sanitized && sanitized.length > 0) {
    return `section-${sectionNumber}-${sanitized}.pdf`;
  }
  return `section-${sectionNumber}-pages-${startPage}-${endPage}.pdf`;
};
