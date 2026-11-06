/**
 * Outline/bookmark node structure from PDF
 */
export interface OutlineNode {
  title: string;
  dest: any;
  items: OutlineNode[];
}

/**
 * Represents a logical section of a PDF
 */
export interface Section {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
}

/**
 * Section after processing: with extracted content and metadata
 */
export interface ProcessedSection extends Section {
  text: string;
  summary: string;
  keywords: string[];
  pdfData?: Uint8Array;
}

/**
 * Result of ZIP export operation
 */
export interface ExportResult {
  zipBlob: Blob;
  sectionCount: number;
}
