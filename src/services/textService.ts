import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFError } from '../types/pdf';

/**
 * Extract text from a range of pages in a PDF
 * @param pdfDoc - PDF document proxy from pdf.js
 * @param startPage - Start page index (0-based)
 * @param endPage - End page index (0-based, inclusive)
 * @returns Concatenated text from all pages in range
 */
export const extractText = async (
  pdfDoc: PDFDocumentProxy,
  startPage: number,
  endPage: number
): Promise<string> => {
  const textParts: string[] = [];

  try {
    for (let i = startPage; i <= endPage && i < pdfDoc.numPages; i++) {
      const pageText = await extractPageText(pdfDoc, i);
      if (pageText) {
        textParts.push(pageText);
      }
    }

    if (textParts.length === 0) {
      return '[No text content]';
    }

    return textParts.join('\n\n');
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new PDFError(
      `Failed to extract text from pages ${startPage + 1}-${endPage + 1}.`,
      'TEXT_EXTRACTION_ERROR',
      error
    );
  }
};

/**
 * Extract text from a single page
 * @param pdfDoc - PDF document proxy from pdf.js
 * @param pageIndex - Page index (0-based)
 * @returns Text content from page, or empty string if no text found
 */
export const extractPageText = async (
  pdfDoc: PDFDocumentProxy,
  pageIndex: number
): Promise<string> => {
  try {
    const page = await pdfDoc.getPage(pageIndex + 1);
    const textContent = await page.getTextContent();

    if (!textContent.items || textContent.items.length === 0) {
      return '';
    }

    const parts: string[] = [];
    const items = textContent.items as any[];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (typeof item.str === 'string') {
        parts.push(item.str);

        // Add space or newline if EOL marker or gap to next item
        if (item.hasEOL) {
          parts.push('\n');
        } else if (i < items.length - 1) {
          const nextItem = items[i + 1];
          // Check for horizontal gap between items (x position increased significantly)
          if (item.width && nextItem.x !== undefined && item.x !== undefined) {
            const expectedNextX = (item.x || 0) + (item.width || 0);
            const gap = nextItem.x - expectedNextX;
            if (gap > 5) { // Significant gap threshold
              parts.push(' ');
            }
          } else {
            parts.push(' ');
          }
        }
      }
    }

    return parts.join('').trim();
  } catch (error) {
    console.error(`Error extracting text from page ${pageIndex + 1}:`, error);
    return '';
  }
};
