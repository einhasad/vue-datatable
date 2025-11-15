# Living Documentation Pattern

This project implements the **Living Documentation** pattern to ensure code examples are always correct, tested, and in sync with the actual codebase.

## The Problem

Traditional documentation suffers from:
- **Code duplication** between tests and examples
- **Stale examples** that don't reflect current API
- **Untested code** in documentation that may not work
- **Manual synchronization** between tests and docs

## Our Solution

We use a **Single Source of Truth** approach inspired by:

1. **Living Documentation** (Cyrille Martraire) - Documentation generated from tests
2. **Specification by Example** (Concordion) - Examples that are also tests
3. **Literate Programming** (Donald Knuth) - Code extraction from documentation
4. **Storybook Component Testing** - Stories that double as tests
5. **Python's doctest** - Executable documentation examples

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  1. Example Definitions (Single Source of Truth)        │
│     __tests__/examples/basicExample.ts                  │
│     - Exports working code                              │
│     - Includes metadata (title, description)            │
│     - Has unit tests                                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  2. Unit Tests Verify Code Works                        │
│     __tests__/examples.living-doc.spec.ts               │
│     - Tests each example definition                     │
│     - Ensures providers work correctly                  │
│     - Validates data structures                         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  3. Code Extraction Script                              │
│     scripts/extract-examples.ts                         │
│     - Reads example files                               │
│     - Extracts code between markers                     │
│     - Generates extracted-examples.json                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  4. Vue Components Import Working Code                  │
│     examples/src/pages/BasicExample.new.vue             │
│     - Imports example definition (working code)         │
│     - Imports extracted code (for display)              │
│     - Shows "Living Documentation" badge                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  5. E2E Tests Verify Examples Work in Browser           │
│     e2e/examples.spec.ts                                │
│     - Tests with Playwright                             │
│     - Verifies rendering across browsers                │
│     - Ensures interactivity works                       │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
vue-datatable/
├── __tests__/
│   ├── examples/                    # ⭐ SINGLE SOURCE OF TRUTH
│   │   ├── basicExample.ts          # Example definition + working code
│   │   ├── arrayProviderExample.ts  # Another example
│   │   └── index.ts                 # Export all examples
│   └── examples.living-doc.spec.ts  # Unit tests for examples
│
├── scripts/
│   └── extract-examples.ts          # Extracts code from tests
│
├── examples/
│   └── src/
│       ├── generated/
│       │   └── extracted-examples.json  # Generated code snippets
│       └── pages/
│           ├── BasicExample.new.vue     # Uses extracted code
│           └── ArrayProviderExample.new.vue
│
├── e2e/
│   └── examples.spec.ts             # E2E tests with Playwright
│
└── .github/
    └── workflows/
        └── test.yml                 # CI pipeline
```

## Usage

### 1. Create a New Example

Create a new file in `__tests__/examples/`:

```typescript
// __tests__/examples/myExample.ts
import { ArrayDataProvider, type Column } from '../../src'

// BEGIN EXAMPLE CODE
const data = [
  { id: 1, name: 'Example' }
]

const provider = new ArrayDataProvider({
  items: data,
  pagination: false
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' }
]
// END EXAMPLE CODE

export const myExample = {
  title: 'My Example',
  description: 'Description here',
  setupCode: () => ({ provider, columns })
}

export { data, provider, columns }
```

### 2. Add Unit Tests

Update `__tests__/examples.living-doc.spec.ts`:

```typescript
import { myExample } from './examples/myExample'

describe('My Example', () => {
  it('should create working provider', () => {
    const { provider, columns } = myExample.setupCode()
    expect(provider).toBeDefined()
  })
})
```

### 3. Extract Code

```bash
npm run extract:examples
```

This generates `examples/src/generated/extracted-examples.json`.

### 4. Create Vue Component

```vue
<template>
  <Grid :data-provider="provider" :columns="columns" />
</template>

<script setup>
import { myExample } from '../../../__tests__/examples/myExample'
import extractedExamples from '../generated/extracted-examples.json'

const { provider, columns } = myExample.setupCode()
const extractedCode = extractedExamples.myExample
</script>
```

### 5. Add E2E Tests

Update `e2e/examples.spec.ts`:

```typescript
test('My Example should render', async ({ page }) => {
  await page.goto('/')
  await page.click('text=My Example')
  await expect(page.locator('[data-qa="grid"]')).toBeVisible()
})
```

## Development Workflow

```bash
# Install dependencies
npm install

# Run unit tests (including living doc tests)
npm run test:unit

# Extract examples from tests
npm run extract:examples

# Run examples in dev mode
npm run examples:dev

# Run e2e tests
npm run test:e2e

# Run all tests
npm run test:all
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/test.yml`) ensures:

1. ✅ **Unit tests pass** - Examples work in isolation
2. ✅ **Examples extracted** - Code snippets generated from tests
3. ✅ **E2E tests pass** - Examples work in real browsers (Chrome, Firefox, Safari)
4. ✅ **No duplication** - Verifies single source of truth pattern
5. ✅ **Cross-browser** - Tests run on multiple browsers

## Benefits

### ✅ Guaranteed Accuracy
- Examples are extracted from **tested code**
- If tests pass, examples work

### ✅ No Duplication
- Code lives in **one place** (`__tests__/examples/`)
- Documentation imports the working code

### ✅ Always Up-to-Date
- Tests fail if examples break
- CI enforces synchronization

### ✅ Better DX
- Developers write examples once
- Tests and docs stay in sync automatically

### ✅ User Confidence
- "Living Documentation" badge shown on each example
- Users know the code actually works

## References

This pattern is based on industry best practices:

1. **Living Documentation** by Cyrille Martraire
   https://leanpub.com/livingdocumentation

2. **Specification by Example** (Concordion)
   https://concordion.org/

3. **Testing Code Examples in Documentation** (CloudBees)
   https://www.cloudbees.com/blog/testing-code-examples-in-documentation

4. **Storybook Component Testing**
   https://storybook.js.org/docs/writing-tests/component-testing

5. **Literate Programming**
   https://en.wikipedia.org/wiki/Literate_programming

## Troubleshooting

### Example not extracted

Ensure your example file has `BEGIN EXAMPLE CODE` and `END EXAMPLE CODE` markers:

```typescript
// BEGIN EXAMPLE CODE
const myCode = 'here'
// END EXAMPLE CODE
```

### Tests failing

1. Check unit tests: `npm run test:unit`
2. Check e2e tests: `npm run test:e2e:ui`
3. Verify extraction: `npm run extract:examples`

### CI failing

Check the GitHub Actions logs:
- Unit tests must pass first
- Examples must extract successfully
- E2E tests run last

## Contributing

When adding new examples:

1. ✅ Create example in `__tests__/examples/`
2. ✅ Add unit tests
3. ✅ Extract code: `npm run extract:examples`
4. ✅ Create Vue component
5. ✅ Add e2e test
6. ✅ Run `npm run test:all`
7. ✅ Commit and push

The CI will verify everything works! 🎉
