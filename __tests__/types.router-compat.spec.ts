import { describe, it, expect, expectTypeOf } from 'vitest'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { flushPromises } from '@vue/test-utils'
import type { RouterLike } from '../src/types'
import { QueryParamsStateProvider } from '../src/state/QueryParamsStateProvider'
import { HashStateProvider } from '../src/state/HashStateProvider'

function createAppRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  })
}

describe('RouterLike compatibility with vue-router', () => {
  it('accepts a vue-router Router without a cast', () => {
    const router = createAppRouter()
    const routerLike: RouterLike = router

    expectTypeOf<Router>().toMatchTypeOf<RouterLike>()
    expect(routerLike).toBe(router)
  })

  it('passes the TypeScript compiler in strict mode', () => {
    const file = fileURLToPath(import.meta.url)
    const program = ts.createProgram([file], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowImportingTsExtensions: true,
      esModuleInterop: true,
      types: ['node'],
    })
    const diagnostics = ts.getPreEmitDiagnostics(program, program.getSourceFile(file))
      .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'))

    expect(diagnostics).toEqual([])
  }, 30000)

  it('drives both URL state providers from the same Router', async () => {
    const router = createAppRouter()
    await router.push('/?qp-name&qp-sort=-email#hash-role=Admin')
    const query = new QueryParamsStateProvider({ router, prefix: 'qp' })
    const hash = new HashStateProvider({ router, prefix: 'hash' })

    expect(query.getAllFilters()).toEqual({})
    expect(query.getSort()).toEqual({ field: 'email', order: 'desc' })
    expect(hash.getFilter('role')).toBe('Admin')

    query.setFilter('name', 'Eve')
    hash.setSort('id', 'asc')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/?qp-name=Eve&qp-sort=-email#hash-role=Admin&hash-sort=id')
  })
})
