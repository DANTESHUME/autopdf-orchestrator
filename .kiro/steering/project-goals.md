# AutoPDF Orchestrator: Product Goals

## Project Vision
AutoPDF Orchestrator is a lightweight, client-side web application for processing and analyzing PDF documents. Built for the Kiroween hackathon, it empowers users to quickly extract, transform, and understand PDF content without relying on backend services or requiring authentication.

## Core Features
1. **PDF Upload & Preview**: Drag-and-drop interface for uploading PDFs with live preview
2. **Page Management**: Split and merge PDF pages with an intuitive UI
3. **Content Extraction**: Extract text and tables from PDFs
4. **Smart Summarization**: Generate summaries and extract keywords using optional LLM API or local fallback
5. **Multi-Format Export**: Export results as Markdown, JSON, or split PDFs in a ZIP archive

## Design Principles
- **No Backend**: All processing happens client-side in the browser
- **No Login**: Completely open access; user data never leaves their machine
- **Works Offline**: Core features operate without internet; LLM features optional
- **Privacy First**: No tracking, no data collection, no external dependencies for core features
- **Dark Halloween Theme**: Festive, spooky visual design that's still professional and usable

## Success Criteria
- Users can upload and preview PDFs with minimal friction
- All features work without backend infrastructure
- Export formats preserve document integrity and readability
- Optional LLM integration enhances but doesn't require workflows
- Deployed and accessible on Vercel
- MIT licensed and open for community contributions

## Target Users
- Students organizing research papers
- Professionals managing document workflows
- Anyone needing quick PDF processing without cloud dependencies
