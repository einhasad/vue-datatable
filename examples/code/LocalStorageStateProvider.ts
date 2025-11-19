import { ArrayDataProvider, LocalStorageStateProvider } from '@grid-vue/grid'

const stateProvider = new LocalStorageStateProvider({
  storageKey: 'my-grid-state' // default: 'grid-state'
})

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})
