import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy } from '../types/pdf';
import { renderPageToCanvas } from '../services/pdfService';

interface PageViewerProps {
  pdfDoc: PDFDocumentProxy;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

type ZoomMode = 'fit-page' | 'fit-width' | 'custom';

/**
 * Full-page PDF viewer with zoom controls and page navigation
 */
export const PageViewer: React.FC<PageViewerProps> = ({
  pdfDoc,
  pageIndex,
  onPageChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-width');
  const [isRendering, setIsRendering] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pageCount = pdfDoc.numPages;

  // Calculate scale based on zoom mode
  const calculateScale = useCallback(() => {
    if (zoomMode === 'custom') {
      return zoomLevel / 100;
    }
    return 1.0; // For fit modes, we'll use CSS scaling
  }, [zoomLevel, zoomMode]);

  // Render current page
  useEffect(() => {
    if (!canvasContainerRef.current || !pdfDoc) return;

    let isMounted = true;

    const renderCurrentPage = async () => {
      try {
        setIsRendering(true);
        const scale = calculateScale();
        const canvas = await renderPageToCanvas(pdfDoc, pageIndex, scale);

        if (isMounted && canvasContainerRef.current) {
          canvasContainerRef.current.innerHTML = '';
          canvasContainerRef.current.appendChild(canvas);

          // Apply zoom mode styling
          if (zoomMode === 'fit-width') {
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
          } else if (zoomMode === 'fit-page') {
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '100%';
            canvas.style.objectFit = 'contain';
          }
        }
      } catch (err) {
        console.error('Error rendering page:', err);
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    renderCurrentPage();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageIndex, zoomLevel, zoomMode, calculateScale]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input focused
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
          if (pageIndex > 0) {
            e.preventDefault();
            onPageChange(pageIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (pageIndex < pageCount - 1) {
            e.preventDefault();
            onPageChange(pageIndex + 1);
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleZoomReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pageIndex, pageCount, onPageChange]);

  const handleZoomIn = () => {
    setZoomMode('custom');
    setZoomLevel((prev) => Math.min(prev + 10, 300));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoomMode('custom');
    setZoomLevel(100);
  };

  const handleFitPage = () => {
    setZoomMode('fit-page');
  };

  const handleFitWidth = () => {
    setZoomMode('fit-width');
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      onPageChange(pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) {
      onPageChange(pageIndex + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-halloween-surface rounded-lg border border-gray-800">
      {/* Controls Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-wrap gap-4">
        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={pageIndex === 0}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-halloween-purple"
            aria-label="Previous page"
            title="Previous page (←)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-sm text-gray-300 min-w-[100px] text-center">
            Page {pageIndex + 1} of {pageCount}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={pageIndex === pageCount - 1}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-halloween-purple"
            aria-label="Next page"
            title="Next page (→)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomMode !== 'custom' || zoomLevel <= 50}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-halloween-purple"
            aria-label="Zoom out"
            title="Zoom out (-)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>

          <span className="text-sm text-gray-300 min-w-[60px] text-center">
            {zoomMode === 'custom' ? `${zoomLevel}%` : zoomMode === 'fit-width' ? 'Fit Width' : 'Fit Page'}
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomMode !== 'custom' || zoomLevel >= 300}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-halloween-purple"
            aria-label="Zoom in"
            title="Zoom in (+)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>

          <div className="border-l border-gray-700 h-8 mx-2"></div>

          <button
            onClick={handleFitWidth}
            className={`px-3 py-1.5 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-halloween-purple ${
              zoomMode === 'fit-width' ? 'bg-halloween-purple text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            title="Fit to width"
          >
            Fit Width
          </button>

          <button
            onClick={handleFitPage}
            className={`px-3 py-1.5 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-halloween-purple ${
              zoomMode === 'fit-page' ? 'bg-halloween-purple text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            title="Fit to page"
          >
            Fit Page
          </button>

          <button
            onClick={handleZoomReset}
            className="px-3 py-1.5 text-xs rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-halloween-purple"
            title="Reset zoom (0)"
          >
            100%
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-900 p-4 relative"
      >
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-halloween-purple mb-4"></div>
              <p className="text-gray-400">Rendering page...</p>
            </div>
          </div>
        )}
        <div
          ref={canvasContainerRef}
          className="flex items-center justify-center min-h-full"
        />
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-500 text-center">
        ← → Navigate pages • + - Zoom • 0 Reset zoom
      </div>
    </div>
  );
};
