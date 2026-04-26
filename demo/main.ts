import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import '../src/grid-default-styles.css'
import './design-system.css'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: App
    }
  ]
})

async function prepare() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('../src/mocks/browser')
      return worker.start({
        serviceWorker: { url: '/mockServiceWorker.js' },
        onUnhandledRequest: 'bypass'
      })
    } catch {
      return Promise.resolve()
    }
  }
  return Promise.resolve()
}

prepare().then(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
