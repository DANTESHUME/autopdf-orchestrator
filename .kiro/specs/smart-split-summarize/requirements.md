# Smart Split & Summarize - Requirements

## Overview
Automatically split a loaded PDF by its outline/bookmarks into logical sections, extract text from each section, generate extractive summaries and keywords locally (no API), and export section PDFs with a consolidated Markdown notes file as a ZIP archive.

---

## User Story 1: Auto-Split by Outline/Bookmarks

**Given** a PDF with outline/bookmarks is loaded  
**When** the user clicks a "Smart Split" button  
**THE SYSTEM SHALL** parse the PDF outline structure using pdf.js  
**AND** identify section boundaries based on bookmark page references  
**AND** create logical sections where each bookmark represents a new section

**Given** a PDF outline has nested bookmarks  
**When** the system parses the outline  
**THE SYSTEM SHALL** use only top-level bookmarks as section boundaries  
**AND** ignore nested sub-bookmarks for splitting purposes

**Given** a PDF has no outline/bookmarks  
**When** the user attempts to use Smart Split  
**THE SYSTEM SHALL** fall back to manual page range input mode  
**AND** display a message indicating "No bookmarks found. Please enter page ranges manually."

---

## User Story 2: Manual Page Range Fallback

**Given** a PDF has no bookmarks or the user prefers manual control  
**When** the user enters page ranges in the format "1-5, 6-10, 11-15"  
**THE SYSTEM SHALL** validate the input format (comma-separated ranges)  
**AND** validate that ranges are within the PDF page count  
**AND** validate that ranges do not overlap  
**AND** create sections based on the specified page ranges

**Given** the user enters invalid page ranges  
**When** the input contains errors (overlapping ranges, out-of-bounds pages, invalid format)  
**THE SYSTEM SHALL** display a clear error message indicating the specific issue  
**AND** allow the user to correct the input

---

## User Story 3: Text Extraction per Section

**Given** sections have been defined (via bookmarks or manual ranges)  
**When** the system processes each section  
**THE SYSTEM SHALL** extract text content from all pages in the section using pdf.js  
**AND** concatenate the text preserving paragraph structure where possible  
**AND** store the extracted text for summary generation

**Given** a section contains no extractable text (images only, scanned PDF)  
**When** text extraction is attempted  
**THE SYSTEM SHALL** note that the section contains no text  
**AND** still include the section in the export with a "[No text content]" indicator

---

## User Story 4: Local Extractive Summary Generation

**Given** text has been extracted from a section  
**When** the system generates a summary  
**THE SYSTEM SHALL** use local extractive summarization (no external API)  
**AND** identify the most important sentences based on term frequency and position  
**AND** create a summary of approximately 3-5 sentences or 10% of original length (whichever is shorter)  
**AND** preserve original sentence text without modification

**Given** a section has very little text (<100 words)  
**When** summary generation is attempted  
**THE SYSTEM SHALL** use the entire text as the summary without reduction

---

## User Story 5: Keyword Extraction

**Given** text has been extracted from a section  
**When** the system extracts keywords  
**THE SYSTEM SHALL** identify the top 5-10 keywords based on term frequency  
**AND** exclude common stop words (the, and, or, etc.)  
**AND** prefer multi-word phrases where relevant  
**AND** present keywords in order of importance

**Given** a section has minimal text  
**When** keyword extraction is attempted  
**THE SYSTEM SHALL** extract as many meaningful keywords as available (minimum 3)

---

## User Story 6: Export Section PDFs and Markdown Notes

**Given** all sections have been processed with summaries and keywords  
**When** the user clicks "Export ZIP"  
**THE SYSTEM SHALL** create individual PDF files for each section using pdf-lib  
**AND** name each PDF as "section-{N}-{bookmark-title}.pdf" or "section-{N}-pages-{start}-{end}.pdf"  
**AND** create a single Markdown file consolidating all section notes  
**AND** package all files into a ZIP archive using JSZip  
**AND** trigger a browser download of the ZIP file

**Given** the Markdown notes file is being created  
**When** the system writes section notes  
**THE SYSTEM SHALL** format each section as:
```markdown
## Section {N}: {Title}
Pages: {start}-{end}

### Summary
{extractive summary text}

### Keywords
{comma-separated keywords}

---
```

**Given** the user exports the ZIP  
**When** the download completes  
**THE SYSTEM SHALL** display a success message with the number of sections exported  
**AND** maintain the original PDF in the viewer for continued use

---

## Acceptance Criteria Summary

- ✓ Auto-detect and split by PDF outline/bookmarks
- ✓ Fallback to manual page range input when no bookmarks exist
- ✓ Extract text from each section using pdf.js
- ✓ Generate local extractive summaries (no API required)
- ✓ Extract top keywords per section
- ✓ Create individual section PDFs using pdf-lib
- ✓ Generate consolidated Markdown notes file
- ✓ Package everything as a ZIP using JSZip
- ✓ Clear error messages for invalid inputs
- ✓ Works entirely client-side

---

## Constraints & Assumptions

### Performance
- Processing should handle PDFs up to 50 sections without UI blocking
- Use Web Workers if needed for heavy text processing
- Show progress indicator during processing

### Text Extraction Limitations
- Scanned PDFs (images only) will have no extractable text
- Complex layouts may have imperfect text ordering
- Tables and figures are excluded from text extraction

### Summarization Approach
- Purely extractive (no generative AI)
- Simple term frequency-based algorithm
- No external API calls required

### Browser Compatibility
- Same as Feature 1 (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+)

---

## Related Features
- Feature 1: PDF Upload and Preview (dependency - must be loaded first)
