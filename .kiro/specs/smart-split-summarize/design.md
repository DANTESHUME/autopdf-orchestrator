# Smart Split & Summarize - Design

## Architecture Overview

### Component Hierarchy
```
App (existing)
└── PDFViewer (existing)
    └── SmartSplitPanel (new)
        ├── SplitModeSelector (bookmark vs manual)
        ├── PageRangeInput (manual mode)
        ├── SectionList (shows detected sections)
        ├── ProcessButton (start processing)
        └── ExportButton (download ZIP)
```

### Data Flow

#### Split Flow
```
User clicks Smart Split
    ↓
splitService.getOutline() → check for bookmarks
    ↓
If bookmarks exist:
    → splitService.createSectionsFromOutline()
Else:
    → Show manual input → splitService.parsePageRanges()
    ↓
Section boundaries defined
    ↓
Update UI with section list
```

#### Processing Flow
```
User clicks Process
    ↓
For each section:
    → textService.extractText(pdfDoc, pageRange)
    → summaryService.generateSummary(text)
    → keywordService.extractKeywords(text)
    ↓
Store results in state
    ↓
Enable Export button
```

#### Export Flow
```
User clicks Export ZIP
    ↓
For each section:
    → splitService.extractSectionPDF(pageRange)
    ↓
exportService.generateMarkdown(allSections)
    ↓
exportService.createZip(pdfs, markdown)
    ↓
Trigger browser download
```

---

## Service Layer Design

### splitService.ts

**Core Functions**:

```typescript
/**
 * Get PDF outline/bookmarks structure
 */
export const getOutline = async (
  pdfDoc: PDFDocumentProxy
): Promise<OutlineNode[] | null>

/**
 * Convert outline to section definitions
 */
export const createSectionsFromOutline = (
  outline: OutlineNode[],
  totalPages: number
): Section[]

/**
 * Parse user-entered page ranges
 */
export const parsePageRanges = (
  input: string,
  totalPages: number
): Section[]

/**
 * Extract pages from PDF as new PDF
 */
export const extractSectionPDF = async (
  pdfDoc: PDFDocumentProxy,
  startPage: number,
  endPage: number
): Promise<Uint8Array>
```

### textService.ts

**Core Functions**:

```typescript
/**
 * Extract text from page range
 */
export const extractText = async (
  pdfDoc: PDFDocumentProxy,
  startPage: number,
  endPage: number
): Promise<string>

/**
 * Extract text from single page
 */
export const extractPageText = async (
  pdfDoc: PDFDocumentProxy,
  pageIndex: number
): Promise<string>
```

### summaryService.ts

**Core Functions**:

```typescript
/**
 * Generate extractive summary from text
 * Uses term frequency and sentence position
 */
export const generateSummary = (
  text: string,
  maxSentences?: number
): string

/**
 * Score sentences by importance
 */
const scoreSentences = (
  sentences: string[],
  termFreq: Map<string, number>
): Array<{ sentence: string; score: number }>

/**
 * Calculate term frequency
 */
const calculateTermFrequency = (text: string): Map<string, number>
```

### keywordService.ts

**Core Functions**:

```typescript
/**
 * Extract top keywords from text
 */
export const extractKeywords = (
  text: string,
  maxKeywords?: number
): string[]

/**
 * Remove stop words
 */
const removeStopWords = (words: string[]): string[]

/**
 * Calculate word frequency excluding stop words
 */
const getWordFrequency = (text: string): Map<string, number>
```

### exportService.ts

**Core Functions**:

```typescript
/**
 * Generate Markdown notes file
 */
export const generateMarkdown = (sections: ProcessedSection[]): string

/**
 * Create ZIP archive
 */
export const createZip = async (
  sectionPDFs: Array<{ name: string; data: Uint8Array }>,
  markdown: string
): Promise<Blob>

/**
 * Trigger browser download
 */
export const downloadZip = (zipBlob: Blob, filename: string): void
```

---

## Component Design

### SmartSplitPanel

**Purpose**: Main UI for splitting and processing  
**Props**:
```typescript
interface SmartSplitPanelProps {
  pdfDoc: PDFDocumentProxy;
  fileName: string;
}
```

**State**:
```typescript
interface SmartSplitState {
  mode: 'auto' | 'manual';
  sections: Section[];
  processedSections: ProcessedSection[];
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
}
```

**Features**:
- Toggle between auto (bookmark) and manual mode
- Display detected sections
- Show processing progress
- Enable export when processing complete

### SplitModeSelector

**Purpose**: Choose auto vs manual split mode  
**Props**:
```typescript
interface SplitModeSelectorProps {
  mode: 'auto' | 'manual';
  hasBookmarks: boolean;
  onModeChange: (mode: 'auto' | 'manual') => void;
}
```

### PageRangeInput

**Purpose**: Manual page range entry  
**Props**:
```typescript
interface PageRangeInputProps {
  totalPages: number;
  onRangesSubmit: (ranges: string) => void;
}
```

**Features**:
- Input field with placeholder "1-5, 6-10, 11-15"
- Real-time validation feedback
- Parse button to create sections

