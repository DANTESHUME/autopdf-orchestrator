import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import type { OutlineNode, Section } from '../types/split';
import { PDFError } from '../types/pdf';

/**
 * Get PDF outline (bookmarks) structure
 * @param pdfDoc - PDF document proxy from pdf.js
 * @returns Array of outline nodes or null if no outline exists
 */
export const getOutline = async (
  pdfDoc: PDFDocumentProxy
): Promise<OutlineNode[] | null> => {
  try {
    const outline = await pdfDoc.getOutline();
    if (!outline || outline.length === 0) {
      return null;
    }
    return outline as OutlineNode[];
  } catch (error) {
    console.error('Error getting outline:', error);
    return null;
  }
};

/**
 * Convert PDF outline to section definitions
 * Uses only top-level bookmarks as section boundaries
 * Resolves named destinations and extracts page indices
 * @param outline - Array of outline nodes
 * @param pdfDoc - PDF document proxy from pdf.js (for resolving destinations)
 * @param totalPages - Total number of pages in PDF
 * @returns Promise resolving to array of sections with page boundaries
 */
export const createSectionsFromOutline = async (
  outline: OutlineNode[],
  pdfDoc: PDFDocumentProxy,
  totalPages: number
): Promise<Section[]> => {
  const sections: Section[] = [];

  for (let i = 0; i < outline.length; i++) {
    const currentNode = outline[i];
    const nextNode = outline[i + 1];

    let startPage = 0;
    let endPage = totalPages - 1;

    // Resolve destination and extract page index
    if (currentNode.dest) {
      startPage = await resolveDestinationPage(currentNode.dest, pdfDoc);
    }

    // Set end page based on next bookmark
    if (nextNode && nextNode.dest) {
      const nextPage = await resolveDestinationPage(nextNode.dest, pdfDoc);
      endPage = Math.max(startPage, nextPage - 1);
    } else {
      endPage = totalPages - 1;
    }

    // Ensure valid range
    startPage = Math.max(0, Math.min(startPage, totalPages - 1));
    endPage = Math.max(startPage, Math.min(endPage, totalPages - 1));

    sections.push({
      id: `section-${sections.length + 1}`,
      title: currentNode.title || `Section ${sections.length + 1}`,
      startPage,
      endPage,
    });
  }

  return sections;
};

/**
 * Resolve a PDF destination to a 0-based page index
 * @param dest - Destination (can be string (named) or array with page ref)
 * @param pdfDoc - PDF document proxy
 * @returns 0-based page index
 */
const resolveDestinationPage = async (
  dest: any,
  pdfDoc: PDFDocumentProxy
): Promise<number> => {
  try {
    // If dest is a string, it's a named destination
    if (typeof dest === 'string') {
      const resolvedDest = await pdfDoc.getDestination(dest);
      if (resolvedDest && Array.isArray(resolvedDest)) {
        return extractPageIndexFromRef(resolvedDest[0], pdfDoc);
      }
      return 0;
    }

    // If dest is an array, first item should be a page reference
    if (Array.isArray(dest)) {
      return extractPageIndexFromRef(dest[0], pdfDoc);
    }

    return 0;
  } catch (error) {
    console.error('Error resolving destination:', error);
    return 0;
  }
};

/**
 * Extract page index from a page reference object
 * @param pageRef - Page reference object (from pdf.js)
 * @param pdfDoc - PDF document proxy
 * @returns 0-based page index
 */
const extractPageIndexFromRef = async (
  pageRef: any,
  pdfDoc: PDFDocumentProxy
): Promise<number> => {
  try {
    // If it's already a number, return it
    if (typeof pageRef === 'number') {
      return pageRef;
    }

    // If it's an object reference, get the page index
    if (pageRef && typeof pageRef === 'object') {
      const pageIndex = await pdfDoc.getPageIndex(pageRef);
      return pageIndex;
    }

    return 0;
  } catch (error) {
    console.error('Error extracting page index:', error);
    return 0;
  }
};

/**
 * Scan first N pages for table-of-contents lines (ending in page numbers)
 * Lines like "Chapter 1    12" or "Introduction   5"
 * @param pdfDoc - PDF document proxy from pdf.js
 * @param scanPages - Number of pages to scan (default: 5)
 * @returns Array of sections if TOC found, null otherwise
 */
export const scanTableOfContents = async (
  pdfDoc: PDFDocumentProxy,
  scanPages: number = 5
): Promise<Section[] | null> => {
  try {
    const { extractText } = await import('./textService');
    const totalPages = pdfDoc.numPages;
    const pagesToScan = Math.min(scanPages, totalPages - 1);

    // Extract text from first pages
    const tocText = await extractText(pdfDoc, 0, pagesToScan);

    // Lines that look like TOC: text followed by spaces and page numbers
    const tocLines = tocText
      .split('\n')
      .filter((line) => /\s{2,}\d+\s*$/.test(line.trim())); // 2+ spaces then digits at end

    if (tocLines.length === 0) {
      return null;
    }

    // Parse TOC lines into sections
    const sections: Section[] = [];
    for (let i = 0; i < tocLines.length; i++) {
      const line = tocLines[i].trim();
      const match = line.match(/^(.+?)\s{2,}(\d+)\s*$/);

      if (match) {
        const title = match[1].trim();
        const pageNum = parseInt(match[2], 10);

        if (title && pageNum > 0) {
          let startPage = pageNum - 1; // Convert to 0-based
          let endPage = totalPages - 1;

          // If there's a next TOC entry, end page is before next starts
          if (i < tocLines.length - 1) {
            const nextMatch = tocLines[i + 1].match(/\s{2,}(\d+)\s*$/);
            if (nextMatch) {
              const nextPage = parseInt(nextMatch[1], 10);
              if (nextPage > pageNum) {
                endPage = nextPage - 2; // -1 for 0-based, -1 for before next
              }
            }
          }

          startPage = Math.max(0, Math.min(startPage, totalPages - 1));
          endPage = Math.max(startPage, Math.min(endPage, totalPages - 1));

          sections.push({
            id: `section-${sections.length + 1}`,
            title,
            startPage,
            endPage,
          });
        }
      }
    }

    return sections.length > 0 ? sections : null;
  } catch (error) {
    console.error('Error scanning table of contents:', error);
    return null;
  }
};

