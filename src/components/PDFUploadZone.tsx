import React, { useState, useRef } from 'react';
import { validatePDF, formatErrorMessage } from '../services/pdfService';

interface PDFUploadZoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

/**
 * Drag-and-drop upload zone for PDF files with file picker alternative
 */
export const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({
  onFileSelected,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    await processFile(file);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      await validatePDF(file);
      onFileSelected(file);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      console.error('File validation error:', err);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging
            ? 'border-halloween-purple bg-purple-900/20 scale-[1.02]'
            : 'border-gray-700 hover:border-gray-600'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isLoading ? handleClick : undefined}
        onKeyDown={!isLoading ? handleKeyDown : undefined}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF file"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
          aria-label="File input"
        />

        {/* Upload icon */}
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Instructions */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-halloween-purple"></div>
            <p className="text-gray-400">Validating PDF...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg text-gray-300">
              <span className="font-semibold text-halloween-purple">Drop your PDF here</span>
              {' '}or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports standard PDF files up to 100MB
            </p>
          </div>
        )}

        {/* Choose File Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="mt-6 px-6 py-3 bg-halloween-purple hover:bg-purple-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-halloween-purple focus:ring-offset-2 focus:ring-offset-halloween-background"
            aria-label="Choose file from computer"
          >
            Choose File
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
