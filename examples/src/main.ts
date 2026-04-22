import { createApp } from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import App from './App.vue'
import '@einhasad-vue/datatable-vue/grid-default-styles.css'
import '@einhasad-vue/datatable-vue/themes/classic.css'
import '@einhasad-vue/datatable-vue/themes/material.css'
import './themes/classic.css'
import './themes/material.css'
import './style.css'

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('../../src/mocks/browser')
    return worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js'
      },
      onUnhandledRequest: 'bypass'
    })
  }
  return Promise.resolve()
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: App
    }
  ]
})

prepare().then(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
