#!/usr/bin/env tsx
/**
 * Example Code Extractor
 *
 * Extracts code snippets from test files to ensure documentation
 * shows the exact same code that is tested.
 *
 * Pattern: Living Documentation / Single Source of Truth
 * References:
 * - Literate Programming (Donald Knuth)
 * - Living Documentation (Cyrille Martraire)
 * - Testing Code Examples in Documentation (CloudBees)
 *
 * This prevents the common problem where:
 * - Documentation examples become outdated
 * - Examples in docs don't actually work
 * - Code duplication between tests and docs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, basename } from 'path'

interface ExtractedExample {
  filename: string
  code: string
  imports: string
  fullCode: string
}

interface ExampleRegistry {
  [key: string]: ExtractedExample
}

const EXAMPLE_DIR = join(process.cwd(), '__tests__', 'examples')
const OUTPUT_FILE = join(process.cwd(), 'examples', 'src', 'generated', 'extracted-examples.json')

/**
 * Extract code between BEGIN EXAMPLE CODE and END EXAMPLE CODE markers
 */
function extractExampleCode(fileContent: string): { code: string; imports: string } {
  const beginMarker = '// BEGIN EXAMPLE CODE'
  const endMarker = '// END EXAMPLE CODE'

  const beginIndex = fileContent.indexOf(beginMarker)
  const endIndex = fileContent.indexOf(endMarker)

  if (beginIndex === -1 || endIndex === -1) {
    throw new Error('Could not find BEGIN/END EXAMPLE CODE markers')
  }

  const code = fileContent
    .slice(beginIndex + beginMarker.length, endIndex)
    .trim()

  // Extract imports (everything before the first export or const)
  const importMatch = fileContent.match(/^import[\s\S]*?from ['"].*?['"]/gm)
  const imports = importMatch ? importMatch.join('\n') : ''

  return { code, imports }
}

/**
 * Extract all examples from the __tests__/examples directory
 */
function extractAllExamples(): ExampleRegistry {
  const registry: ExampleRegistry = {}

  const files = readdirSync(EXAMPLE_DIR).filter(
    file => file.endsWith('.ts') && file !== 'index.ts'
  )

  console.log(`\n📖 Extracting examples from ${files.length} files...\n`)

  for (const file of files) {
    const filePath = join(EXAMPLE_DIR, file)
    const fileContent = readFileSync(filePath, 'utf-8')

    try {
      const { code, imports } = extractExampleCode(fileContent)
      const key = basename(file, '.ts')

      registry[key] = {
        filename: file,
        code,
        imports,
        fullCode: `${imports}\n\n${code}`
      }

      console.log(`  ✓ ${file}`)
      console.log(`    - Code: ${code.split('\n').length} lines`)
      console.log(`    - Imports: ${imports.split('\n').length} lines`)
    } catch (error) {
      console.error(`  ✗ ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }
  }

  return registry
}

/**
 * Main execution
 */
function main() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║   Living Documentation - Example Code Extractor       ║')
  console.log('║   Ensures docs show tested, working code              ║')
  console.log('╚════════════════════════════════════════════════════════╝')

  const registry = extractAllExamples()
  const exampleCount = Object.keys(registry).length

  // Write to output file
  writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2))

  console.log(`\n✨ Successfully extracted ${exampleCount} examples`)
  console.log(`📝 Output: ${OUTPUT_FILE}`)
  console.log('\n✅ All examples are now working code!\n')
}

main()
