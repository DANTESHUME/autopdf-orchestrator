# AutoPDF Orchestrator 🎃

A client-side web application for processing and analyzing PDF documents. Built for the Kiroween hackathon with a spooky Halloween theme!

## 🔗 Links

- **Live demo**: https://autopdf-orchestrator.vercel.app/
- **Demo video**: https://youtu.be/Gfs31yIRpdc

## ✨ Features

### PDF Upload and Preview
- Drag-and-drop or file picker upload with PDF validation
- Lazy-loaded thumbnail grid and full-page viewer with zoom (50-300%, fit page, fit width)
- File metadata (name, size, page count, date) and keyboard navigation

### Smart Split & Summarize
- **Auto split by bookmarks**: reads the PDF outline and resolves each entry to its real page
- **TOC fallback**: PDFs without bookmarks are split using the table-of-contents page
- **Local summaries and keywords** for every section, extractive and 100% in-browser (no API key)

### Export
- One-click ZIP with split PDFs per section, Markdown notes and an HTML notes page

Try it with `samples/kiroween-sample.pdf` (9 pages, 5 bookmarked sections).

## 👻 Built with Kiro

This project was built spec-first in the Kiro IDE. Everything lives in [`.kiro/`](.kiro):

- **Specs** (`.kiro/specs/`): `pdf-upload-preview` and `smart-split-summarize`, each with EARS-style `requirements.md`, `design.md` and `tasks.md`. Kiro executed the task lists step by step.
- **Steering** (`.kiro/steering/`): project goals, tech stack and code conventions, so every agent run followed the same rules.
- **Hooks** (`.kiro/hooks/`): runs the Vitest suite when a service file is saved, and reminds the agent to document new components.
- **Models**: Sonnet for planning specs and design, Haiku for executing tasks.

## 🎨 Design

- **Dark Halloween Theme**: Spooky yet professional design
- **Color Palette**: Purple (#7c3aed) and orange (#f97316) accents on near-black background
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 8
- **Styling**: Tailwind CSS with dark mode
- **PDF Processing**: pdf.js 6.5.438 (rendering), pdf-lib (manipulation)
- **Archive Creation**: JSZip
- **Deployment**: Vercel (static hosting)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/DANTESHUME/autopdf-orchestrator.git
cd autopdf-orchestrator

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── PDFUploadZone.tsx    # Drag-drop upload interface
│   ├── FileInfo.tsx         # File metadata display
│   ├── ThumbnailGrid.tsx    # Page thumbnail grid
│   ├── ThumbnailItem.tsx    # Individual thumbnail with lazy loading
│   ├── PageViewer.tsx       # Full-page viewer with zoom
│   └── PDFViewer.tsx        # Container combining grid and viewer
├── services/          # Business logic
│   ├── pdfService.ts        # PDF loading and rendering
│   ├── splitService.ts      # Bookmark / TOC section detection and splitting
│   ├── textService.ts       # Text extraction and cleanup
│   ├── summaryService.ts    # Local extractive summaries
│   ├── keywordService.ts    # Keyword extraction
│   └── exportService.ts     # ZIP export
├── types/            # TypeScript definitions
│   └── pdf.ts              # PDF-related types
├── utils/            # Utility functions
├── styles/           # Global styles
│   └── globals.css         # Tailwind directives
└── constants/        # App constants
```

## 🎯 Features in Detail

### PDF Upload & Validation
- Validates file type (MIME and extension)
- Checks PDF integrity with pdf.js parsing
- User-friendly error messages for invalid/corrupted files
- No file size limit (client-side processing only)

### Thumbnail Grid
- Lazy loading with IntersectionObserver
- Progressive rendering for large PDFs (50+ pages)
- Keyboard navigation (arrow keys, Home, End)
- Visual selection indicators

### Page Viewer
- High-DPI rendering support (devicePixelRatio)
- Multiple zoom modes (custom, fit-page, fit-width)
- Smooth zoom transitions
- Page navigation controls and keyboard shortcuts

## 🔒 Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Backend**: No servers, no data transmission
- **No Tracking**: No analytics or external services (pdf.js worker is bundled locally)
- **Open Source**: MIT License

## ⌨️ Keyboard Shortcuts

- **Arrow Keys**: Navigate pages and thumbnails
- **+/-**: Zoom in/out
- **0**: Reset zoom to 100%
- **Home/End**: Jump to first/last page
- **Tab**: Navigate through interactive elements
- **Enter**: Select thumbnail

## 🌐 Browser Support

- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

Requires ES2020+ JavaScript support.

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

The app is fully static and requires no server-side configuration.

### Other Static Hosts

Build the project (`npm run build`) and deploy the `dist/` folder to any static hosting service:
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [pdf.js](https://mozilla.github.io/pdf.js/) by Mozilla
- Powered by [Vite](https://vite.dev/) and [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with 🎃 for the Kiroween Hackathon**
