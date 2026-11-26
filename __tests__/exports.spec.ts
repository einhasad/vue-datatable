import { describe, it, expect } from 'vitest'
import * as lib from '../src/index'

const runtimeExports = [
  'ArrayDataProvider',
  'CallbackDataProvider',
  'DefaultElasticResponseAdapter',
  'DynamicComponent',
  'ElasticSearchDataProvider',
  'Grid',
  'GridColumnHeader',
  'GridSearch',
  'GridTable',
  'HashStateProvider',
  'InMemoryRowStateProvider',
  'InMemoryStateProvider',
  'LocalStorageStateProvider',
  'PagePagination',
  'QueryParamsStateProvider',
  'ResetButton',
  'ScrollPagination',
  'buildAttributes',
  'getCellComponent',
  'getCellOptions',
  'getCellValue',
  'getColumnLabel',
  'getFooterContent',
  'getFooterOptions',
  'getRowOptions',
  'mergeClasses',
  'normalizeStyle',
  'provideGridDataProvider',
  'provideGridState',
  'rowStateInjectionKey',
  'shouldShowCell',
  'shouldShowColumn',
  'useFilterField',
  'useGridDataProvider',
  'useGridState',
  'useRowState'
]

describe('public runtime exports', () => {
  it.each(runtimeExports)('%s is exported and defined', name => {
    expect(lib).toHaveProperty(name)
    expect((lib as Record<string, unknown>)[name]).toBeDefined()
  })

  it('exports exactly the documented runtime API', () => {
    expect(Object.keys(lib).sort()).toEqual([...runtimeExports].sort())
  })

  it('every runtime export is defined', () => {
    const undefinedExports = Object.entries(lib)
      .filter(([, value]) => value === undefined)
      .map(([name]) => name)
    expect(undefinedExports).toEqual([])
  })

  it('DefaultElasticResponseAdapter can be instantiated', () => {
    const adapter = new lib.DefaultElasticResponseAdapter()
    expect(adapter).toBeInstanceOf(lib.DefaultElasticResponseAdapter)
  })
})
