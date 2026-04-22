import { useRouter } from 'vue-router'
import { ArrayDataProvider, HashStateProvider } from '@einhasad-vue/datatable-vue'

const router = useRouter()

const stateProvider = new HashStateProvider({
  router,
  prefix: 'hash' // hash will be: #hash-sort=name
})

const provider = new ArrayDataProvider({
  items: users,
  stateProvider
})
provider.setOffsetPagination({ page: 1, pageSize: 5 })
