import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  getCellValue,
  getColumnLabel,
  mergeClasses,
  normalizeStyle,
  buildAttributes,
  getCellOptions,
  getRowOptions,
  getFooterContent,
  getFooterOptions
} from '../src/utils'
import type { Column, SortState } from '../src/types'

// ─── Custom Arbitraries ─────────────────────────────────────────────────────

// Safe string keys that avoid Object.prototype properties (valueOf, toString, etc.)
const fcSafeKey = fc.string({ minLength: 1, maxLength: 20 }).filter(
  s => !['valueOf', 'toString', 'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', '__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'toLocaleString'].includes(s)
)

const fcSortState = fc.record({
  field: fc.string({ minLength: 1 }),
  order: fc.constantFrom<'asc' | 'desc'>('asc', 'desc')
})

const fcStringOrUndefined = fc.oneof(fc.string(), fc.constant(undefined))

const fcClassInput = fc.oneof(
  fc.string(),
  fc.array(fc.string()),
  fc.dictionary(fc.string(), fc.boolean()),
  fc.constant(undefined)
)

const fcStyleInput = fc.oneof(
  fc.string(),
  fc.dictionary(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })),
  fc.constant(undefined)
)

// ─── mergeClasses ───────────────────────────────────────────────────────────

describe('mergeClasses (property-based)', () => {
  it('always returns a string', () => {
    fc.assert(
      fc.property(fc.array(fcClassInput), (inputs) => {
        const result = mergeClasses(...inputs)
        expect(typeof result).toBe('string')
      })
    )
  })

  it('is commutative: order of string arguments does not matter for the set of classes', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 20 }),
        fc.string({ maxLength: 20 }),
        (a, b) => {
          const r1 = mergeClasses(a, b).split(' ').sort()
          const r2 = mergeClasses(b, a).split(' ').sort()
          expect(r1).toEqual(r2)
        }
      )
    )
  })

  it('never contains undefined or null in output', () => {
    fc.assert(
      fc.property(fc.array(fcClassInput), (inputs) => {
        const result = mergeClasses(...inputs)
        expect(result).not.toContain('undefined')
        expect(result).not.toContain('null')
      })
    )
  })

  it('object keys with falsy values are never in the output', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes(' ')), fc.boolean()),
        (obj) => {
          const result = mergeClasses(obj)
          const resultTokens = result.split(' ')
          for (const [key, val] of Object.entries(obj)) {
            if (!val) {
              expect(resultTokens).not.toContain(key)
            }
          }
        }
      )
    )
  })

  it('produces identical output when called with the same arguments twice', () => {
    fc.assert(
      fc.property(fc.array(fcClassInput), (inputs) => {
        expect(mergeClasses(...inputs)).toBe(mergeClasses(...inputs))
      })
    )
  })

  it('spreading an array is equivalent to passing individual elements (non-empty strings)', () => {
    fc.assert(
      fc.property(fc.array(fc.string({ minLength: 1 })), (arr) => {
        expect(mergeClasses(arr)).toBe(mergeClasses(...arr))
      })
    )
  })

  it('empty inputs produce empty string', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(fc.constant(undefined), fc.constant(''), fc.constant([] as string[]), fc.constant({} as Record<string, boolean>))),
        (inputs) => {
          const result = mergeClasses(...inputs)
          // Empty string, empty array, empty object, and undefined all produce ''
          expect(result).toBe('')
        }
      )
    )
  })
})

// ─── normalizeStyle ─────────────────────────────────────────────────────────

