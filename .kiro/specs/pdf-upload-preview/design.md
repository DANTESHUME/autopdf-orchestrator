# Feature 1: PDF Upload and Preview - Design

## Architecture Overview

### Component Hierarchy
```
App (root, manages upload state)
├── Header (logo, theme toggle, file info)
├── PDFUploadZone (drag-drop, file input, validation)
├── FileInfo (metadata display)
└── PDFViewer (thumbnail grid + full-page viewer)
    ├── ThumbnailGrid (scrollable grid of page previews)
    └── PageViewer (main viewer with zoom & navigation)
```

### Data Flow

#### Upload Flow
```
User drags/clicks file
    ↓
PDFUploadZone validates file
    ↓
pdfService.validatePDF() → checks MIME, extension, pdf.js parsing
    ↓
pdfService.loadPDF() → initializes pdf.js worker, gets page count
    ↓
App state updated with PDF document object
    ↓
ThumbnailGrid + PageViewer render
```

#### Navigation Flow
```
User clicks thumbnail / next/prev button
    ↓
App state updates selected page index
    ↓
PageViewer re-renders with new page
    ↓
ThumbnailGrid highlights selected thumbnail
```

#### Error Flow
```
Validation fails or parsing error occurs
    ↓
pdfService catches error, formats message
    ↓
ErrorModal or inline message displayed
    ↓
User can retry or upload new file
```

---

## Component Design

### 1. PDFUploadZone
**Purpose**: Accept and validate PDF files  
**Props**: 
```tsx
interface PDFUploadZoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}
```

**Features**:
- Drag-and-drop zone with visual feedback (dark mode: purple/orange borders)
- File input alternative ("Choose File" button)
- Loading spinner during validation
- Accepts `.pdf` files only

**Internal State**:
- `isDragging: boolean` – for visual feedback

### 2. FileInfo
**Purpose**: Display PDF metadata  
**Props**:
```tsx
interface FileInfoProps {
  fileName: string;
  fileSize: number; // bytes
  pageCount: number;
  modifiedDate?: Date;
}
```

**Features**:
- Displays file name, size (formatted), page count
- Shows modification date if available
- Halloween-themed styling

### 3. ThumbnailGrid
**Purpose**: Display all pages as clickable thumbnails  
**Props**:
```tsx
interface ThumbnailGridProps {
  pdfDoc: PDFDocumentProxy;
  selectedPageIndex: number;
  onPageSelect: (index: number) => void;
  isLoading: boolean;
}
```

**Features**:
- Renders thumbnails for each page
- Page numbers displayed below each thumbnail
- Selected page highlighted with accent color (purple/orange)
- Scrollable grid with smooth scrolling
- Progressive loading for large PDFs (render visible thumbnails first)
- Keyboard navigation (arrow keys, Enter to select)

**Performance Optimization**:
- Use `IntersectionObserver` to lazy-load thumbnails outside viewport
- Limit concurrent thumbnail renders (e.g., max 3 at a time)
- Cache rendered thumbnails in state or memoization

### 4. PageViewer
**Purpose**: Display selected PDF page with zoom and navigation  
**Props**:
```tsx
interface PageViewerProps {
  pdfDoc: PDFDocumentProxy;
  pageIndex: number;
  onPageChange: (index: number) => void;
}
```

**Features**:
- Full-size rendering of selected page
- Zoom controls: +/-, Fit to Page, Fit to Width, Reset (100%)
- Current zoom percentage displayed
- Previous/Next page buttons
- "Page X of Y" indicator
- Keyboard shortcuts (arrow keys for navigation)
- Responsive canvas sizing

**Internal State**:
```tsx
interface PageViewerState {
  zoomLevel: number; // 50-300 in 10% increments
  zoomMode: 'fit-page' | 'fit-width' | 'custom';
  rendering: boolean;
}
```

### 5. PDFViewer (Container)
**Purpose**: Combine thumbnail grid and page viewer  
**Props**:
```tsx
interface PDFViewerProps {
  pdfDoc: PDFDocumentProxy;
}
```

**Features**:
- Layout: thumbnails on left (desktop), stacked on mobile
- Responsive grid/flex layout
- Manages page selection state
- Delegates rendering to child components

