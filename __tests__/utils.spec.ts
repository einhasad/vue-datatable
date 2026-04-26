import { describe, it, expect, vi } from 'vitest'
import {
  getCellValue,
  getColumnLabel,
  shouldShowColumn,
  shouldShowCell,
  getCellComponent,
  getCellOptions,
  getRowOptions,
  getFooterContent,
  getFooterOptions,
  mergeClasses,
  normalizeStyle,
  buildAttributes
} from '../src/utils'
import type { Column, ComponentOptions } from '../src/types'

describe('utils', () => {
  describe('getCellValue', () => {
    it('returns value from column.value function when defined', () => {
      const column = {
        value: vi.fn().mockReturnValue('hello')
      } as unknown as Column<{ name: string }>
      expect(getCellValue(column, { name: 'test' }, 0)).toBe('hello')
    })

    it('converts number value to string', () => {
      const column = {
        value: vi.fn().mockReturnValue(42)
      } as unknown as Column<{ name: string }>
      expect(getCellValue(column, { name: 'test' }, 0)).toBe('42')
    })

    it('converts boolean value to string', () => {
      const column = {
        value: vi.fn().mockReturnValue(true)
      } as unknown as Column<{ name: string }>
      expect(getCellValue(column, { name: 'test' }, 0)).toBe('true')
    })

    it('returns empty string when value function returns null', () => {
      const column = {
        value: vi.fn().mockReturnValue(null)
      } as unknown as Column<{ name: string }>
      expect(getCellValue(column, { name: 'test' }, 0)).toBe('')
    })

    it('returns empty string when value function returns undefined', () => {
      const column = {
        value: vi.fn().mockReturnValue(undefined)
      } as unknown as Column<{ name: string }>
      expect(getCellValue(column, { name: 'test' }, 0)).toBe('')
    })

    it('reads from model by column.key when no value function', () => {
      const column = { key: 'name' } as Column<{ name: string }>
      expect(getCellValue(column, { name: 'Alice' }, 0)).toBe('Alice')
    })

    it('reads from model by column.sort when no key and no value function', () => {
      const column = { sort: 'age' } as Column<{ age: number }>
      expect(getCellValue(column, { age: 30 }, 0)).toBe('30')
    })

    it('prefers column.key over column.sort', () => {
      const column = { key: 'name', sort: 'age' } as Column<{ name: string; age: number }>
      expect(getCellValue(column, { name: 'Alice', age: 30 }, 0)).toBe('Alice')
    })

    it('returns string property as-is', () => {
      const column = { key: 'name' } as Column<{ name: string }>
      expect(getCellValue(column, { name: 'Bob' }, 0)).toBe('Bob')
    })

    it('converts number property to string', () => {
      const column = { key: 'count' } as Column<{ count: number }>
      expect(getCellValue(column, { count: 99 }, 0)).toBe('99')
    })

    it('converts boolean property to string', () => {
      const column = { key: 'active' } as Column<{ active: boolean }>
      expect(getCellValue(column, { active: false }, 0)).toBe('false')
    })

    it('JSON-stringifies object properties', () => {
      const column = { key: 'meta' } as Column<{ meta: object }>
      expect(getCellValue(column, { meta: { a: 1 } }, 0)).toBe('{"a":1}')
    })

    it('returns empty string when model is null', () => {
      const column = { key: 'name' } as Column<null>
      expect(getCellValue(column, null, 0)).toBe('')
    })

    it('returns empty string when model is undefined', () => {
      const column = { key: 'name' } as Column<undefined>
      expect(getCellValue(column, undefined, 0)).toBe('')
    })

    it('returns empty string when model is a primitive', () => {
      const column = { key: 'name' } as Column<number>
      expect(getCellValue(column, 42, 0)).toBe('')
    })

    it('returns empty string when field value is null', () => {
      const column = { key: 'name' } as Column<{ name: string | null }>
      expect(getCellValue(column, { name: null }, 0)).toBe('')
    })

    it('returns empty string when field value is undefined', () => {
      const column = { key: 'name' } as Column<{ name?: string }>
      expect(getCellValue(column, {}, 0)).toBe('')
    })

    it('returns empty string when no key, sort, or value function', () => {
      const column = {} as Column<{ name: string }>
      expect(getCellValue(column, { name: 'test' }, 0)).toBe('')
    })

    it('converts symbol values to string', () => {
      const sym = Symbol('foo')
      const column = { key: 'sym' } as Column<{ sym: symbol }>
      expect(getCellValue(column, { sym }, 0)).toBe(String(sym))
    })

    it('converts bigint values to string', () => {
      const column = { key: 'big' } as Column<{ big: bigint }>
      expect(getCellValue(column, { big: 9007199254740991n }, 0)).toBe('9007199254740991')
    })
  })

  describe('getColumnLabel', () => {
    it('returns label string when label is a string', () => {
      const column = { label: 'Name' } as Column
      expect(getColumnLabel(column, [])).toBe('Name')
    })

    it('calls label function when label is a function', () => {
      const column = {
        label: vi.fn().mockReturnValue('Dynamic Label')
      } as unknown as Column
      const models = [{ id: 1 }, { id: 2 }]
      expect(getColumnLabel(column, models)).toBe('Dynamic Label')
      expect(column.label).toHaveBeenCalledWith(models)
    })

    it('falls back to sort when no label', () => {
      const column = { sort: 'name' } as Column
      expect(getColumnLabel(column, [])).toBe('name')
    })

    it('returns empty string when no label or sort', () => {
      const column = {} as Column
      expect(getColumnLabel(column, [])).toBe('')
    })

    it('prefers label over sort', () => {
      const column = { label: 'Label', sort: 'name' } as Column
      expect(getColumnLabel(column, [])).toBe('Label')
    })

    it('returns empty string for empty string label', () => {
      const column = { label: '' } as Column
      expect(getColumnLabel(column, [])).toBe('')
    })
  })

  describe('shouldShowColumn', () => {
    it('returns true when showColumn is undefined', () => {
      const column = {} as Column
      expect(shouldShowColumn(column)).toBe(true)
    })

    it('returns true when showColumn is true', () => {
      const column = { showColumn: true } as Column
      expect(shouldShowColumn(column)).toBe(true)
    })

    it('returns false when showColumn is false', () => {
      const column = { showColumn: false } as Column
      expect(shouldShowColumn(column)).toBe(false)
    })

    it('calls showColumn function when it is a function', () => {
      const column = {
        showColumn: vi.fn().mockReturnValue(true)
      } as unknown as Column
      expect(shouldShowColumn(column)).toBe(true)
      expect(column.showColumn).toHaveBeenCalled()
    })

    it('returns false when showColumn function returns false', () => {
      const column = {
        showColumn: vi.fn().mockReturnValue(false)
      } as unknown as Column
      expect(shouldShowColumn(column)).toBe(false)
    })
  })

  describe('shouldShowCell', () => {
    it('returns true when show is not defined', () => {
      const column = {} as Column<{ name: string }>
      expect(shouldShowCell(column, { name: 'test' })).toBe(true)
    })

    it('returns result of show function', () => {
      const column = {
        show: vi.fn().mockReturnValue(true)
      } as unknown as Column<{ name: string }>
      const model = { name: 'test' }
      expect(shouldShowCell(column, model)).toBe(true)
      expect(column.show).toHaveBeenCalledWith(model)
    })

    it('returns false when show function returns false', () => {
      const column = {
        show: vi.fn().mockReturnValue(false)
      } as unknown as Column<{ name: string }>
      expect(shouldShowCell(column, { name: 'test' })).toBe(false)
    })
  })

  describe('getCellComponent', () => {
    it('returns null when no component function', () => {
      const column = {} as Column
      expect(getCellComponent(column, {}, 0)).toBe(null)
    })

    it('returns component from component function', () => {
      const componentOptions: ComponentOptions = { is: 'span', content: 'hi' }
      const column = {
        component: vi.fn().mockReturnValue(componentOptions)
      } as unknown as Column
      const model = { id: 1 }
      const result = getCellComponent(column, model, 5)
      expect(result).toEqual(componentOptions)
      expect(column.component).toHaveBeenCalledWith(model, 5, undefined)
    })

    it('returns null when component function returns null', () => {
      const column = {
        component: vi.fn().mockReturnValue(null)
      } as unknown as Column
      expect(getCellComponent(column, {}, 0)).toBe(null)
    })
  })

  describe('getCellComponent rowContext', () => {
    it('forwards rowContext to column.component as the third argument', () => {
      const ctxSeen: unknown[] = []
      const column = {
        component: (_m: { id: number }, _i: number, ctx?: unknown) => {
          ctxSeen.push(ctx)
          return { is: 'span' as const }
        }
      } as unknown as Column<{ id: number }>
      const fakeCtx = { depth: 2, rowKey: 7, isExpanded: false, isExpandable: true, toggle: () => {}, rowState: {} as never }
      getCellComponent(column, { id: 1 }, 0, fakeCtx)
      expect(ctxSeen[0]).toBe(fakeCtx)
    })

    it('still works without rowContext (backward compatible)', () => {
      const column = {
        component: (m: { id: number }) => ({ is: 'span' as const, content: String(m.id) })
      } as unknown as Column<{ id: number }>
      const result = getCellComponent(column, { id: 5 }, 0)
      expect(result).toEqual({ is: 'span', content: '5' })
    })
  })

  describe('getCellOptions', () => {
    it('returns empty object when no options function', () => {
      const column = {} as Column
      expect(getCellOptions(column, {})).toEqual({})
    })

    it('returns options from options function', () => {
      const opts = { class: 'highlight', style: 'color: red' }
      const column = {
        options: vi.fn().mockReturnValue(opts)
      } as unknown as Column
      const model = { id: 1 }
      expect(getCellOptions(column, model)).toEqual(opts)
      expect(column.options).toHaveBeenCalledWith(model)
    })

    it('returns empty object when options function returns null', () => {
      const column = {
        options: vi.fn().mockReturnValue(null)
      } as unknown as Column
      expect(getCellOptions(column, {})).toEqual({})
    })

    it('returns empty object when options function returns undefined', () => {
      const column = {
        options: vi.fn().mockReturnValue(undefined)
      } as unknown as Column
      expect(getCellOptions(column, {})).toEqual({})
    })
  })

  describe('getRowOptions', () => {
    it('returns empty object when rowOptionsFn is undefined', () => {
      expect(getRowOptions(undefined, { id: 1 })).toEqual({})
    })

    it('returns options from rowOptionsFn', () => {
      const opts = { class: 'row-active', style: 'background: yellow' }
      const rowOptionsFn = vi.fn().mockReturnValue(opts)
      const model = { id: 1 }
      expect(getRowOptions(rowOptionsFn, model)).toEqual(opts)
      expect(rowOptionsFn).toHaveBeenCalledWith(model)
    })

    it('returns empty object when rowOptionsFn returns null', () => {
      const rowOptionsFn = vi.fn().mockReturnValue(null)
      expect(getRowOptions(rowOptionsFn, {})).toEqual({})
    })

    it('returns empty object when rowOptionsFn returns undefined', () => {
      const rowOptionsFn = vi.fn().mockReturnValue(undefined)
      expect(getRowOptions(rowOptionsFn, {})).toEqual({})
    })
  })

  describe('getFooterContent', () => {
    it('returns empty string when no footer function', () => {
      const column = {} as Column
      expect(getFooterContent(column, [])).toBe('')
    })

    it('returns footer string from footer function', () => {
      const column = {
        footer: vi.fn().mockReturnValue('Total: 10')
      } as unknown as Column
      const models = [{ id: 1 }, { id: 2 }]
      expect(getFooterContent(column, models)).toBe('Total: 10')
      expect(column.footer).toHaveBeenCalledWith(models)
    })

    it('returns empty string when footer function returns empty string', () => {
      const column = {
        footer: vi.fn().mockReturnValue('')
      } as unknown as Column
      expect(getFooterContent(column, [])).toBe('')
    })

    it('returns empty string when footer function returns null', () => {
      const column = {
        footer: vi.fn().mockReturnValue(null)
      } as unknown as Column
      expect(getFooterContent(column, [])).toBe('')
    })

    it('returns empty string when footer function returns undefined', () => {
      const column = {
        footer: vi.fn().mockReturnValue(undefined)
      } as unknown as Column
      expect(getFooterContent(column, [])).toBe('')
    })
  })

  describe('getFooterOptions', () => {
    it('returns empty object when no footerOptions function', () => {
      const column = {} as Column
      expect(getFooterOptions(column, [])).toEqual({})
    })

    it('returns options from footerOptions function', () => {
      const opts = { class: 'footer-bold' }
      const column = {
        footerOptions: vi.fn().mockReturnValue(opts)
      } as unknown as Column
      const models = [{ id: 1 }]
      expect(getFooterOptions(column, models)).toEqual(opts)
      expect(column.footerOptions).toHaveBeenCalledWith(models)
    })

    it('returns empty object when footerOptions function returns null', () => {
      const column = {
        footerOptions: vi.fn().mockReturnValue(null)
      } as unknown as Column
      expect(getFooterOptions(column, [])).toEqual({})
    })

    it('returns empty object when footerOptions function returns undefined', () => {
      const column = {
        footerOptions: vi.fn().mockReturnValue(undefined)
      } as unknown as Column
      expect(getFooterOptions(column, [])).toEqual({})
    })
  })

  describe('mergeClasses', () => {
    it('returns empty string with no arguments', () => {
      expect(mergeClasses()).toBe('')
    })

    it('merges string classes', () => {
      expect(mergeClasses('a', 'b', 'c')).toBe('a b c')
    })

    it('merges array classes', () => {
      expect(mergeClasses(['a', 'b'], ['c'])).toBe('a b c')
    })

    it('merges object classes with truthy values', () => {
      expect(mergeClasses({ active: true, disabled: false })).toBe('active')
    })

    it('skips undefined inputs', () => {
      expect(mergeClasses('a', undefined, 'b')).toBe('a b')
    })

    it('skips null inputs', () => {
      expect(mergeClasses('a', null as any, 'b')).toBe('a b')
    })

    it('merges mixed input types', () => {
      expect(mergeClasses('a', ['b', 'c'], { d: true, e: false })).toBe('a b c d')
    })

    it('skips empty object entries', () => {
      expect(mergeClasses({})).toBe('')
    })

    it('handles empty arrays', () => {
      expect(mergeClasses([])).toBe('')
    })

    it('handles empty string', () => {
      expect(mergeClasses('')).toBe('')
    })
  })

  describe('normalizeStyle', () => {
    it('returns empty string for undefined', () => {
      expect(normalizeStyle(undefined)).toBe('')
    })

    it('returns empty string for empty string input', () => {
      expect(normalizeStyle('')).toBe('')
    })

    it('returns style string as-is', () => {
      expect(normalizeStyle('color: red')).toBe('color: red')
    })

    it('converts style object to string', () => {
      expect(normalizeStyle({ color: 'red', 'font-size': '12px' })).toBe('color: red; font-size: 12px')
    })

    it('handles single property object', () => {
      expect(normalizeStyle({ display: 'flex' })).toBe('display: flex')
    })

    it('handles empty object', () => {
      expect(normalizeStyle({})).toBe('')
    })
  })

  describe('buildAttributes', () => {
    it('passes through non-special keys', () => {
      expect(buildAttributes({ id: 'test-row', colspan: 3 })).toEqual({
        id: 'test-row',
        colspan: 3
      })
    })

    it('normalizes class via mergeClasses', () => {
      const result = buildAttributes({ class: ['a', 'b'] })
      expect(result.class).toBe('a b')
    })

    it('normalizes class object', () => {
      const result = buildAttributes({ class: { active: true, hidden: false } })
      expect(result.class).toBe('active')
    })

    it('normalizes style via normalizeStyle', () => {
      const result = buildAttributes({ style: { color: 'red' } })
      expect(result.style).toBe('color: red')
    })

    it('passes through style string as-is', () => {
      const result = buildAttributes({ style: 'color: blue' })
      expect(result.style).toBe('color: blue')
    })

    it('handles mixed attributes with class and style', () => {
      const result = buildAttributes({
        class: 'my-class',
        style: 'font-weight: bold',
        'data-id': 42
      })
      expect(result).toEqual({
        class: 'my-class',
        style: 'font-weight: bold',
        'data-id': 42
      })
    })

    it('returns empty object for empty input', () => {
      expect(buildAttributes({})).toEqual({})
    })
  })
})
