import { useRouter } from 'vue-router'
import { ArrayDataProvider, QueryParamsStateProvider } from '@einhasad-vue/datatable-vue'

const router = useRouter()

const stateProvider = new QueryParamsStateProvider({
  router,
  prefix: 'qp' // query params will be: ?qp-sort=name
})

const provider = new ArrayDataProvider({
  items: users,
  stateProvider
})
provider.setOffsetPagination({ page: 1, pageSize: 5 })
