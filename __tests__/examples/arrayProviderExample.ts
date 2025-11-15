/**
 * Array Provider Example - Living Documentation
 *
 * This file serves as both:
 * 1. A unit test to ensure the code works
 * 2. The source of truth for the example shown in the documentation
 *
 * Pattern: Living Documentation
 */

import { ArrayDataProvider, type Column } from '../../src'

export interface ExampleMetadata {
  title: string
  description: string
  features?: string[]
  setupCode: () => {
    provider: ArrayDataProvider<any>
    columns: Column<any>[]
  }
}

// BEGIN EXAMPLE CODE
const products = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 45 },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29, stock: 150 },
  { id: 3, name: 'USB-C Cable', category: 'Accessories', price: 15, stock: 200 },
  { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 399, stock: 30 },
  { id: 5, name: 'Keyboard Mechanical', category: 'Accessories', price: 129, stock: 75 },
  { id: 6, name: 'Webcam HD', category: 'Electronics', price: 79, stock: 60 },
  { id: 7, name: 'Desk Lamp', category: 'Office', price: 45, stock: 90 },
  { id: 8, name: 'Office Chair', category: 'Office', price: 299, stock: 25 },
  { id: 9, name: 'Headphones', category: 'Electronics', price: 199, stock: 40 },
  { id: 10, name: 'Tablet Stand', category: 'Accessories', price: 35, stock: 100 }
]

const provider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5
})

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price ($)', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true }
]
// END EXAMPLE CODE

export const arrayProviderExample: ExampleMetadata = {
  title: 'Array Provider Example',
  description: 'The ArrayDataProvider is perfect for working with static, in-memory data. It supports client-side pagination, sorting, and filtering without requiring a backend API. This example demonstrates its key features including page-based pagination and sorting capabilities.',
  features: [
    'Client-side pagination: No server requests needed',
    'Sorting: Click column headers to sort data',
    'In-memory processing: Fast performance for small to medium datasets',
    'Simple configuration: Just pass an array and options'
  ],
  setupCode: () => ({ provider, columns })
}

// Export for use in tests
export { products, provider, columns }
