# AutoPDF Orchestrator 🎃

A client-side web application for processing and analyzing PDF documents. Built for the Kiroween hackathon with a spooky Halloween theme!

## ✨ Features

### Feature 1: PDF Upload and Preview (✅ Completed)
- **Drag-and-Drop Upload**: Intuitive interface for uploading PDFs
- **File Picker Alternative**: Click to browse for traditional file selection
- **Thumbnail Grid**: View all pages at a glance with lazy-loaded thumbnails
- **Full-Page Viewer**: Interactive viewer with zoom controls
  - Zoom in/out (50-300%)
  - Fit to page
  - Fit to width
  - Keyboard shortcuts (+/- for zoom, arrows for navigation)
- **File Metadata**: Display file name, size, page count, and modification date
- **File Replacement**: Upload new PDFs without page refresh
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Responsive Design**: Works on desktop, tablet, and mobile

### Coming Soon
- **Page Management**: Split and merge PDF pages
- **Content Extraction**: Extract text and tables from PDFs
- **Smart Summarization**: Generate summaries and extract keywords (optional LLM API)
- **Multi-Format Export**: Export as Markdown, JSON, or split PDFs in a ZIP

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
git clone <repository-url>
cd Kiroween

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
│   └── pdfService.ts        # PDF processing functions
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
- **No Tracking**: No analytics or external services (except pdf.js CDN)
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