### SectionList

**Purpose**: Display detected/defined sections  
**Props**:
```typescript
interface SectionListProps {
  sections: Section[];
  processedSections: ProcessedSection[];
}
```

**Features**:
- Show section number, title, page range
- Display summary and keywords after processing
- Visual indicator for processed sections

---

## Type Definitions

### types/split.ts

```typescript
export interface OutlineNode {
  title: string;
  dest: any;
  items: OutlineNode[];
}

export interface Section {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
}

export interface ProcessedSection extends Section {
  text: string;
  summary: string;
  keywords: string[];
  pdfData?: Uint8Array;
}

export interface ExportResult {
  zipBlob: Blob;
  sectionCount: number;
}
```

---

## Algorithm Details

### Extractive Summarization

**Approach**: Term frequency + position-based scoring

1. **Split into sentences**: Use period, exclamation, question mark
2. **Calculate term frequency**: Count word occurrences (excluding stop words)
3. **Score each sentence**:
   - Term frequency score: sum of term frequencies for words in sentence
   - Position bonus: first and last sentences get 20% boost
4. **Select top sentences**: Pick 3-5 highest scoring sentences
5. **Preserve order**: Return sentences in original document order

### Keyword Extraction

**Approach**: TF-IDF-lite (within document)

1. **Tokenize**: Split text into words
2. **Remove stop words**: Filter common words (the, and, is, etc.)
3. **Calculate frequency**: Count occurrences of each word
4. **Score multi-word phrases**: Look for 2-3 word sequences with high frequency
5. **Select top keywords**: Return 5-10 highest frequency terms

### Stop Words List
```typescript
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which'
]);
```

---

## Error Handling

### Error Types & Messages

| Error | Cause | User Message |
|-------|-------|--------------|
| No bookmarks | PDF has no outline | "No bookmarks found. Switch to manual mode to enter page ranges." |
| Invalid ranges | Malformed input | "Invalid format. Use: 1-5, 6-10, 11-15" |
| Overlapping ranges | Ranges overlap | "Page ranges cannot overlap. Check pages {X}-{Y}." |
| Out of bounds | Range exceeds pages | "Page range {X}-{Y} exceeds document ({N} pages)." |
| Text extraction failed | pdf.js error | "Could not extract text from section {N}." |
| Export failed | JSZip/pdf-lib error | "Failed to create export. Please try again." |

---

## Performance Considerations

### Web Workers (Optional Enhancement)
- Move heavy text processing to worker thread
- Process multiple sections in parallel
- Avoid blocking UI during long operations

### Progress Tracking
```typescript
interface ProcessingProgress {
  current: number;
  total: number;
  currentSection: string;
}
```

### Memory Management
- Process sections sequentially to limit memory usage
- Clear intermediate data after each section
- Use streams for large text content

---

## UI/UX Design

### Smart Split Panel Layout
```
┌─────────────────────────────────────────────┐
│  Smart Split & Summarize                    │
├─────────────────────────────────────────────┤
│  Mode: [Auto ▼] [Manual]                    │
│                                              │
│  ✓ Detected 5 sections from bookmarks       │
│                                              │
│  Sections:                                   │
│  ─────────────────────────────────────────  │
│  1. Introduction (pages 1-5)                 │
│  2. Background (pages 6-15)                  │
│  3. Methodology (pages 16-30)                │
│  4. Results (pages 31-45)                    │
│  5. Conclusion (pages 46-50)                 │
│                                              │
│  [Process Sections]  [Export ZIP]           │
└─────────────────────────────────────────────┘
```

### Manual Mode Input
```
┌─────────────────────────────────────────────┐
│  Enter page ranges (e.g., 1-5, 6-10):       │
│  ┌─────────────────────────────────────┐   │
│  │ 1-10, 11-20, 21-30                   │   │
│  └─────────────────────────────────────┘   │
│  [Parse Ranges]                             │
└─────────────────────────────────────────────┘
```

### Processing State
```
Processing sections... 3 of 5 complete
Current: Methodology
[███████████░░░░░] 60%
```

---

## Testing Strategy

### Unit Tests (Services)
- `splitService`: outline parsing, range validation
- `textService`: text extraction accuracy
- `summaryService`: summary generation quality
- `keywordService`: keyword relevance
- `exportService`: ZIP creation, Markdown formatting

### Integration Tests
- Full flow: split → process → export
- Error scenarios: invalid ranges, no text, export failures
- Edge cases: single-page sections, very long text

### Manual Testing
- Test with various PDF types (academic papers, books, reports)
- Verify bookmark detection across PDF viewers
- Validate summary quality and keyword relevance
- Test export ZIP contents and file names

---

## Dependencies

```json
{
  "dependencies": {
    "pdfjs-dist": "^6.5.438",  // Text extraction, outline parsing
    "pdf-lib": "^1.17.1",       // Section PDF creation
    "jszip": "^3.10.1"          // ZIP archive creation
  }
}
```

All dependencies already installed from Feature 1.

---

## Deployment Notes

- No new dependencies required
- No backend API needed
- Client-side only processing
- Works offline after initial load
