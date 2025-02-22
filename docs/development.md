# Development Guide

## Environment Setup

1. Install Node.js (v18+ recommended)
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```env
   SUPABASE_PROJECT_ID=your_project_id
   ```

## Development Workflow

### Local Development

```bash
npm run dev
```

### Type Checking

```bash
# Generate Supabase types
npm run types:supabase

# Run TypeScript compiler
tsc
```

### Storybook

```bash
npm run storybook
```

## Code Quality

- ESLint is configured for TypeScript and React
- Prettier for code formatting
- TypeScript for type safety

## Building for Production

```bash
npm run build
```

## Performance Considerations

- Use Draco compression for 3D models
- Implement lazy loading for heavy components
- Optimize model textures and materials