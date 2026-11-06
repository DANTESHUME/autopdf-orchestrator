# AutoPDF Orchestrator: Tech Stack

## Frontend Framework
- **React 18+**: Modern component-based architecture with hooks
- **Vite**: Lightning-fast build tool and dev server
- **TypeScript**: Type safety across the application

## Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Dark Theme Support**: Leverage Tailwind's dark mode for Halloween aesthetic

## PDF Processing Libraries
- **pdf.js**: Industry-standard for PDF rendering and viewing
- **pdf-lib**: Client-side PDF manipulation (page splitting, merging)
- **JSZip**: Create and download ZIP archives for file exports

## Optional: LLM Integration
- Support user-provided API keys (OpenAI, Claude, etc.)
- Environment-agnostic: accept keys at runtime via UI
- Fallback to local extractive summarization when no key provided

## Deployment
- **Vercel**: Serverless deployment for frontend
- **Environment Variables**: None required; all user config via UI

## Development Tools
- **Node.js 18+**: Runtime for development and build
- **npm**: Package management
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

## Browser Support
- Modern browsers with ES2020+ support
- WebWorkers for background PDF processing (optional optimization)

## Architecture Notes
- **Client-Side Only**: All PDF processing and data handling in the browser
- **No API Routes**: No backend endpoints; Vercel hosts only static assets
- **Local Storage**: Optional for saving recent files or user preferences
- **Zip Export**: Bundle split PDFs and metadata for easy download

## License & Dependencies
- MIT License for AutoPDF Orchestrator
- All dependencies must be compatible with MIT or more permissive licenses
- Minimize dependencies; prefer well-maintained, actively developed packages