/**
 * Auto-detect sections: try outline → TOC → fallback to manual ranges
 * @param pdfDoc - PDF document proxy from pdf.js
 * @param totalPages - Total number of pages
 * @returns Sections from outline, TOC, or null if none found
 */
export const autoDetectSections = async (
  pdfDoc: PDFDocumentProxy,
  totalPages: number
): Promise<Section[] | null> => {
  // Try outline first
  const outline = await getOutline(pdfDoc);
  if (outline && outline.length > 0) {
    return await createSectionsFromOutline(outline, pdfDoc, totalPages);
  }

  // Try TOC scanning
  const tocSections = await scanTableOfContents(pdfDoc, 5);
  if (tocSections && tocSections.length > 0) {
    return tocSections;
  }

  // No sections found
  return null;
};
export const parsePageRanges = (input: string, totalPages: number): Section[] => {
  const sections: Section[] = [];

  try {
    const ranges = input.split(',').map((r) => r.trim());

    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const [startStr, endStr] = range.split('-').map((s) => s.trim());

      if (!startStr || !endStr) {
        throw new PDFError(
          `Invalid range format: "${range}". Use format like "1-5" or "6-10".`,
          'INVALID_RANGE_FORMAT'
        );
      }

      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        throw new PDFError(
          `Invalid page numbers in range: "${range}". Must be integers.`,
          'INVALID_PAGE_NUMBER'
        );
      }

      if (start < 1 || end < 1) {
        throw new PDFError(
          `Page numbers must be >= 1. Found: "${range}".`,
          'PAGE_OUT_OF_BOUNDS'
        );
      }

      if (start > totalPages || end > totalPages) {
        throw new PDFError(
          `Page range "${range}" exceeds document (${totalPages} pages).`,
          'PAGE_OUT_OF_BOUNDS'
        );
      }

      if (start > end) {
        throw new PDFError(
          `Invalid range: start (${start}) must be <= end (${end}) in "${range}".`,
          'INVALID_RANGE_ORDER'
        );
      }

      sections.push({
        id: `section-${i + 1}`,
        title: `Section ${i + 1}`,
        startPage: start - 1, // Convert to 0-based indexing
        endPage: end - 1,
      });
    }

    // Check for overlapping ranges
    validatePageRanges(sections);

    return sections;
  } catch (err) {
    if (err instanceof PDFError) {
      throw err;
    }
    throw new PDFError(
      'Failed to parse page ranges. Check format: "1-5, 6-10, 11-15"',
      'PARSE_ERROR',
      err
    );
  }
};

/**
 * Validate page ranges for overlaps and ordering
 * @param sections - Array of sections to validate
 * @throws PDFError if ranges overlap or invalid
 */
export const validatePageRanges = (sections: Section[]): void => {
  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];

    for (let j = i + 1; j < sections.length; j++) {
      const other = sections[j];

      // Check for overlap
      if (
        (current.startPage <= other.startPage && other.startPage <= current.endPage) ||
        (other.startPage <= current.startPage && current.startPage <= other.endPage)
      ) {
        throw new PDFError(
          `Page ranges overlap: Section ${i + 1} (${current.startPage + 1}-${current.endPage + 1}) and Section ${j + 1} (${other.startPage + 1}-${other.endPage + 1}).`,
          'OVERLAPPING_RANGES'
        );
      }
    }
  }
};

/**
 * Extract a range of pages from PDF as a new PDF document (Uint8Array)
 * @param pdfDoc - Original PDF document (loaded with pdf-lib)
 * @param startPage - Start page index (0-based)
 * @param endPage - End page index (0-based, inclusive)
 * @returns Uint8Array containing the new PDF
 */
export const extractSectionPDF = async (
  pdfDoc: PDFDocument,
  startPage: number,
  endPage: number
): Promise<Uint8Array> => {
  try {
    // Create new PDF document
    const newPdf = await PDFDocument.create();

    // Copy pages from source to new document
    const pageCount = pdfDoc.getPageCount();
    const indicesToCopy = [];

    for (let i = startPage; i <= endPage && i < pageCount; i++) {
      indicesToCopy.push(i);
    }

    const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);

    copiedPages.forEach((page) => {
      newPdf.addPage(page);
    });

    // Serialize to bytes
    return await newPdf.save();
  } catch (error) {
    console.error('Error extracting section PDF:', error);
    throw new PDFError(
      `Failed to extract PDF pages ${startPage + 1}-${endPage + 1}.`,
      'PDF_EXTRACTION_ERROR',
      error
    );
  }
};

/**
 * Sanitize filename by removing/replacing special characters
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9]/gi, '-') // Replace non-alphanumeric with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .slice(0, 100); // Limit length
};
