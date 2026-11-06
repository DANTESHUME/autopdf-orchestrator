import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { FileInfo, PDFError } from '../types/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker to use local bundled version
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Validates that a file is a valid PDF
 * @param file - File to validate
 * @throws {PDFError} If file is not a valid PDF
 */
export const validatePDF = async (file: File): Promise<void> => {
  // Check MIME type
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new PDFError(
      'Please select a PDF file (.pdf only).',
      'INVALID_FILE_TYPE'
    );
  }

  // Try to parse with pdf.js
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    await loadingTask.promise;
  } catch (error) {
    console.error('PDF validation error:', error);
    throw new PDFError(
      'This PDF could not be read. It may be corrupted or use unsupported features.',
      'INVALID_PDF',
      error
    );
  }
};

/**
 * Loads a PDF file and returns the document proxy
 * @param file - PDF file to load
 * @returns Promise resolving to PDFDocumentProxy
 * @throws {PDFError} If file cannot be loaded
 */
export const loadPDF = async (file: File): Promise<PDFDocumentProxy> => {
  await validatePDF(file);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    return await loadingTask.promise;
  } catch (error) {
    console.error('PDF loading error:', error);
    throw new PDFError(
      'Failed to load PDF. Please try again.',
      'LOAD_ERROR',
      error
    );
  }
};

/**
 * Renders a PDF page to a canvas element
 * @param pdfDoc - PDF document proxy
 * @param pageIndex - Zero-based page index
 * @param scale - Scale factor for rendering (default: 1.0)
 * @returns Promise resolving to rendered canvas element
 */
export const renderPageToCanvas = async (
  pdfDoc: PDFDocumentProxy,
  pageIndex: number,
  scale: number = 1.0
): Promise<HTMLCanvasElement> => {
  try {
    // PDF.js uses 1-based page numbers
    const page = await pdfDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new PDFError('Failed to get canvas context', 'CANVAS_ERROR');
    }

    // Use devicePixelRatio for crisp rendering on high-DPI screens
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

    await page.render({
      canvasContext: context,
      viewport,
      transform,
      canvas,
    }).promise;

    return canvas;
  } catch (error) {
    console.error('Page rendering error:', error);
    throw new PDFError(
      `Failed to render page ${pageIndex + 1}.`,
      'RENDER_ERROR',
      error
    );
  }
};

/**
 * Extracts file information and metadata
 * @param file - Original file object
 * @param pdfDoc - Loaded PDF document proxy
 * @returns FileInfo object with metadata
 */
export const getFileInfo = async (
  file: File,
  pdfDoc: PDFDocumentProxy
): Promise<FileInfo> => {
  return {
    name: file.name,
    size: file.size,
    pageCount: pdfDoc.numPages,
    modifiedDate: new Date(file.lastModified),
  };
};

/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.3 MB", "450 KB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formats error messages to be user-friendly
 * @param error - Error object to format
 * @returns User-friendly error message
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof PDFError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common error patterns to user-friendly messages
    if (error.message.includes('password')) {
      return 'Password-protected PDFs are not supported yet.';
    }
    if (error.message.includes('Invalid PDF structure')) {
      return 'This PDF appears to be corrupted or invalid.';
    }
    return `An error occurred: ${error.message}`;
  }

  return 'An unexpected error occurred. Please try again.';
};
