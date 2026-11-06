import React, { useEffect, useCallback } from 'react';
import type { PDFDocumentProxy } from '../types/pdf';
import { ThumbnailItem } from './ThumbnailItem';

interface ThumbnailGridProps {
  pdfDoc: PDFDocumentProxy;
  selectedPageIndex: number;
  onPageSelect: (index: number) => void;
  isLoading?: boolean;
}

/**
 * Grid of PDF page thumbnails with keyboard navigation and lazy loading
 */
export const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  pdfDoc,
  selectedPageIndex,
  onPageSelect,
  isLoading = false,
}) => {
  const pageCount = pdfDoc.numPages;

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle keyboard if no input is focused
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (selectedPageIndex > 0) {
            onPageSelect(selectedPageIndex - 1);
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if (selectedPageIndex < pageCount - 1) {
            onPageSelect(selectedPageIndex + 1);
          }
          break;
        case 'Home':
          e.preventDefault();
          onPageSelect(0);
          break;
        case 'End':
          e.preventDefault();
          onPageSelect(pageCount - 1);
          break;
      }
    },
    [selectedPageIndex, pageCount, onPageSelect]
  );

  // Set up keyboard navigation
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-halloween-purple mb-4"></div>
          <p className="text-gray-400">Loading thumbnails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-halloween-orange flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
            />
          </svg>
          Pages
        </h2>
        <span className="text-sm text-gray-500">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </span>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto p-2 bg-gray-900/30 rounded-lg"
        role="list"
        aria-label="PDF page thumbnails"
      >
        {Array.from({ length: pageCount }, (_, index) => (
          <ThumbnailItem
            key={index}
            pdfDoc={pdfDoc}
            pageIndex={index}
            isSelected={selectedPageIndex === index}
            onClick={() => onPageSelect(index)}
          />
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Use arrow keys, Home, or End to navigate pages
      </div>
    </div>
  );
};
