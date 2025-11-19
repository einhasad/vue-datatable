import { ArrayDataProvider, InMemoryStateProvider } from '@grid-vue/grid'

const stateProvider = new InMemoryStateProvider()

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})
