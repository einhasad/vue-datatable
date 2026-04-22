import { ArrayDataProvider, InMemoryStateProvider } from '@einhasad-vue/datatable-vue'

const stateProvider = new InMemoryStateProvider()

const provider = new ArrayDataProvider({
  items: users,
  stateProvider
})
provider.setOffsetPagination({ page: 1, pageSize: 5 })
