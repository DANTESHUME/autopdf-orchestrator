# Smart Split & Summarize - Implementation Tasks

## Task Dependency Graph
```
2.1 (Types & Split) → 2.2 (Text Extract) → 2.3 (Summary/Keywords) → 2.4 (Export) → 2.5 (UI) → 2.6 (Test)
```

---

## Task 2.1: Create Split Service & Types

**Status**: ✅ COMPLETED

- [x] `src/types/split.ts` created with interfaces
- [x] `src/services/splitService.ts` created with all functions
- [x] Error handling and validation
- [x] Unit tests: 21/21 passing
- [x] Build: ✓ succeeded

**Description**:
Create type definitions and splitService for outline parsing and page range handling.

**Acceptance Criteria**:
- [ ] `src/types/split.ts` created with interfaces: `OutlineNode`, `Section`, `ProcessedSection`, `ExportResult`
- [ ] `src/services/splitService.ts` created with functions:
  - `getOutline()` - fetch PDF outline/bookmarks using pdf.js
  - `createSectionsFromOutline()` - convert bookmarks to sections
  - `parsePageRanges()` - parse and validate user-entered ranges
  - `validatePageRanges()` - check for overlaps, bounds
- [ ] Error handling for invalid ranges, no bookmarks
- [ ] JSDoc comments on all exported functions
- [ ] Unit tests for range parsing and validation

**Implementation Notes**:
- Use `pdfDoc.getOutline()` from pdf.js
- Parse ranges: split by comma, then by dash
- Validate: no overlaps, within bounds (1 to totalPages)
- Section IDs: use `crypto.randomUUID()` or simple counter

**Files to Create**:
- `src/types/split.ts`
- `src/services/splitService.ts`
- `src/services/splitService.test.ts`

---

## Task 2.2: Create Text Extraction Service

**Status**: ✅ COMPLETED

- [x] `src/services/textService.ts` created
- [x] Text extraction with page ranges
- [x] Graceful handling of non-text pages
- [x] Unit tests: 5/5 passing
- [x] Build: ✓ succeeded

**Description**:
Implement text extraction from PDF page ranges using pdf.js.

**Acceptance Criteria**:
- [ ] `src/services/textService.ts` created with functions:
  - `extractText()` - extract text from page range
  - `extractPageText()` - extract text from single page
- [ ] Text concatenation preserves paragraph breaks
- [ ] Handle pages with no text content gracefully
- [ ] Return "[No text content]" for image-only pages
- [ ] JSDoc comments on all functions
- [ ] Unit tests with mock PDF data

**Implementation Notes**:
- Use `page.getTextContent()` from pdf.js
- Iterate through text items and join with spaces
- Preserve line breaks where `str` contains `\n`
- Try-catch for each page to handle extraction errors

**Files to Create**:
- `src/services/textService.ts`
- `src/services/textService.test.ts`

---

## Task 2.3: Create Summary & Keyword Services

**Status**: ✅ COMPLETED

- [x] `src/services/summaryService.ts` - extractive summarization (TF + position)
- [x] `src/services/keywordService.ts` - keyword extraction with stop words
- [x] Summary: term frequency + position-based scoring
- [x] Keywords: filtered, frequency-sorted
- [x] Unit tests: 23/23 passing
- [x] Build: ✓ succeeded

**Description**:
Implement local extractive summarization and keyword extraction algorithms.

**Acceptance Criteria**:
- [ ] `src/services/summaryService.ts` created with functions:
  - `generateSummary()` - extractive summary (3-5 sentences)
  - `scoreSentences()` - score by term frequency + position
  - `calculateTermFrequency()` - count word occurrences
- [ ] `src/services/keywordService.ts` created with functions:
  - `extractKeywords()` - top 5-10 keywords
  - `removeStopWords()` - filter common words
  - `getWordFrequency()` - count word occurrences
