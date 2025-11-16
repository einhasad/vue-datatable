import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import '@grid-vue/grid/styles.css'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: App
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
