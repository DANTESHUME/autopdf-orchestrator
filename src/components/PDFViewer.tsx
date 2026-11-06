import React, { useState } from 'react';
import type { PDFDocumentProxy } from '../types/pdf';
import { ThumbnailGrid } from './ThumbnailGrid';
import { PageViewer } from './PageViewer';

interface PDFViewerProps {
  pdfDoc: PDFDocumentProxy;
}

/**
 * Container component combining thumbnail grid and page viewer
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfDoc }) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Thumbnail Grid - Side Panel on Desktop, Top on Mobile */}
      <div className="lg:col-span-3 order-2 lg:order-1">
        <ThumbnailGrid
          pdfDoc={pdfDoc}
          selectedPageIndex={selectedPageIndex}
          onPageSelect={setSelectedPageIndex}
        />
      </div>

      {/* Page Viewer - Main Content */}
      <div className="lg:col-span-9 order-1 lg:order-2">
        <div className="h-[600px] lg:h-[800px]">
          <PageViewer
            pdfDoc={pdfDoc}
            pageIndex={selectedPageIndex}
            onPageChange={setSelectedPageIndex}
          />
        </div>
      </div>
    </div>
  );
};