### 6. ErrorModal / ErrorBanner
**Purpose**: Display user-friendly error messages  
**Props**:
```tsx
interface ErrorDisplayProps {
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}
```

**Features**:
- Clear, non-technical error messages
- Retry button when applicable
- Close button to dismiss
- Dark theme styling (red accent for errors)

### 7. App (Root Component)
**Purpose**: Orchestrate upload flow, manage global state  
**State**:
```tsx
interface AppState {
  pdfDoc: PDFDocumentProxy | null;
  file: File | null;
  selectedPageIndex: number;
  isLoading: boolean;
  error: string | null;
  theme: 'dark' | 'light'; // for future toggle
}
```

**Features**:
- Manages PDF upload and validation
- Handles file replacement
- Passes state and callbacks to child components
- Theme provider (dark mode default)

---

## Service Layer: pdfService.ts

### Core Functions

#### `validatePDF(file: File): Promise<void>`
- Checks MIME type: `application/pdf`
- Checks extension: `.pdf`
- Attempts to load with pdf.js to confirm parsing
- Throws descriptive errors on failure

```tsx
export const validatePDF = async (file: File): Promise<void> => {
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    throw new Error('Please select a PDF file.');
  }

  const arrayBuffer = await file.arrayBuffer();
  try {
    await getDocument(arrayBuffer).promise;
  } catch (err) {
    throw new Error('This PDF could not be read. It may be corrupted or use unsupported features.');
  }
};
```

#### `loadPDF(file: File): Promise<PDFDocumentProxy>`
- Validates file
- Initializes pdf.js document
- Returns document object for rendering

```tsx
export const loadPDF = async (file: File): Promise<PDFDocumentProxy> => {
  await validatePDF(file);
  const arrayBuffer = await file.arrayBuffer();
  return getDocument(arrayBuffer).promise;
};
```

#### `renderPageToCanvas(pdfDoc: PDFDocumentProxy, pageIndex: number, scale: number): Promise<HTMLCanvasElement>`
- Renders a single page to canvas at specified zoom level
- Used by PageViewer and ThumbnailGrid

```tsx
export const renderPageToCanvas = async (
  pdfDoc: PDFDocumentProxy,
  pageIndex: number,
  scale: number = 1
): Promise<HTMLCanvasElement> => {
  const page = await pdfDoc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context!,
    viewport,
  }).promise;
  
  return canvas;
};
```

#### `getFileInfo(file: File, pdfDoc: PDFDocumentProxy): FileInfo`
- Extracts metadata: name, size, page count, date

```tsx
export interface FileInfo {
  name: string;
  size: number;
  pageCount: number;
  modifiedDate: Date;
}

export const getFileInfo = async (
  file: File,
  pdfDoc: PDFDocumentProxy
): Promise<FileInfo> => {
  return {
    name: file.name,
    size: file.size,
    pageCount: pdfDoc.numPages,
    modifiedDate: new Date(file.lastModified),
  };
};
```

---

## State Management

### Local State
- Individual component state for UI interactions (zoom, drag, etc.)
- Use `useState` for component-level state

### Global State (App-level)
- Current PDF document
- Selected page index
- Loading/error states
- Consider Context API for theme persistence

### Future: Context API Setup (if needed for multi-feature coordination)
```tsx
interface PDFContextValue {
  pdfDoc: PDFDocumentProxy | null;
  selectedPageIndex: number;
  fileInfo: FileInfo | null;
}

const PDFContext = createContext<PDFContextValue | null>(null);
```

---

## Error Handling Strategy

### Error Types & Messages

| Error | Cause | User Message |
|-------|-------|--------------|
| Invalid file type | Non-PDF file | "Please select a PDF file (`.pdf` only)." |
| Corrupted PDF | Parsing failure | "This PDF could not be read. It may be corrupted or use unsupported features." |
| Password-protected | Encrypted PDF | "Password-protected PDFs are not supported yet." |
| Very large file | >100 MB | "This PDF is too large. Please try a smaller file." |
| Unsupported features | Advanced PDF features | "This PDF uses features we don't support yet. Some content may not display correctly." |

### Error Handling Pattern
```tsx
try {
  const pdfDoc = await loadPDF(file);
  setAppState({ pdfDoc, file, error: null });
} catch (err) {
  const message = formatErrorMessage(err);
  setAppState({ error: message });
}
```

