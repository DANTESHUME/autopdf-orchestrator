import { useState } from 'react'
import { PDFUploadZone } from './components/PDFUploadZone'
import { FileInfo } from './components/FileInfo'
import { PDFViewer } from './components/PDFViewer'
import { SmartSplitPanel } from './components/SmartSplitPanel'
import { loadPDF, getFileInfo } from './services/pdfService'
import type { PDFDocumentProxy } from './types/pdf'
import type { FileInfo as FileInfoType } from './types/pdf'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfoType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = async (file: File) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Load the PDF
      const doc = await loadPDF(file)
      const info = await getFileInfo(file, doc)
      
      setPdfDoc(doc)
      setFileInfo(info)
      setUploadedFile(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF')
      console.error('Error loading PDF:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadNew = () => {
    setUploadedFile(null)
    setPdfDoc(null)
    setFileInfo(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-halloween-background text-gray-100">
      <header className="p-6 border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-halloween-purple">
              🎃 AutoPDF Orchestrator
            </h1>
            <p className="text-gray-400 mt-1">Process PDFs with spooky ease</p>
          </div>
          {uploadedFile && (
            <button
              onClick={handleUploadNew}
              className="px-4 py-2 bg-halloween-orange hover:bg-orange-600 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-halloween-orange focus:ring-offset-2 focus:ring-offset-halloween-background"
            >
              Upload New File
            </button>
          )}
        </div>
      </header>
      <main className="container mx-auto p-6">
        {!uploadedFile ? (
          <PDFUploadZone 
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-6">
            {fileInfo && <FileInfo fileInfo={fileInfo} />}
            {pdfDoc && <PDFViewer pdfDoc={pdfDoc} />}
            {pdfDoc && <SmartSplitPanel pdfDoc={pdfDoc} fileName={uploadedFile.name} />}
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg" role="alert">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