describe('normalizeStyle (property-based)', () => {
  it('always returns a string', () => {
    fc.assert(
      fc.property(fcStyleInput, (style) => {
        const result = normalizeStyle(style)
        expect(typeof result).toBe('string')
      })
    )
  })

  it('string input is returned as-is', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (s) => {
        expect(normalizeStyle(s)).toBe(s)
      })
    )
  })

  it('undefined returns empty string', () => {
    expect(normalizeStyle(undefined)).toBe('')
  })

  it('empty string returns empty string', () => {
    expect(normalizeStyle('')).toBe('')
  })

  it('object output contains every key-value pair as "key: value"', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes(':')), fc.string({ minLength: 1, maxLength: 20 })),
        (obj) => {
          const result = normalizeStyle(obj)
          for (const [key, value] of Object.entries(obj)) {
            expect(result).toContain(`${key}: ${value}`)
          }
        }
      )
    )
  })

  it('entries in object output are separated by "; "', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes(':') && !s.includes(';')),
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes(';'))
        ).filter(obj => Object.keys(obj).length >= 2),
        (obj) => {
          const result = normalizeStyle(obj)
          expect(result).toContain('; ')
        }
      )
    )
  })

  it('empty object returns empty string', () => {
    expect(normalizeStyle({})).toBe('')
  })
})

// ─── buildAttributes ────────────────────────────────────────────────────────

describe('buildAttributes (property-based)', () => {
  it('non-special keys pass through unchanged', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s !== 'class' && s !== 'style'),
        fc.anything(),
        (key, value) => {
          const result = buildAttributes({ [key]: value })
          expect(result[key]).toEqual(value)
        }
      )
    )
  })

  it('"class" key is always a string in output', () => {
    fc.assert(
      fc.property(fcClassInput, (classInput) => {
        const result = buildAttributes({ class: classInput })
        expect(typeof result.class).toBe('string')
      })
    )
  })

  it('"style" key is always a string in output', () => {
    fc.assert(
      fc.property(fcStyleInput, (styleInput) => {
        const result = buildAttributes({ style: styleInput })
        expect(typeof result.style).toBe('string')
      })
    )
  })

  it('empty object returns empty object', () => {
    expect(buildAttributes({})).toEqual({})
  })

  it('preserves number of keys', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.anything(), { minLength: 1, maxLength: 5 }),
        (keys, values) => {
          fc.pre(keys.length === values.length)
          const input: Record<string, unknown> = {}
          keys.forEach((k, i) => { input[k] = values[i] })
          const result = buildAttributes(input)
          expect(Object.keys(result).length).toBe(Object.keys(input).length)
        }
      )
    )
  })
})

// ─── getCellValue ───────────────────────────────────────────────────────────

describe('getCellValue (property-based)', () => {
  it('always returns a string for any value function return type', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.double(), fc.bigInt(), fc.constant(null), fc.constant(undefined)),
        (val) => {
          const column = { value: () => val } as unknown as Column<unknown>
          const result = getCellValue(column, {}, 0)
          expect(typeof result).toBe('string')
        }
      )
    )
  })

  it('returns empty string for null or undefined models', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(null), fc.constant(undefined)),
        fc.string({ minLength: 1 }),
        (model, key) => {
          const column = { key } as Column<typeof model>
          expect(getCellValue(column, model, 0)).toBe('')
        }
      )
    )
  })

  it('for string properties, returns the property value directly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (key, value) => {
          const column = { key } as Column<Record<string, string>>
          expect(getCellValue(column, { [key]: value }, 0)).toBe(value)
        }
      )
    )
  })

  it('for number properties, returns String(property)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer(),
        (key, value) => {
          const column = { key } as Column<Record<string, number>>
          expect(getCellValue(column, { [key]: value }, 0)).toBe(String(value))
        }
      )
    )
  })

  it('column.value takes priority over column.key', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string(),
        fc.string({ minLength: 1 }),
        (valueResult, modelValue, key) => {
          const column = {
            key,
            value: () => valueResult
          } as unknown as Column<Record<string, string>>
          const model = { [key]: modelValue }
          expect(getCellValue(column, model, 0)).toBe(valueResult)
        }
      )
    )
  })

  it('column.key takes priority over column.sort', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string(),
        fc.string(),
        (key, sort, keyVal, sortVal) => {
          fc.pre(key !== sort)
          const column = { key, sort } as Column<Record<string, string>>
          const model = { [key]: keyVal, [sort]: sortVal }
          expect(getCellValue(column, model, 0)).toBe(keyVal)
        }
      )
    )
  })
})

// ─── getColumnLabel ─────────────────────────────────────────────────────────

