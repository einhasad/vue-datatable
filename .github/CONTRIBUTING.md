# Contributing to datatable-vue

Thank you for your interest in contributing to datatable-vue! 🎉

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/datatable-vue.git
   cd datatable-vue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test your changes locally**
   ```bash
   # Create a test Vue app
   npm create vue@latest my-test-app
   cd my-test-app
   npm install

   # Link your local datatable-vue
   npm link /path/to/datatable-vue
   ```

## Project Structure

```
datatable-vue/
├── index.ts              # Main entry point
├── types.ts              # TypeScript type definitions
├── utils.ts              # Utility functions
├── styles.css            # Component styles
├── Grid.vue              # Main Grid component
├── GridTable.vue         # Table sub-component
├── GridPagination.vue    # Pagination sub-component
├── DynamicComponent.vue  # Dynamic component renderer
└── providers/            # Data provider implementations
    ├── DataProvider.ts   # Base interface
    ├── HttpDataProvider.ts
    └── ArrayDataProvider.ts
```

## Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update TypeScript types as needed

3. **Build and test**
   ```bash
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvements
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

- **No console.log** - Remove all debug logs before committing
- **TypeScript** - All code must be properly typed
- **Vue 3 Composition API** - Use `<script setup>` syntax
- **Comments** - Add JSDoc comments for public APIs
- **Naming** - Use clear, descriptive names
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

## Pull Request Guidelines

- **Title**: Use conventional commit format
- **Description**: Clearly explain what and why
- **Tests**: Ensure the build passes
- **Documentation**: Update README if needed
- **Breaking Changes**: Clearly mark and explain

## Reporting Issues

When reporting bugs, please include:
- Vue version
- Browser and OS
- Minimal reproduction code
- Expected vs actual behavior
- Screenshots (if applicable)

## Questions?

Feel free to open an issue for questions or join discussions in GitHub Discussions.

Thank you for contributing! 🙏
