import React, { useEffect, useRef, useState, memo } from 'react';
import type { PDFDocumentProxy } from '../types/pdf';
import { renderPageToCanvas } from '../services/pdfService';

interface ThumbnailItemProps {
  pdfDoc: PDFDocumentProxy;
  pageIndex: number;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Individual thumbnail item component with lazy loading support
 * Memoized to prevent unnecessary re-renders
 */
export const ThumbnailItem: React.FC<ThumbnailItemProps> = memo(({
  pdfDoc,
  pageIndex,
  isSelected,
  onClick,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    if (!canvasRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Stop observing once visible
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(canvasRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Render thumbnail when visible
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    let isMounted = true;

    const renderThumbnail = async () => {
      try {
        setIsLoading(true);
        // Render at smaller scale for thumbnails (0.3 = 30% of original size)
        const canvas = await renderPageToCanvas(pdfDoc, pageIndex, 0.3);
        
        if (isMounted && canvasRef.current) {
          canvasRef.current.innerHTML = '';
          canvasRef.current.appendChild(canvas);
          canvas.className = 'w-full h-auto rounded';
        }
      } catch (err) {
        console.error(`Error rendering thumbnail for page ${pageIndex + 1}:`, err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    renderThumbnail();

    return () => {
      isMounted = false;
    };
  }, [isVisible, pdfDoc, pageIndex]);

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-center p-3 rounded-lg transition-all
        ${isSelected
          ? 'bg-halloween-purple/20 ring-2 ring-halloween-purple shadow-lg'
          : 'bg-halloween-surface hover:bg-gray-800 border border-gray-700 hover:border-halloween-orange'
        }
        focus:outline-none focus:ring-2 focus:ring-halloween-purple focus:ring-offset-2 focus:ring-offset-halloween-background
      `}
      aria-label={`Page ${pageIndex + 1}`}
      aria-pressed={isSelected}
    >
      {/* Thumbnail container */}
      <div className="relative w-full aspect-[1/1.4] bg-gray-900 rounded overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-halloween-purple"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}
        <div ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Page number */}
      <div className={`
        mt-2 text-sm font-medium
        ${isSelected ? 'text-halloween-purple' : 'text-gray-400 group-hover:text-gray-300'}
      `}>
        {pageIndex + 1}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 bg-halloween-purple rounded-full p-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
});

ThumbnailItem.displayName = 'ThumbnailItem';
