import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryRowStateProvider } from '../../src/rowState/InMemoryRowStateProvider'

describe('InMemoryRowStateProvider', () => {
  let provider: InMemoryRowStateProvider

  beforeEach(() => {
    provider = new InMemoryRowStateProvider()
  })

  it('returns undefined for unset flags', () => {
    expect(provider.get('row-1', 'expanded')).toBeUndefined()
  })

  it('stores and reads a flag', () => {
    provider.set('row-1', 'expanded', true)
    expect(provider.get('row-1', 'expanded')).toBe(true)
  })

  it('stores multiple flags on the same row', () => {
    provider.set('row-1', 'expanded', true)
    provider.set('row-1', 'selected', true)
    expect(provider.get('row-1', 'expanded')).toBe(true)
    expect(provider.get('row-1', 'selected')).toBe(true)
  })

  it('toggles a boolean flag', () => {
    provider.toggle('row-1', 'expanded')
    expect(provider.get('row-1', 'expanded')).toBe(true)
    provider.toggle('row-1', 'expanded')
    expect(provider.get('row-1', 'expanded')).toBe(false)
  })

  it('deletes a single flag without disturbing others', () => {
    provider.set('row-1', 'expanded', true)
    provider.set('row-1', 'selected', true)
    provider.delete('row-1', 'expanded')
    expect(provider.get('row-1', 'expanded')).toBeUndefined()
    expect(provider.get('row-1', 'selected')).toBe(true)
  })

  it('prunes the row entry when its last flag is deleted', () => {
    provider.set('row-1', 'expanded', true)
    provider.delete('row-1', 'expanded')
    expect(Object.keys(provider.state)).not.toContain('row-1')
  })

  it('lists row keys whose flag is truthy via entries()', () => {
    provider.set('a', 'selected', true)
    provider.set('b', 'selected', false)
    provider.set('c', 'selected', true)
    provider.set('d', 'expanded', true)
    expect(provider.entries('selected').sort()).toEqual(['a', 'c'])
  })

  it('clears a single flag across all rows but keeps others', () => {
    provider.set('a', 'selected', true)
    provider.set('a', 'expanded', true)
    provider.set('b', 'selected', true)
    provider.clear('selected')
    expect(provider.entries('selected')).toEqual([])
    expect(provider.get('a', 'expanded')).toBe(true)
  })

  it('exposes a reactive state surface', () => {
    provider.set('row-1', 'expanded', true)
    expect(provider.state['row-1']).toEqual({ expanded: true })
  })

  it('supports numeric row keys', () => {
    provider.set(42, 'expanded', true)
    expect(provider.get(42, 'expanded')).toBe(true)
  })
})
