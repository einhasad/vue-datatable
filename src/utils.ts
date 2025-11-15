import type { Column, ComponentOptions, RowOptions } from './types'

/**
 * Extract cell value from a column definition
 */
export function getCellValue<T = unknown>(column: Column<T>, model: T, index: number): string {
  if (column.value) {
    return column.value(model, index)
  }

  if (column.key && typeof model === 'object' && model !== null) {
    const value = (model as Record<string, unknown>)[column.key]
    if (value !== undefined && value !== null) {
      // Handle different value types explicitly to avoid [object Object] stringification
      const valueType = typeof value
      if (valueType === 'string') {
        return value as string
      }
      if (valueType === 'number' || valueType === 'boolean') {
        return String(value as number | boolean)
      }
      if (valueType === 'object') {
        return JSON.stringify(value)
      }
      // For symbols and bigints, convert to string
      return String(value as symbol | bigint)
    }
  }

  return ''
}

/**
 * Get column label (supports string or function)
 */
export function getColumnLabel<T = unknown>(column: Column<T>, models: T[]): string {
  if (typeof column.label === 'function') {
    return column.label(models)
  }

  return column.label || column.key || ''
}

/**
 * Check if a column should be shown
 */
export function shouldShowColumn<T = unknown>(column: Column<T>): boolean {
  if (column.showColumn === undefined) {
    return true
  }

  if (typeof column.showColumn === 'function') {
    return column.showColumn()
  }

  return column.showColumn
}

/**
 * Check if a cell should be shown
 */
export function shouldShowCell<T = unknown>(column: Column<T>, model: T): boolean {
  if (!column.show) {
    return true
  }

  return column.show(model)
}

/**
 * Get cell component options
 */
export function getCellComponent<T = unknown>(column: Column<T>, model: T, index: number): ComponentOptions | null {
  if (column.component) {
    return column.component(model, index)
  }

  return null
}

/**
 * Get cell options (classes, styles, attributes)
 */
export function getCellOptions<T = unknown>(column: Column<T>, model: T): Record<string, unknown> {
  if (column.options) {
    return (column.options(model) || {}) as Record<string, unknown>
  }

  return {}
}

/**
 * Get row options (classes, styles, attributes)
 */
export function getRowOptions<T = unknown>(rowOptionsFn: ((model: T) => RowOptions) | undefined, model: T): RowOptions {
  if (rowOptionsFn) {
    return rowOptionsFn(model) || {}
  }

  return {}
}

/**
 * Get footer content for a column
 */
export function getFooterContent<T = unknown>(column: Column<T>, models: T[]): string {
  if (column.footer) {
    return column.footer(models) || ''
  }

  return ''
}

/**
 * Get footer options (classes, styles, attributes)
 */
export function getFooterOptions<T = unknown>(column: Column<T>, models: T[]): Record<string, unknown> {
  if (column.footerOptions) {
    return (column.footerOptions(models) || {}) as Record<string, unknown>
  }

  return {}
}

/**
 * Merge CSS classes from different sources
 */
export function mergeClasses(...classInputs: Array<string | string[] | Record<string, boolean> | undefined>): string {
  const classes: string[] = []

  for (const input of classInputs) {
    if (!input) continue

    if (typeof input === 'string') {
      classes.push(input)
    } else if (Array.isArray(input)) {
      classes.push(...input)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}

/**
 * Normalize style object to string
 */
export function normalizeStyle(style: string | Record<string, string> | undefined): string {
  if (!style) return ''

  if (typeof style === 'string') {
    return style
  }

  return Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * Build HTML attributes from options object
 */
export function buildAttributes(options: Record<string, unknown>): Record<string, unknown> {
  const attrs: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(options)) {
    if (key === 'class') {
      attrs.class = mergeClasses(value as string | string[] | Record<string, boolean> | undefined)
    } else if (key === 'style') {
      attrs.style = normalizeStyle(value as string | Record<string, string> | undefined)
    } else {
      attrs[key] = value
    }
  }

  return attrs
}

/**
 * Calculate page range for pagination display
 */
export function getPageRange(currentPage: number, pageCount: number, maxVisible: number = 5): number[] {
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const halfVisible = Math.floor(maxVisible / 2)
  let startPage = Math.max(1, currentPage - halfVisible)
  const endPage = Math.min(pageCount, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
}

/**
 * Format pagination summary text
 */
export function getPaginationSummary(currentPage: number, perPage: number, totalCount: number): string {
  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, totalCount)

  return `Showing ${startItem}-${endItem} of ${totalCount} items`
}
