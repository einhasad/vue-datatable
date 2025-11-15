/**
 * Basic Example - Living Documentation
 *
 * This file serves as both:
 * 1. A unit test to ensure the code works
 * 2. The source of truth for the example shown in the documentation
 *
 * Pattern: Living Documentation
 * References:
 * - "Living Documentation" by Cyrille Martraire
 * - "Specification by Example" pattern
 */

import { ArrayDataProvider, type Column } from '../../src'

export interface ExampleMetadata {
  title: string
  description: string
  setupCode: () => {
    provider: ArrayDataProvider<any>
    columns: Column<any>[]
  }
}

// BEGIN EXAMPLE CODE
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' }
]

const provider = new ArrayDataProvider({
  items: users,
  pagination: false,
  paginationMode: 'cursor'
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]
// END EXAMPLE CODE

export const basicExample: ExampleMetadata = {
  title: 'Basic Example',
  description: 'This example demonstrates the most basic usage of Grid Vue with an ArrayDataProvider. The grid displays static data without pagination, showing how simple it is to get started.',
  setupCode: () => ({ provider, columns })
}

// Export for use in tests
export { users, provider, columns }
