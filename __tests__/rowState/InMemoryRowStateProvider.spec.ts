import { describe, it, expect, beforeEach } from 'vitest'
import { computed, watch } from 'vue'
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

  it('returns numeric-looking string keys from entries() as strings', () => {
    provider.set('7', 'selected', true)
    provider.set('x', 'selected', true)
    expect(provider.entries('selected')).toEqual(['7', 'x'])
  })

  it('returns numeric keys from entries() as numbers', () => {
    provider.set(7, 'selected', true)
    expect(provider.entries('selected')).toEqual([7])
  })

  it('treats 7 and "7" as the same row and reports the key type last used in set()', () => {
    provider.set(7, 'selected', true)
    provider.set('7', 'expanded', true)
    expect(provider.get(7, 'expanded')).toBe(true)
    expect(provider.entries('selected')).toEqual(['7'])
  })

  it('forgets the original key once the row is pruned', () => {
    provider.set(7, 'selected', true)
    provider.delete(7, 'selected')
    provider.set('7', 'selected', true)
    expect(provider.entries('selected')).toEqual(['7'])
    provider.clear('selected')
    provider.set(7, 'selected', true)
    expect(provider.entries('selected')).toEqual([7])
  })

  it('notifies a sync watcher with the final value when a new row gets its first flag', () => {
    const seen: unknown[] = []
    watch(() => provider.get('row-1', 'expanded'), (value) => seen.push(value), { flush: 'sync' })
    provider.set('row-1', 'expanded', true)
    expect(seen.at(-1)).toBe(true)
  })

  it('re-runs a computed over entries() when a row is selected', () => {
    const selected = computed(() => provider.entries('selected'))
    expect(selected.value).toEqual([])
    provider.set('7', 'selected', true)
    expect(selected.value).toEqual(['7'])
  })
})