### User Recovery
- Display error in banner/modal
- Provide "Retry" or "Try Another File" button
- Allow returning to upload zone

---

## Dark Mode & Halloween Theme

### Color Palette
- **Background**: `#0f0f0f` (near black)
- **Surface**: `#1a1a1a` (slightly lighter)
- **Primary Accent**: `#7c3aed` (purple)
- **Secondary Accent**: `#f97316` (orange)
- **Error**: `#dc2626` (red)
- **Success**: `#10b981` (emerald)
- **Text**: `#f3f4f6` (light gray)
- **Text Secondary**: `#9ca3af` (medium gray)

### Tailwind Implementation
```tsx
// Example component with dark theme
<div className="bg-gray-950 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
    Upload PDF
  </button>
</div>
```

### Halloween Details
- Subtle gradient overlays or patterns
- Orange/purple accents on interactive elements
- Spooky icons for the header/logo
- Maintain professional look while keeping theme

---

## Testing Strategy

### Unit Tests (pdfService.ts)
- `validatePDF()` with valid and invalid files
- `loadPDF()` with various PDF types
- `renderPageToCanvas()` with different zoom levels
- Error message formatting

### Component Tests (if using Vitest + Testing Library)
- PDFUploadZone: drag-drop interactions, file input, validation feedback
- ThumbnailGrid: rendering, selection, keyboard navigation
- PageViewer: zoom controls, page navigation, responsive layout
- FileInfo: correct data display

### Integration Tests
- Full upload → preview flow
- Error scenarios (corrupted file, invalid format)
- File replacement workflow
- Navigation between pages

### Manual Testing Checklist
- [ ] Upload various PDF types (text, scanned, mixed)
- [ ] Drag-drop multiple files in sequence
- [ ] Test zoom at various levels
- [ ] Test on desktop and tablet viewports
- [ ] Keyboard navigation (Tab, Arrow keys, Enter)
- [ ] Dark mode rendering
- [ ] Error handling (invalid files, corrupted PDFs)
- [ ] Large PDF (100+ pages) responsiveness
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## Performance Considerations

### Lazy Loading Thumbnails
- Implement `IntersectionObserver` to render only visible thumbnails
- Cache rendered thumbnails using React memoization
- Batch rendering to avoid blocking UI

### PDF.js Worker
- Use worker thread for rendering (offload from main thread)
- Reduce UI blocking during page rendering
- Configure worker path in pdf.js setup

### Canvas Rendering
- Render at appropriate resolution for display (not 4K if 1080p display)
- Use `devicePixelRatio` for crisp rendering on high-DPI screens
- Reuse canvas elements where possible

### Memory Management
- Clear canvas contexts after rendering
- Dispose of pdf.js documents properly
- Limit concurrent renders to prevent memory bloat

---

## Accessibility (WCAG 2.1 AA Target)

### Keyboard Navigation
- Tab through all interactive elements
- Drag-drop zone accessible via button alternative
- Arrow keys navigate pages
- Enter to confirm actions

### Screen Readers
- ARIA labels on buttons ("Previous Page", "Zoom In", etc.)
- Alt text for uploaded file name and page count
- Error messages announced as live regions

### Color Contrast
- Text contrast ≥4.5:1 for normal text
- Button contrast ≥3:1 for graphical elements
- Error messages use color + icon/text (not color alone)

### Visual Indicators
- Focus visible on all interactive elements
- Loading states clearly indicated
- Error states distinct (red color + icon)
- Page selection clearly highlighted in thumbnail grid

### Responsive Design
- Touch-friendly button sizes (48px minimum)
- Zoom controls accessible on small screens
- Thumbnail grid adapts to mobile layout
- Text readable without manual zooming (16px minimum)

---

## Dependencies & Versions

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "pdfjs-dist": "^6.5.438",
    "pdf-lib": "^1.17.1",
    "jszip": "^3.10.1"
  },
  "devDependencies": {
    "vite": "^8.3.6",
    "react-plugin": "@vitejs/plugin-react",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.6",
    "@tailwindcss/forms": "^0.5.8"
  }
}
```

---

## Deployment Notes

- Vercel serverless: static files only
- No backend API routes needed for this feature
- pdf.js worker files must be included in build output
- Environment: no config vars required initially
