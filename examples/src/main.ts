import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import '@grid-vue/grid/styles.css'
import './style.css'

// Create a simple router for URL state management
const router = createRouter({
  history: createWebHistory('/vue-datatable/'),
  routes: [
    { path: '/', component: App }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