- [ ] Stop words list defined (40+ common words)
- [ ] Summary preserves original sentence text
- [ ] Keywords sorted by frequency
- [ ] Handle short text (<100 words) gracefully
- [ ] JSDoc comments on all functions
- [ ] Unit tests for summary and keyword quality

**Implementation Notes**:
- Split sentences: `text.split(/[.!?]+/)`
- Stop words: `['the', 'a', 'an', 'and', 'or', 'but', ...]`
- TF score: sum of word frequencies in sentence
- Position bonus: +20% for first and last sentences
- Return top N sentences in original order

**Files to Create**:
- `src/services/summaryService.ts`
- `src/services/summaryService.test.ts`
- `src/services/keywordService.ts`
- `src/services/keywordService.test.ts`

---

## Task 2.4: Create Export Service (PDF Split + ZIP)

**Status**: ✅ COMPLETED

- [x] `src/services/exportService.ts` created
- [x] Markdown generation with proper formatting
- [x] ZIP creation with pdf-lib and JSZip
- [x] Browser download functionality
- [x] Filename sanitization
- [x] Unit tests: 8/8 passing
- [x] Build: ✓ succeeded

**Description**:
Implement section PDF extraction using pdf-lib and ZIP creation using JSZip.

**Acceptance Criteria**:
- [ ] `src/services/exportService.ts` created with functions:
  - `extractSectionPDF()` - create PDF from page range using pdf-lib
  - `generateMarkdown()` - create consolidated notes file
  - `createZip()` - package PDFs and Markdown as ZIP
  - `downloadZip()` - trigger browser download
- [ ] PDF filenames: `section-{N}-{title}.pdf` or `section-{N}-pages-{start}-{end}.pdf`
- [ ] Markdown format matches spec (heading, pages, summary, keywords)
- [ ] ZIP contains all section PDFs + notes.md
- [ ] Browser download triggered with proper filename
- [ ] Error handling for pdf-lib and JSZip failures
- [ ] JSDoc comments on all functions
- [ ] Unit tests for Markdown generation and ZIP structure

**Implementation Notes**:
- Use `PDFDocument.load()` and `copyPages()` from pdf-lib
- Sanitize filenames: replace special characters with dashes
- Markdown template:
  ```
  ## Section {N}: {Title}
  Pages: {start}-{end}
  
  ### Summary
  {summary}
  
  ### Keywords
  {keywords}
  
  ---
  ```
- JSZip: `zip.file(filename, data)` then `zip.generateAsync()`
- Download: create blob URL and trigger click on invisible anchor

**Files to Create**:
- `src/services/exportService.ts`
- `src/services/exportService.test.ts`

---

## Task 2.5: Create SmartSplitPanel UI Component

**Status**: ✅ COMPLETED

- [x] `src/components/SmartSplitPanel.tsx` created
- [x] Mode selector: auto (bookmarks) vs manual
- [x] Auto mode: detects bookmarks on mount
- [x] Manual mode: page range input with validation
- [x] Section list with processing status
- [x] Process button: extracts text, summarizes, keywords
- [x] Progress tracking during processing
- [x] Export button: downloads ZIP
- [x] Error display and recovery
- [x] Dark Halloween theme
- [x] Keyboard accessible
- [x] Integrated into App.tsx
- [x] Build: ✓ succeeded

**Description**:
Build main UI component integrating all services with mode switching, section display, processing, and export.

**Acceptance Criteria**:
- [ ] `src/components/SmartSplitPanel.tsx` created
- [ ] Mode selector: toggle between Auto (bookmarks) and Manual (page ranges)
- [ ] Auto mode: detect and display bookmarks automatically
- [ ] Manual mode: input field for page ranges with validation
- [ ] Section list: display detected sections with page ranges
- [ ] Process button: trigger text extraction + summarization
- [ ] Processing progress: show current section and percentage
- [ ] Export button: enabled after processing, downloads ZIP
- [ ] Error messages displayed clearly for all failure modes
- [ ] Loading states during async operations
- [ ] Dark Halloween theme applied
- [ ] Responsive layout (desktop and mobile)
- [ ] Keyboard accessible (Tab, Enter)

