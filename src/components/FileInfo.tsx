import React from 'react';
import type { FileInfo as FileInfoType } from '../types/pdf';
import { formatFileSize } from '../services/pdfService';

interface FileInfoProps {
  fileInfo: FileInfoType;
}

/**
 * Display component for PDF file metadata
 */
export const FileInfo: React.FC<FileInfoProps> = ({ fileInfo }) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const infoItems = [
    {
      label: 'File Name',
      value: fileInfo.name,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: 'File Size',
      value: formatFileSize(fileInfo.size),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
    {
      label: 'Pages',
      value: `${fileInfo.pageCount} ${fileInfo.pageCount === 1 ? 'page' : 'pages'}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: 'Modified',
      value: formatDate(fileInfo.modifiedDate),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-halloween-surface border border-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-halloween-purple mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        File Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
          >
            <div className="text-halloween-orange mt-0.5 flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {item.label}
              </p>
              <p className="text-sm text-gray-200 font-medium break-words">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
