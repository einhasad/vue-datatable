import { useRouter } from 'vue-router'
import { ArrayDataProvider, QueryParamsStateProvider } from '@grid-vue/grid'

const router = useRouter()

const stateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'qp' // query params will be: ?qp-sort=name
})

const provider = new ArrayDataProvider({
  items: users,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider
})
