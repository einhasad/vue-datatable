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
  buildAttributes,
  getPageRange,
  getPaginationSummary
} from '../src/utils'
import type { Column } from '../src/types'

describe('utils', () => {
  describe('getCellValue', () => {
    it('should return value from column.value function', () => {
      const column: Column = {
        key: 'name',
        value: (model: any) => `Hello ${model.name}`
      }
      const model = { name: 'John' }
      expect(getCellValue(column, model, 0)).toBe('Hello John')
    })

    it('should return value from model using column.key', () => {
      const column: Column = { key: 'name' }
      const model = { name: 'John' }
      expect(getCellValue(column, model, 0)).toBe('John')
    })

    it('should convert non-string values to string', () => {
      const column: Column = { key: 'age' }
      const model = { age: 25 }
      expect(getCellValue(column, model, 0)).toBe('25')
    })

    it('should return empty string if key not found', () => {
      const column: Column = { key: 'missing' }
      const model = { name: 'John' }
      expect(getCellValue(column, model, 0)).toBe('')
    })

    it('should return empty string if no value or key provided', () => {
      const column: Column = {}
      const model = { name: 'John' }
      expect(getCellValue(column, model, 0)).toBe('')
    })
  })

  describe('getColumnLabel', () => {
    it('should return label from function', () => {
      const column: Column = {
        key: 'name',
        label: (models: any[]) => `Count: ${models.length}`
      }
      const models = [{ id: 1 }, { id: 2 }]
      expect(getColumnLabel(column, models)).toBe('Count: 2')
    })

    it('should return label string', () => {
      const column: Column = { key: 'name', label: 'Name' }
      expect(getColumnLabel(column, [])).toBe('Name')
    })

    it('should return key if label not provided', () => {
      const column: Column = { key: 'name' }
      expect(getColumnLabel(column, [])).toBe('name')
    })

    it('should return empty string if no label or key', () => {
      const column: Column = {}
      expect(getColumnLabel(column, [])).toBe('')
    })
  })

  describe('shouldShowColumn', () => {
    it('should return true by default', () => {
      const column: Column = { key: 'name' }
      expect(shouldShowColumn(column)).toBe(true)
    })

    it('should return boolean value', () => {
      const column: Column = { key: 'name', showColumn: false }
      expect(shouldShowColumn(column)).toBe(false)
    })

    it('should call function to determine visibility', () => {
      const showFn = vi.fn(() => true)
      const column: Column = { key: 'name', showColumn: showFn }
      expect(shouldShowColumn(column)).toBe(true)
      expect(showFn).toHaveBeenCalled()
    })
  })

  describe('shouldShowCell', () => {
    it('should return true if no show function provided', () => {
      const column: Column = { key: 'name' }
      const model = { name: 'John' }
      expect(shouldShowCell(column, model)).toBe(true)
    })

    it('should call show function with model', () => {
      const showFn = vi.fn((model: any) => model.active)
      const column: Column = { key: 'name', show: showFn }
      const model = { name: 'John', active: true }
      expect(shouldShowCell(column, model)).toBe(true)
      expect(showFn).toHaveBeenCalledWith(model)
    })
  })

  describe('getCellComponent', () => {
    it('should return null if no component provided', () => {
      const column: Column = { key: 'name' }
      const model = { name: 'John' }
      expect(getCellComponent(column, model, 0)).toBeNull()
    })

    it('should return component options from function', () => {
      const componentFn = vi.fn(() => ({ name: 'TestComponent', props: {} }))
      const column: Column = { key: 'name', component: componentFn }
      const model = { name: 'John' }
      const result = getCellComponent(column, model, 0)
      expect(result).toEqual({ name: 'TestComponent', props: {} })
      expect(componentFn).toHaveBeenCalledWith(model, 0)
    })
  })

  describe('getCellOptions', () => {
    it('should return empty object if no options provided', () => {
      const column: Column = { key: 'name' }
      const model = { name: 'John' }
      expect(getCellOptions(column, model)).toEqual({})
    })

    it('should return options from function', () => {
      const optionsFn = vi.fn(() => ({ class: 'test-class' }))
      const column: Column = { key: 'name', options: optionsFn }
      const model = { name: 'John' }
      const result = getCellOptions(column, model)
      expect(result).toEqual({ class: 'test-class' })
      expect(optionsFn).toHaveBeenCalledWith(model)
    })

    it('should return empty object if options function returns null', () => {
      const column: Column = { key: 'name', options: () => null }
      const model = { name: 'John' }
      expect(getCellOptions(column, model)).toEqual({})
    })
  })

  describe('getRowOptions', () => {
    it('should return empty object if no function provided', () => {
      const model = { name: 'John' }
      expect(getRowOptions(undefined, model)).toEqual({})
    })

    it('should return options from function', () => {
      const optionsFn = vi.fn(() => ({ class: 'row-class' }))
      const model = { name: 'John' }
      const result = getRowOptions(optionsFn, model)
      expect(result).toEqual({ class: 'row-class' })
      expect(optionsFn).toHaveBeenCalledWith(model)
    })

    it('should return empty object if function returns null', () => {
      const optionsFn = vi.fn(() => null)
      const model = { name: 'John' }
      expect(getRowOptions(optionsFn, model)).toEqual({})
    })
  })

  describe('getFooterContent', () => {
    it('should return empty string if no footer provided', () => {
      const column: Column = { key: 'name' }
      const models = [{ name: 'John' }]
      expect(getFooterContent(column, models)).toBe('')
    })

    it('should return footer content from function', () => {
      const footerFn = vi.fn((models: any[]) => `Total: ${models.length}`)
      const column: Column = { key: 'name', footer: footerFn }
      const models = [{ name: 'John' }, { name: 'Jane' }]
      expect(getFooterContent(column, models)).toBe('Total: 2')
      expect(footerFn).toHaveBeenCalledWith(models)
    })

    it('should return empty string if footer function returns null', () => {
      const column: Column = { key: 'name', footer: () => null }
      const models = [{ name: 'John' }]
      expect(getFooterContent(column, models)).toBe('')
    })
  })

  describe('getFooterOptions', () => {
    it('should return empty object if no footerOptions provided', () => {
      const column: Column = { key: 'name' }
      const models = [{ name: 'John' }]
      expect(getFooterOptions(column, models)).toEqual({})
    })

    it('should return footer options from function', () => {
      const footerOptionsFn = vi.fn(() => ({ class: 'footer-class' }))
      const column: Column = { key: 'name', footerOptions: footerOptionsFn }
      const models = [{ name: 'John' }]
      const result = getFooterOptions(column, models)
      expect(result).toEqual({ class: 'footer-class' })
      expect(footerOptionsFn).toHaveBeenCalledWith(models)
    })

    it('should return empty object if footerOptions function returns null', () => {
      const column: Column = { key: 'name', footerOptions: () => null }
      const models = [{ name: 'John' }]
      expect(getFooterOptions(column, models)).toEqual({})
    })
  })

  describe('mergeClasses', () => {
    it('should merge string classes', () => {
      expect(mergeClasses('class1', 'class2')).toBe('class1 class2')
    })

    it('should merge array classes', () => {
      expect(mergeClasses(['class1', 'class2'], ['class3'])).toBe('class1 class2 class3')
    })

    it('should merge object classes', () => {
      expect(mergeClasses({ class1: true, class2: false, class3: true })).toBe('class1 class3')
    })

    it('should merge mixed class types', () => {
      expect(mergeClasses('class1', ['class2', 'class3'], { class4: true, class5: false })).toBe('class1 class2 class3 class4')
    })

    it('should ignore undefined values', () => {
      expect(mergeClasses('class1', undefined, 'class2')).toBe('class1 class2')
    })

    it('should return empty string for no classes', () => {
      expect(mergeClasses()).toBe('')
    })
  })

  describe('normalizeStyle', () => {
    it('should return empty string for undefined', () => {
      expect(normalizeStyle(undefined)).toBe('')
    })

    it('should return string as-is', () => {
      expect(normalizeStyle('color: red; font-size: 14px')).toBe('color: red; font-size: 14px')
    })

    it('should convert object to style string', () => {
      const style = { color: 'red', 'font-size': '14px' }
      expect(normalizeStyle(style)).toBe('color: red; font-size: 14px')
    })

    it('should handle empty object', () => {
      expect(normalizeStyle({})).toBe('')
    })
  })

  describe('buildAttributes', () => {
    it('should merge class attribute', () => {
      const options = { class: ['class1', 'class2'] }
      expect(buildAttributes(options)).toEqual({ class: 'class1 class2' })
    })

    it('should normalize style attribute', () => {
      const options = { style: { color: 'red' } }
      expect(buildAttributes(options)).toEqual({ style: 'color: red' })
    })

    it('should preserve other attributes', () => {
      const options = { id: 'test', 'data-value': '123' }
      expect(buildAttributes(options)).toEqual({ id: 'test', 'data-value': '123' })
    })

    it('should handle mixed attributes', () => {
      const options = {
        class: 'test-class',
        style: { color: 'blue' },
        id: 'test-id'
      }
      expect(buildAttributes(options)).toEqual({
        class: 'test-class',
        style: 'color: blue',
        id: 'test-id'
      })
    })
  })

  describe('getPageRange', () => {
    it('should return all pages if pageCount <= maxVisible', () => {
      expect(getPageRange(1, 3, 5)).toEqual([1, 2, 3])
    })

    it('should return range centered on current page', () => {
      expect(getPageRange(5, 10, 5)).toEqual([3, 4, 5, 6, 7])
    })

    it('should adjust range at start', () => {
      expect(getPageRange(2, 10, 5)).toEqual([1, 2, 3, 4, 5])
    })

    it('should adjust range at end', () => {
      expect(getPageRange(9, 10, 5)).toEqual([6, 7, 8, 9, 10])
    })

    it('should use default maxVisible of 5', () => {
      expect(getPageRange(3, 10)).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle single page', () => {
      expect(getPageRange(1, 1, 5)).toEqual([1])
    })
  })

  describe('getPaginationSummary', () => {
    it('should format pagination summary', () => {
      expect(getPaginationSummary(1, 10, 50)).toBe('Showing 1-10 of 50 items')
    })

    it('should handle last page with fewer items', () => {
      expect(getPaginationSummary(5, 10, 45)).toBe('Showing 41-45 of 45 items')
    })

    it('should handle first page', () => {
      expect(getPaginationSummary(1, 20, 100)).toBe('Showing 1-20 of 100 items')
    })

    it('should handle single item page', () => {
      expect(getPaginationSummary(1, 1, 1)).toBe('Showing 1-1 of 1 items')
    })
  })
})
