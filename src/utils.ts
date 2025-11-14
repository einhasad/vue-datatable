import type { Column, ComponentOptions, RowOptions } from './types'

/**
 * Extract cell value from a column definition
 */
export function getCellValue(column: Column, model: any, index: number): string {
  if (column.value) {
    return column.value(model, index)
  }

  if (column.key && model[column.key] !== undefined) {
    return String(model[column.key])
  }

  return ''
}

/**
 * Get column label (supports string or function)
 */
export function getColumnLabel(column: Column, models: any[]): string {
  if (typeof column.label === 'function') {
    return column.label(models)
  }

  return column.label || column.key || ''
}

/**
 * Check if a column should be shown
 */
export function shouldShowColumn(column: Column): boolean {
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
export function shouldShowCell(column: Column, model: any): boolean {
  if (!column.show) {
    return true
  }

  return column.show(model)
}

/**
 * Get cell component options
 */
export function getCellComponent(column: Column, model: any, index: number): ComponentOptions | null {
  if (column.component) {
    return column.component(model, index)
  }

  return null
}

/**
 * Get cell options (classes, styles, attributes)
 */
export function getCellOptions(column: Column, model: any): Record<string, any> {
  if (column.options) {
    return column.options(model) || {}
  }

  return {}
}

/**
 * Get row options (classes, styles, attributes)
 */
export function getRowOptions(rowOptionsFn: ((_model: any) => RowOptions) | undefined, model: any): RowOptions {
  if (rowOptionsFn) {
    return rowOptionsFn(model) || {}
  }

  return {}
}

/**
 * Get footer content for a column
 */
export function getFooterContent(column: Column, models: any[]): string {
  if (column.footer) {
    return column.footer(models) || ''
  }

  return ''
}

/**
 * Get footer options (classes, styles, attributes)
 */
export function getFooterOptions(column: Column, models: any[]): Record<string, any> {
  if (column.footerOptions) {
    return column.footerOptions(models) || {}
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
export function buildAttributes(options: Record<string, any>): Record<string, any> {
  const attrs: Record<string, any> = {}

  for (const [key, value] of Object.entries(options)) {
    if (key === 'class') {
      attrs.class = mergeClasses(value)
    } else if (key === 'style') {
      attrs.style = normalizeStyle(value)
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
