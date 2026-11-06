# AutoPDF Orchestrator: Code Conventions

## File Structure
```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components (Button, Modal, etc.)
│   ├── features/       # Feature-specific components
│   └── layout/         # Page layout components
├── hooks/              # Custom React hooks
├── services/           # Business logic (PDF processing, API calls)
├── utils/              # Utility functions and helpers
├── types/              # TypeScript type definitions and interfaces
├── styles/             # Global styles and Tailwind config
├── constants/          # App constants and configuration
└── App.tsx             # Root component
```

## Naming Conventions
- **Components**: PascalCase (e.g., `PDFUploader.tsx`, `PagePreview.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePDFParser.ts`)
- **Services/Utils**: camelCase (e.g., `pdfExtractor.ts`, `formatters.ts`)
- **Types**: PascalCase (e.g., `PDFDocument.ts`, `ExportOptions.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `SUPPORTED_FORMATS`)

## React Component Guidelines
- Use functional components with hooks
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks
- Use TypeScript interfaces for props
- Separate container and presentational logic when appropriate

### Example Component Template
```tsx
import React from 'react';
import { ComponentProps } from '@/types';

interface Props {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onAction }) => {
  return <div>{title}</div>;
};
```

## Type Safety
- Always define props with TypeScript interfaces
- Use proper types for API responses and state
- Avoid `any` type; use `unknown` if necessary, then narrow
- Create dedicated type files in `src/types/`

## Styling Guidelines
- Use Tailwind CSS utility classes for all styling
- Avoid inline styles; use Tailwind or CSS modules when necessary
- Dark mode support: use `dark:` prefix for dark theme classes
- Halloween theme elements: Use purples, oranges, blacks, and accent colors
- Maintain consistent spacing using Tailwind's scale (4px increments)

## State Management
- Use React hooks (useState, useContext) for local/global state
- Keep state as local as possible
- Use Context API for app-wide state (theme, user settings)
- Avoid prop drilling; lift state appropriately

## Error Handling
- Always handle errors gracefully with user-friendly messages
- Use try-catch for async operations
- Log errors to console in development
- Display error boundaries for component failures
- Never expose technical error details to users

## Code Quality
- Keep functions small and focused
- Write descriptive variable and function names
- Add JSDoc comments for complex logic or public APIs
- Use ESLint for consistency
- Format code with Prettier

## Async Operations
- Use async/await for asynchronous operations
- Handle loading and error states explicitly
- Provide user feedback during long operations
- Cancel operations when components unmount

## PDF Processing Patterns
- Wrap pdf.js and pdf-lib operations in service modules
- Use Web Workers for heavy PDF processing to avoid blocking UI
- Always validate PDF files before processing
- Provide clear error messages for unsupported or corrupted files
- Test with various PDF types and versions

## Constants & Configuration
- Define all magic numbers and strings as named constants
- Store configuration in `.env` files (development only)
- Keep constants organized by domain (PDF_MAX_SIZE, UI_BREAKPOINTS, etc.)

## Git & Commits
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference feature/task numbers when applicable

## Testing (Future)
- Unit tests for utility functions and services
- Component tests for complex UI logic
- Integration tests for feature workflows
- Aim for >80% coverage on business logic