describe('getColumnLabel (property-based)', () => {
  it('always returns a string', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({ label: fc.string() }),
          fc.record({ sort: fc.string() }),
          fc.record({ label: fc.string(), sort: fc.string() }),
          fc.record({})
        ),
        (partial) => {
          const column = partial as Column
          const result = getColumnLabel(column, [])
          expect(typeof result).toBe('string')
        }
      )
    )
  })

  it('label function receives the models array', () => {
    fc.assert(
      fc.property(fc.array(fc.integer(), { maxLength: 10 }), (models) => {
        let received: unknown
        const column = {
          label: (m: unknown[]) => { received = m; return 'ok' }
        } as unknown as Column
        getColumnLabel(column, models as unknown[])
        expect(received).toEqual(models)
      })
    )
  })
})

// ─── getCellOptions / getRowOptions / getFooterContent / getFooterOptions ──

describe('cell/row/footer option functions (property-based)', () => {
  it('getCellOptions always returns an object', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(undefined), fc.constant(() => null), fc.constant(() => undefined), fc.constant(() => ({ a: 1 }))),
        (optionsFn) => {
          const column = { options: optionsFn } as unknown as Column
          const result = getCellOptions(column, {})
          expect(typeof result).toBe('object')
          expect(result).not.toBeNull()
        }
      )
    )
  })

  it('getRowOptions always returns an object', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(() => null),
          fc.constant(() => undefined),
          fc.constant(() => ({ class: 'x' }))
        ),
        (fn) => {
          const result = getRowOptions(fn as any, {})
          expect(typeof result).toBe('object')
          expect(result).not.toBeNull()
        }
      )
    )
  })

  it('getFooterContent always returns a string', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(() => null),
          fc.constant(() => undefined),
          fc.constant(() => ''),
          fc.constant(() => 'Total: 42')
        ),
        (footerFn) => {
          const column = { footer: footerFn } as unknown as Column
          const result = getFooterContent(column, [])
          expect(typeof result).toBe('string')
        }
      )
    )
  })

  it('getFooterOptions always returns an object', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(() => null),
          fc.constant(() => undefined),
          fc.constant(() => ({ class: 'bold' }))
        ),
        (footerOptionsFn) => {
          const column = { footerOptions: footerOptionsFn } as unknown as Column
          const result = getFooterOptions(column, [])
          expect(typeof result).toBe('object')
          expect(result).not.toBeNull()
        }
      )
    )
  })
})

// ─── ArrayDataProvider sort invariants ──────────────────────────────────────

describe('ArrayDataProvider sort invariants (property-based)', () => {
  it('sorting preserves all elements (no loss, no duplication)', async () => {
    const { ArrayDataProvider } = await import('../src/providers/ArrayDataProvider')
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({ name: fc.string({ maxLength: 5 }), age: fc.integer() }), { minLength: 1, maxLength: 50 }),
        fc.constantFrom<'asc' | 'desc'>('asc', 'desc'),
        fc.string({ minLength: 1 }).filter(s => s === 'name' || s === 'age'),
        async (items, order, field) => {
          const provider = new ArrayDataProvider({ items })
          await provider.load({ sortField: field, sortOrder: order })
          const sorted = provider.getCurrentItems()

          // Same length
          expect(sorted.length).toBe(items.length)

          // Same elements (multiset equality)
          const originalNames = items.map(i => i.name).sort()
          const sortedNames = sorted.map(i => i.name).sort()
          expect(sortedNames).toEqual(originalNames)
        }
      )
    )
  })

  it('sort asc then desc reverses order (unique scores)', async () => {
    const { ArrayDataProvider } = await import('../src/providers/ArrayDataProvider')
    await fc.assert(
      fc.asyncProperty(
        fc.uniqueArray(fc.integer(), { minLength: 2, maxLength: 30 }).map(
          scores => scores.map(s => ({ score: s }))
        ),
        async (items) => {
          const providerAsc = new ArrayDataProvider({ items })
          await providerAsc.load({ sortField: 'score', sortOrder: 'asc' })
          const asc = providerAsc.getCurrentItems()

          const providerDesc = new ArrayDataProvider({ items })
          await providerDesc.load({ sortField: 'score', sortOrder: 'desc' })
          const desc = providerDesc.getCurrentItems()

          expect(asc).toEqual([...desc].reverse())
        }
      )
    )
  })

  it('offset pagination never returns more items than pageSize', async () => {
    const { ArrayDataProvider } = await import('../src/providers/ArrayDataProvider')
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({ id: fc.integer() }), { minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 10 }),
        async (items, pageSize, page) => {
          const provider = new ArrayDataProvider({ items })
          provider.setOffsetPagination({ page, pageSize })
          await provider.load()

          const current = provider.getCurrentItems()
          expect(current.length).toBeLessThanOrEqual(pageSize)
        }
      )
    )
  })

  it('totalPages = ceil(totalItems / pageSize)', async () => {
    const { ArrayDataProvider } = await import('../src/providers/ArrayDataProvider')
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({ id: fc.integer() }), { minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 25 }),
        async (items, pageSize) => {
          const provider = new ArrayDataProvider({ items })
          provider.setOffsetPagination({ page: 1, pageSize })
          await provider.load()

          const pagination = provider.getOffsetPagination()!
          expect(pagination.totalPages).toBe(Math.ceil(items.length / pageSize))
          expect(pagination.totalItems).toBe(items.length)
        }
      )
    )
  })
})

