import { useRouter } from 'vue-router'
import { ArrayDataProvider, HashStateProvider } from '@grid-vue/grid'

const router = useRouter()

const stateProvider = new HashStateProvider({
  router,
  prefix: 'hash' // hash will be: #hash-sort=name
})

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})
