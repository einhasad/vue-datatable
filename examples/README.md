# Grid Vue Examples

This directory contains interactive examples and demos for the Grid Vue library.

## Live Demo

View the live examples at: **https://einhasad.github.io/vue-datatable/**

## Running Locally

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

### Setup

1. Install root dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Build the library:
   ```bash
   npm run build
   ```

3. Navigate to the examples directory:
   ```bash
   cd examples
   ```

4. Install example dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To build the examples for production:

```bash
cd examples
npm run build
```

The built files will be in the `examples/dist` directory.

## Examples Included

- **Basic Usage** - Simple grid with minimal configuration
- **Page Pagination** - Traditional page-based pagination (1, 2, 3...)
- **Cursor Pagination** - Load more / infinite scroll pattern
- **Sorting** - Sortable columns with asc/desc order
- **Custom Columns** - Custom cell rendering with components
- **Row Actions** - Interactive rows with click handlers

## Note for Package Users

This examples directory is **not included** in the published npm package. It's only available in the source repository for development and demonstration purposes.

When you install `@grid-vue/grid` via npm, you'll only get the compiled library files in the `dist` directory, keeping your `node_modules` clean and lightweight.
