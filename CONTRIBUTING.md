# Contributing to AutoPDF Orchestrator

Thank you for your interest in contributing to AutoPDF Orchestrator! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run build
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type; use `unknown` if necessary
- Use JSDoc comments for public functions

### React Components

- Use functional components with hooks
- Keep components focused and single-responsibility
- Extract complex logic into custom hooks
- Use proper TypeScript interfaces for props

Example:
```tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return <div>{title}</div>;
};
```

### File Naming

- Components: PascalCase (e.g., `PDFUploader.tsx`, `PageViewer.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `usePDFParser.ts`)
- Services/Utils: camelCase (e.g., `pdfService.ts`, `formatters.ts`)
- Types: PascalCase (e.g., `PDFDocument.ts`, `ExportOptions.ts`)

### Styling

- Use Tailwind CSS utility classes
- Follow dark theme conventions (halloween colors)
- Maintain WCAG AA accessibility standards
- Ensure responsive design (mobile-first approach)

### Code Organization

```
src/
├── components/     # Reusable UI components
├── services/       # Business logic and API calls
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
├── styles/         # Global styles
└── constants/      # App-wide constants
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

- `feat: Add thumbnail lazy loading`
- `fix: Resolve zoom rendering issue`
- `docs: Update README with new features`
- `style: Format code with Prettier`
- `refactor: Extract PDF service functions`
- `test: Add unit tests for pdfService`
- `chore: Update dependencies`

## Testing Guidelines

- Test your changes thoroughly before submitting
- Ensure all features work across browsers (Chrome, Firefox, Safari, Edge)
- Test responsive design on multiple viewport sizes
- Verify keyboard navigation and accessibility

## Pull Request Process

1. **Update Documentation**: If you're adding features, update the README
2. **Test Thoroughly**: Ensure your changes don't break existing functionality
3. **Keep PRs Focused**: One feature/fix per PR
4. **Describe Changes**: Provide clear description of what and why
5. **Link Issues**: Reference related issues in your PR description
6. **Be Responsive**: Address review feedback promptly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari/Edge
- [ ] Tested responsive design
- [ ] Tested keyboard navigation

## Screenshots (if applicable)
Add screenshots here
```

## Feature Requests

- Check existing issues first
- Use issue templates
- Provide detailed description and use cases
- Be open to discussion and feedback

## Bug Reports

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Screenshots or error messages (if applicable)

## Project Priorities

1. **Privacy & Security**: Client-side processing only
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Performance**: Fast, responsive UI
4. **User Experience**: Intuitive, error-tolerant
5. **Code Quality**: Clean, maintainable, well-documented

## Questions?

Feel free to open an issue for questions or join discussions in existing issues.

Thank you for contributing! 🎃
