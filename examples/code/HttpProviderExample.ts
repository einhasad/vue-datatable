import { ArrayDataProvider } from '@einhasad-vue/datatable-vue'

// Use ArrayDataProvider for client-side filtering and sorting over API data
const provider = new ArrayDataProvider({
  items: [] // initially empty, populated after API call
})

// After fetching data from API:
// const response = await fetch('/api/search/repositories?q=vue+table')
// const data = await response.json()
// provider.setAllItems(data.items)

// Configure offset pagination
provider.setOffsetPagination({ page: 1, pageSize: 20 })

// Get pagination info
const pagination = provider.getOffsetPagination()
// → { page: 1, pageSize: 20, totalItems: 100, totalPages: 5 }

// Navigate to next page
provider.setOffsetPagination({ page: 2, pageSize: 20 })
// provider.getCurrentItems() returns items for page 2
