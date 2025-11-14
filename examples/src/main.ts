import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import '@grid-vue/grid/styles.css'
import './style.css'

// Import example pages
import Home from './pages/Home.vue'
import BasicExample from './pages/BasicExample.vue'
import PagePaginationExample from './pages/PagePaginationExample.vue'
import CursorPaginationExample from './pages/CursorPaginationExample.vue'
import SortingExample from './pages/SortingExample.vue'
import CustomColumnsExample from './pages/CustomColumnsExample.vue'
import RowActionsExample from './pages/RowActionsExample.vue'

const router = createRouter({
  history: createWebHistory('/vue-datatable/'),
  routes: [
    { path: '/', component: Home },
    { path: '/basic', component: BasicExample },
    { path: '/page-pagination', component: PagePaginationExample },
    { path: '/cursor-pagination', component: CursorPaginationExample },
    { path: '/sorting', component: SortingExample },
    { path: '/custom-columns', component: CustomColumnsExample },
    { path: '/row-actions', component: RowActionsExample }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
