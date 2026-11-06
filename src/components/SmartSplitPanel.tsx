import React, { useState, useEffect } from 'react';
import type { PDFDocumentProxy } from '../types/pdf';
import type { Section, ProcessedSection } from '../types/split';
import { getOutline, createSectionsFromOutline, parsePageRanges, extractSectionPDF, sanitizeFilename } from '../services/splitService';
import { extractText } from '../services/textService';
import { generateSummary } from '../services/summaryService';
import { extractKeywords } from '../services/keywordService';
import { generateMarkdown, createZip, downloadZip, generatePDFFilename } from '../services/exportService';
import { PDFDocument } from 'pdf-lib';
import { formatErrorMessage } from '../services/pdfService';

interface SmartSplitPanelProps {
  pdfDoc: PDFDocumentProxy;
  fileName: string;
}

export const SmartSplitPanel: React.FC<SmartSplitPanelProps> = ({ pdfDoc, fileName }) => {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [hasBookmarks, setHasBookmarks] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [processedSections, setProcessedSections] = useState<ProcessedSection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Check for bookmarks on mount
  useEffect(() => {
    const checkBookmarks = async () => {
      const outline = await getOutline(pdfDoc);
      if (outline && outline.length > 0) {
        setHasBookmarks(true);
        const sections = await createSectionsFromOutline(outline, pdfDoc, pdfDoc.numPages);
        setSections(sections);
        setMode('auto');
      } else {
        setMode('manual');
      }
    };

    checkBookmarks();
  }, [pdfDoc]);

  const handleModeChange = (newMode: 'auto' | 'manual') => {
    setMode(newMode);
    setError(null);
  };

  const handleParseRanges = () => {
    setError(null);
    try {
      const parsed = parsePageRanges(manualInput, pdfDoc.numPages);
      setSections(parsed);
      setProcessedSections([]);
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  };

  const handleProcess = async () => {
    if (sections.length === 0) {
      setError('No sections defined. Please detect bookmarks or enter page ranges.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const processed: ProcessedSection[] = [];

    try {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        setCurrentSection(`${section.title} (${i + 1}/${sections.length})`);
        setProgress(Math.round((i / sections.length) * 100));

        // Extract text
        const text = await extractText(pdfDoc, section.startPage, section.endPage);

        // Generate summary
        const summary = generateSummary(text, 5);

        // Extract keywords
        const keywords = extractKeywords(text, 8);

        processed.push({
          ...section,
          text,
          summary,
          keywords,
        });
      }

      setProcessedSections(processed);
      setProgress(100);
      setCurrentSection('');
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (processedSections.length === 0) {
      setError('No processed sections. Please run processing first.');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Load original PDF with pdf-lib
      const arrayBuffer = await (pdfDoc as any).getData();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);

      // Extract section PDFs
      const sectionPDFs: Array<{ name: string; data: Uint8Array }> = [];

      for (let i = 0; i < processedSections.length; i++) {
        const section = processedSections[i];
        const pdfData = await extractSectionPDF(pdfLibDoc, section.startPage, section.endPage);
        const filename = generatePDFFilename(i + 1, section.title, section.startPage + 1, section.endPage + 1);

        sectionPDFs.push({ name: filename, data: pdfData });
      }

      // Generate Markdown
      const markdown = generateMarkdown(processedSections);

      // Create ZIP
      const zipBlob = await createZip(sectionPDFs, markdown);

      // Download
      const timestamp = new Date().toISOString().slice(0, 10);
      const zipName = `${sanitizeFilename(fileName.replace('.pdf', ''))}-split-${timestamp}.zip`;
      downloadZip(zipBlob, zipName);

      setError(null);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-halloween-surface border border-gray-800 rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold text-halloween-purple mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        Smart Split & Summarize
      </h2>

      {/* Mode selector */}
      <div className="mb-6 flex gap-4">
        {hasBookmarks && (
          <button
            onClick={() => handleModeChange('auto')}
            className={`px-4 py-2 rounded transition-colors ${
              mode === 'auto'
                ? 'bg-halloween-purple text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            📖 Auto (Bookmarks)
          </button>
        )}
        <button
          onClick={() => handleModeChange('manual')}
          className={`px-4 py-2 rounded transition-colors ${
            mode === 'manual'
              ? 'bg-halloween-purple text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
        >
          ✏️ Manual Ranges
        </button>
      </div>

      {/* Auto mode info */}
      {mode === 'auto' && hasBookmarks && (
        <div className="mb-6 p-3 bg-green-900/20 border border-green-800 rounded">
          <p className="text-green-400">
            ✓ Detected {sections.length} section{sections.length !== 1 ? 's' : ''} from bookmarks
          </p>
        </div>
      )}

      {/* Manual mode input */}
      {mode === 'manual' && (
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Enter page ranges (e.g., 1-5, 6-10, 11-15):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="1-10, 11-20, 21-30"
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-halloween-purple"
            />
            <button
              onClick={handleParseRanges}
              className="px-4 py-2 bg-halloween-purple hover:bg-purple-700 text-white rounded transition-colors"
            >
              Parse
            </button>
          </div>
        </div>
      )}

      {/* Sections list */}
      {sections.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-halloween-orange mb-3">Sections</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sections.map((section, idx) => {
              const processed = processedSections.find((p) => p.id === section.id);
              return (
                <div
                  key={section.id}
                  className={`p-3 rounded border ${
                    processed
                      ? 'bg-green-900/20 border-green-800'
                      : 'bg-gray-900/50 border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-200">
                        {idx + 1}. {section.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pages {section.startPage + 1}-{section.endPage + 1}
                      </p>
                    </div>
                    {processed && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {processed && processed.summary && (
                    <p className="text-xs text-gray-400 mt-2 italic">"{processed.summary.substring(0, 100)}..."</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Processing progress */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded">
          <p className="text-blue-400 mb-2">Processing {currentSection}</p>
          <div className="w-full bg-gray-900 rounded-full h-2">
            <div
              className="bg-halloween-purple h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{progress}%</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleProcess}
          disabled={isProcessing || sections.length === 0}
          className="flex-1 px-4 py-3 bg-halloween-purple hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors font-medium"
        >
          {isProcessing ? 'Processing...' : 'Process Sections'}
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting || processedSections.length === 0}
          className="flex-1 px-4 py-3 bg-halloween-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors font-medium"
        >
          {isExporting ? 'Exporting...' : 'Export ZIP'}
        </button>
      </div>

      {processedSections.length > 0 && !isExporting && (
        <p className="text-xs text-green-400 mt-3">
          ✓ {processedSections.length} section{processedSections.length !== 1 ? 's' : ''} processed and ready to export
        </p>
      )}
    </div>
  );
};
