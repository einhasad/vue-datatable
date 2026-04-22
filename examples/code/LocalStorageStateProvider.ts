import { ArrayDataProvider, LocalStorageStateProvider } from '@einhasad-vue/datatable-vue'

const stateProvider = new LocalStorageStateProvider({
  storageKey: 'my-grid-state' // default: 'grid-state'
})

const provider = new ArrayDataProvider({
  items: users,
  stateProvider
})
provider.setOffsetPagination({ page: 1, pageSize: 5 })