**Implementation Notes**:
- Integrate SmartSplitPanel below PDFViewer in App.tsx
- Use `useState` for mode, sections, processedSections, progress
- Detect bookmarks on mount: call `getOutline()` and show result
- Process button: loop through sections, extract text, summarize, update progress
- Export button: call exportService functions in sequence
- Show success message after export with section count

**Files to Create**:
- `src/components/SmartSplitPanel.tsx`

**Files to Modify**:
- `src/App.tsx` - add SmartSplitPanel below PDFViewer

---

## Task 2.6: Testing & Integration

**Status**: ✅ COMPLETED

- [x] All service unit tests: 78/78 passing
  - splitService: 21/21 ✓
  - textService: 5/5 ✓
  - summaryService: 10/10 ✓
  - keywordService: 13/13 ✓
  - pdfService: 21/21 ✓
  - exportService: 8/8 ✓
- [x] Integration: SmartSplitPanel fully functional
- [x] Full workflow tested: split → process → export
- [x] Error handling tested
- [x] Build succeeds without errors
- [x] No console errors

**Description**:
Write integration tests, manual testing, and bug fixes for complete feature.

**Acceptance Criteria**:
- [ ] All service unit tests passing (splitService, textService, summaryService, keywordService, exportService)
- [ ] Integration test: full flow from split to export
- [ ] Manual test: PDF with bookmarks (academic paper)
- [ ] Manual test: PDF without bookmarks (manual ranges)
- [ ] Manual test: Scanned PDF (no text)
- [ ] Manual test: Large PDF (20+ sections)
- [ ] Verify ZIP contents: all PDFs + notes.md
- [ ] Verify Markdown formatting and content
- [ ] Verify summary quality (readable, concise)
- [ ] Verify keyword relevance
- [ ] Build succeeds without errors
- [ ] No console warnings or errors during use
- [ ] All bugs identified and fixed

**Testing Checklist**:
1. **Split Modes**
   - [ ] Auto mode detects bookmarks correctly
   - [ ] Manual mode parses ranges: "1-5, 6-10, 11-15"
   - [ ] Invalid ranges show clear errors
   - [ ] Overlapping ranges rejected
   - [ ] Out-of-bounds ranges rejected

2. **Text Extraction**
   - [ ] Text extracted from all section pages
   - [ ] No text pages show "[No text content]"
   - [ ] Paragraph breaks preserved reasonably

3. **Processing**
   - [ ] Progress bar updates during processing
   - [ ] All sections processed without errors
   - [ ] Summaries are 3-5 sentences
   - [ ] Keywords are relevant and sorted

4. **Export**
   - [ ] ZIP downloads successfully
   - [ ] ZIP contains N section PDFs + notes.md
   - [ ] PDF filenames correct and sanitized
   - [ ] Markdown file formatted correctly
   - [ ] Section PDFs contain correct pages

5. **Edge Cases**
   - [ ] Single-page sections work
   - [ ] Very long text (1000+ words) summarizes correctly
   - [ ] Empty sections (no text) handled gracefully
   - [ ] Special characters in bookmark titles sanitized

**Files to Create/Modify**:
- All test files (`*.test.ts`)
- Bug fixes in service and component files

---

## Summary

| Task | Title | Effort | Priority | Dependencies |
|------|-------|--------|----------|--------------|
| 2.1 | Split Service & Types | 1.5h | P0 | Feature 1 |
| 2.2 | Text Extraction | 1h | P0 | 2.1 |
| 2.3 | Summary & Keywords | 2h | P0 | 2.2 |
| 2.4 | Export (PDF + ZIP) | 2h | P0 | 2.3 |
| 2.5 | SmartSplitPanel UI | 2.5h | P0 | 2.1-2.4 |
| 2.6 | Testing & Integration | 1.5h | P0 | 2.1-2.5 |

**Total Estimated Effort**: 10.5 hours

**Critical Path**: 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6
