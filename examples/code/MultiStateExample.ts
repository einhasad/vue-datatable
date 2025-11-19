import { useRouter } from 'vue-router'
import { ArrayDataProvider, HttpDataProvider, QueryParamsStateProvider } from '@grid-vue/grid'

const router = useRouter()

// First grid: Array provider with "products" prefix
const productsStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'products'
})

const productsProvider = new ArrayDataProvider({
  items: products,
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: productsStateProvider
})

// Second grid: HTTP provider with "users" prefix
const usersStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'users'
})

const usersProvider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 5,
  stateProvider: usersStateProvider,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter
})

// URL will contain both: ?products-sort=name&products-page=2&users-sort=email&users-page=1
