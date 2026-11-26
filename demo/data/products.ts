export interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  stock: number
  sku: string
}

export interface ProductQuery {
  search: string
  sortField?: string
  sortOrder: 'asc' | 'desc' | null
}

export interface ProductCatalog {
  size: number
  query: (query: ProductQuery) => Product[]
}

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Beauty', 'Automotive']
const ADJECTIVES = ['Premium', 'Professional', 'Essential', 'Ultimate', 'Classic', 'Modern', 'Smart', 'Portable']
const NOUNS = ['Widget', 'Gadget', 'Device', 'Tool', 'Kit', 'Set', 'Pack', 'Bundle']
const SORTABLE_FIELDS = new Set<keyof Product>(['id', 'name', 'category', 'price', 'rating', 'stock'])

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function generateProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1
    return {
      id,
      name: `${ADJECTIVES[i % ADJECTIVES.length]} ${NOUNS[Math.floor(i / ADJECTIVES.length) % NOUNS.length]} ${id}`,
      category: CATEGORIES[i % CATEGORIES.length],
      price: Math.round((pseudoRandom(id) * 500 + 10) * 100) / 100,
      rating: Math.round((pseudoRandom(id + count) * 2 + 3) * 10) / 10,
      stock: Math.floor(pseudoRandom(id + 2 * count) * 1000),
      sku: `SKU-${String(id).padStart(6, '0')}`,
    }
  })
}

function isSortableField(field: string | undefined): field is keyof Product {
  return field !== undefined && SORTABLE_FIELDS.has(field as keyof Product)
}

function search(products: Product[], term: string): Product[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return products
  return products.filter((product) =>
    product.name.toLowerCase().includes(needle) ||
    product.category.toLowerCase().includes(needle) ||
    product.sku.toLowerCase().includes(needle)
  )
}

function sort(products: Product[], field: string | undefined, order: 'asc' | 'desc' | null): Product[] {
  if (!isSortableField(field) || !order) return products
  const direction = order === 'asc' ? 1 : -1
  return [...products].sort((a, b) => {
    if (a[field] === b[field]) return a.id - b.id
    return (a[field] < b[field] ? -1 : 1) * direction
  })
}

export function createProductCatalog(count: number): ProductCatalog {
  const products = generateProducts(count)
  let lastKey: string | null = null
  let lastResult: Product[] = products

  return {
    size: count,
    query: ({ search: term, sortField, sortOrder }) => {
      const key = JSON.stringify([term, sortField, sortOrder])
      if (key !== lastKey) {
        lastKey = key
        lastResult = sort(search(products, term), sortField, sortOrder)
      }
      return lastResult
    },
  }
}