// ─── InMemoryStateProvider round-trip properties ────────────────────────────

describe('InMemoryStateProvider (property-based)', () => {
  it('setFilter then getFilter returns the same value', async () => {
    const { InMemoryStateProvider } = await import('../src/state/InMemoryStateProvider')
    fc.assert(
      fc.property(
        fcSafeKey,
        fc.string({ minLength: 1, maxLength: 50 }),
        (key, value) => {
          const provider = new InMemoryStateProvider()
          provider.setFilter(key, value)
          expect(provider.getFilter(key)).toBe(value)
        }
      )
    )
  })

  it('setSort then getSort returns the same state', async () => {
    const { InMemoryStateProvider } = await import('../src/state/InMemoryStateProvider')
    fc.assert(
      fc.property(fcSortState, (sort) => {
        const provider = new InMemoryStateProvider()
        provider.setSort(sort.field, sort.order)
        const result = provider.getSort()!
        expect(result.field).toBe(sort.field)
        expect(result.order).toBe(sort.order)
      })
    )
  })

  it('clear removes all filters and sort', async () => {
    const { InMemoryStateProvider } = await import('../src/state/InMemoryStateProvider')
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fcSafeKey, fc.string({ minLength: 1 })), { maxLength: 10 }),
        fcSortState,
        (filters, sort) => {
          const provider = new InMemoryStateProvider()
          filters.forEach(([k, v]) => provider.setFilter(k, v))
          provider.setSort(sort.field, sort.order)

          provider.clear()

          expect(provider.getAllFilters()).toEqual({})
          expect(provider.getSort()).toBeNull()
        }
      )
    )
  })

  it('getAllFilters returns a copy (mutation safe)', async () => {
    const { InMemoryStateProvider } = await import('../src/state/InMemoryStateProvider')
    fc.assert(
      fc.property(
        fc.dictionary(fcSafeKey, fc.string({ minLength: 1 }), { maxKeys: 5 }),
        (filters) => {
          const provider = new InMemoryStateProvider()
          for (const [k, v] of Object.entries(filters)) {
            provider.setFilter(k, v)
          }
          const snapshot = provider.getAllFilters()
          snapshot['hacked'] = 'injected'
          // Original is unaffected
          expect(provider.getFilter('hacked')).toBeNull()
        }
      )
    )
  })

  it('setting filter to empty string clears it', async () => {
    const { InMemoryStateProvider } = await import('../src/state/InMemoryStateProvider')
    fc.assert(
      fc.property(
        fcSafeKey,
        fc.string({ minLength: 1 }),
        (key, value) => {
          const provider = new InMemoryStateProvider()
          provider.setFilter(key, value)
          expect(provider.getFilter(key)).toBe(value)

          provider.setFilter(key, '')
          expect(provider.getFilter(key)).toBeNull()
        }
      )
    )
  })
})
