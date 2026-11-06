import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * File information metadata extracted from uploaded PDF
 */
export interface FileInfo {
  name: string;
  size: number; // in bytes
  pageCount: number;
  modifiedDate: Date;
}

/**
 * Options for rendering PDF pages to canvas
 */
export interface PDFRenderOptions {
  pageIndex: number;
  scale?: number;
  rotation?: number;
}

/**
 * Custom error type for PDF processing errors
 */
export class PDFError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PDFError';
  }
}

// Re-export PDFDocumentProxy type for convenience
export type { PDFDocumentProxy };
