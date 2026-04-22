import { useRouter } from 'vue-router'
import { ArrayDataProvider, QueryParamsStateProvider } from '@einhasad-vue/datatable-vue'

const router = useRouter()

// First grid: Array provider with "products" prefix
const productsStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'products'
})

const productsProvider = new ArrayDataProvider({
  items: products,
  stateProvider: productsStateProvider
})
productsProvider.setOffsetPagination({ page: 1, pageSize: 5 })

// Second grid: Array provider with "users" prefix
const usersStateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'users'
})

const usersProvider = new ArrayDataProvider({
  items: users,
  stateProvider: usersStateProvider
})
usersProvider.setOffsetPagination({ page: 1, pageSize: 5 })

// URL will contain both: ?products-sort=name&products-page=2&users-sort=email&users-page=1
