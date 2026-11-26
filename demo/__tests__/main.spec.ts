import { describe, it, expect, vi, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

interface RouteAtMount {
  matched: number
  query: Record<string, unknown>
}

const routesAtMount = vi.hoisted(() => [] as RouteAtMount[])

vi.mock('../App.vue', () => ({
  default: defineComponent({
    setup() {
      const route = useRouter().currentRoute.value
      routesAtMount.push({ matched: route.matched.length, query: { ...route.query } })
      return () => null
    }
  })
}))

describe('demo entry', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('mounts with the initial route resolved under the GitHub Pages base', async () => {
    vi.stubEnv('BASE_URL', '/vue-datatable/')
    vi.stubEnv('DEV', false)
    window.history.replaceState({}, '', '/vue-datatable/?qp-name=Eve&qp-sort=-email')
    document.body.innerHTML = '<div id="app"></div>'

    await import('../main')

    await vi.waitFor(() => expect(routesAtMount).toHaveLength(1))
    expect(routesAtMount[0]).toEqual({
      matched: 1,
      query: { 'qp-name': 'Eve', 'qp-sort': '-email' }
    })
  })
})
