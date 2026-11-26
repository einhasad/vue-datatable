import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import '../src/grid-default-styles.css'
import './design-system.css'
import './style.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: App
    }
  ]
})

async function prepare(): Promise<unknown> {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('../src/mocks/browser')
      return worker.start({
        serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
        onUnhandledRequest: 'bypass'
      })
    } catch {
      return Promise.resolve()
    }
  }
  return Promise.resolve()
}

void prepare().then(async () => {
  const app = createApp(App)
  app.use(router)
  await router.isReady()
  app.mount('#app')
})
