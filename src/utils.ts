import type { Column, ComponentOptions, RowOptions } from './types'

/**
 * Extract cell value from a column definition
 */
export function getCellValue<T = unknown>(column: Column<T>, model: T, index: number): string {
  if (column.value) {
    const val = column.value(model, index)
    if (val === null || val === undefined) return ''
    return String(val)
  }

  const field = column.key ?? column.sort
  if (field && typeof model === 'object' && model !== null) {
    const value = (model as Record<string, unknown>)[field]
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

  return column.label ?? column.sort ?? ''
}

/**
 * Check if a column should be shown
 */
export function shouldShowColumn<T>(column: Column<T>): boolean {
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return column.options(model) ?? {}
  }

  return {}
}

/**
 * Get row options (classes, styles, attributes)
 */
export function getRowOptions<T = unknown>(rowOptionsFn: ((model: T) => RowOptions) | undefined, model: T): RowOptions {
  if (rowOptionsFn) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return rowOptionsFn(model) ?? {}
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return column.footerOptions(models) ?? {}
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
