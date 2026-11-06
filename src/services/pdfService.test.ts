import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validatePDF,
  formatFileSize,
  formatErrorMessage,
} from './pdfService';
import { PDFError } from '../types/pdf';

describe('pdfService', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle large numbers', () => {
      const result = formatFileSize(5368709120);
      expect(result).toBe('5 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1234567)).toBe('1.18 MB');
    });
  });

  describe('PDFError', () => {
    it('should create error with message', () => {
      const error = new PDFError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('PDFError');
      expect(error.code).toBeUndefined();
    });

    it('should create error with code', () => {
      const error = new PDFError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should create error with original error', () => {
      const originalError = new Error('Original');
      const error = new PDFError('Test error', 'TEST_CODE', originalError);
      expect(error.originalError).toBe(originalError);
    });

    it('should be instance of Error', () => {
      const error = new PDFError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PDFError);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format PDFError correctly', () => {
      const error = new PDFError('Custom PDF error');
      expect(formatErrorMessage(error)).toBe('Custom PDF error');
    });

    it('should format standard Error correctly', () => {
      const error = new Error('Standard error');
      expect(formatErrorMessage(error)).toBe('An error occurred: Standard error');
    });

    it('should handle password errors', () => {
      const error = new Error('This PDF is password protected');
      expect(formatErrorMessage(error)).toBe('Password-protected PDFs are not supported yet.');
    });

    it('should handle invalid PDF structure errors', () => {
      const error = new Error('Invalid PDF structure detected');
      expect(formatErrorMessage(error)).toBe('This PDF appears to be corrupted or invalid.');
    });

    it('should handle unknown errors', () => {
      const result = formatErrorMessage('Some string error');
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle null/undefined', () => {
      expect(formatErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
      expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('validatePDF', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      vi.clearAllMocks();
    });

    it('should reject non-PDF file based on type', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      await expect(validatePDF(file)).rejects.toThrow('Please select a PDF file (.pdf only).');
    });

    it('should reject non-PDF file based on extension', async () => {
      const file = new File(['content'], 'test.doc', { type: 'application/msword' });
      
      await expect(validatePDF(file)).rejects.toThrow('Please select a PDF file (.pdf only).');
    });

    it('should accept PDF file with correct type and extension', async () => {
      // Create a minimal valid PDF structure
      const pdfHeader = '%PDF-1.4\n';
      const file = new File([pdfHeader], 'test.pdf', { type: 'application/pdf' });
      
      // This will fail at parsing stage, but that's expected for this minimal PDF
      // We're testing that it passes the type/extension check
      try {
        await validatePDF(file);
      } catch (error) {
        // Should throw parsing error, not type error
        expect(error).toBeInstanceOf(PDFError);
        expect((error as PDFError).code).toBe('INVALID_PDF');
      }
    });

    it('should handle file without pdf extension case-insensitively', async () => {
      const file = new File(['content'], 'test.PDF', { type: 'application/pdf' });
      
      // Should pass extension check (case-insensitive)
      try {
        await validatePDF(file);
      } catch (error) {
        // Should fail at parsing, not at extension check
        expect((error as PDFError).code).not.toBe('INVALID_FILE_TYPE');
      }
    });
  });

  describe('FileInfo type validation', () => {
    it('should have correct structure', () => {
      // Type assertion test - this will fail at compile time if types are wrong
      const fileInfo: import('../types/pdf').FileInfo = {
        name: 'test.pdf',
        size: 1024,
        pageCount: 5,
        modifiedDate: new Date(),
      };

      expect(fileInfo.name).toBe('test.pdf');
      expect(fileInfo.size).toBe(1024);
      expect(fileInfo.pageCount).toBe(5);
      expect(fileInfo.modifiedDate).toBeInstanceOf(Date);
    });
  });

  describe('Edge cases', () => {
    it('formatFileSize should handle negative numbers gracefully', () => {
      // While not expected in normal use, should not crash
      const result = formatFileSize(-100);
      expect(typeof result).toBe('string');
    });

    it('formatErrorMessage should handle objects', () => {
      const result = formatErrorMessage({ message: 'Error object' });
      expect(result).toBe('An unexpected error occurred. Please try again.');
    });

    it('formatFileSize should handle very large numbers', () => {
      const result = formatFileSize(Number.MAX_SAFE_INTEGER);
      expect(typeof result).toBe('string');
      // Should not crash, result may vary
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
