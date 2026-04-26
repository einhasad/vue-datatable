import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Grid from '../src/Grid.vue'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import { InMemoryRowStateProvider } from '../src/rowState/InMemoryRowStateProvider'
import type { Column } from '../src/types'

interface Node { id: string; name: string; children?: Node[] }

function makeProvider(items: Node[]) {
  return new ArrayDataProvider<Node>({ items })
}

const baseColumns: Column<Node>[] = [
  { key: 'name', label: 'Name', expandToggle: true },
]

describe('Grid expandable rows', () => {
  let rowState: InMemoryRowStateProvider

  beforeEach(() => {
    rowState = new InMemoryRowStateProvider()
  })

  it('renders a chevron in the expandToggle column', async () => {
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([{ id: 'a', name: 'A' }]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    expect(wrapper.find('[data-qa="grid-chevron"]').exists()).toBe(true)
  })

  it('toggles expansion state and emits expand on click of a row with no children', async () => {
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([{ id: 'a', name: 'A' }]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    await wrapper.find('[data-qa="grid-chevron"]').trigger('click')
    expect(rowState.get('a', 'expanded')).toBe(true)
    expect(wrapper.emitted('expand')).toBeTruthy()
    expect(wrapper.emitted('expand')![0][0]).toEqual({ id: 'a', name: 'A' })
  })

  it('emits collapse when toggling an open row', async () => {
    rowState.set('a', 'expanded', true)
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([{ id: 'a', name: 'A' }]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    await wrapper.find('[data-qa="grid-chevron"]').trigger('click')
    expect(wrapper.emitted('collapse')).toBeTruthy()
  })

  it('renders nested children at depth + 1 when row is expanded and has children', async () => {
    rowState.set('a', 'expanded', true)
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([
          { id: 'a', name: 'A', children: [{ id: 'a-1', name: 'A1' }] }
        ]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    const rows = wrapper.findAll('tr.grid-row')
    expect(rows.length).toBe(2)
    expect(rows[0].attributes('data-depth')).toBe('0')
    expect(rows[1].attributes('data-depth')).toBe('1')
  })

  it('does not render children when row is collapsed', async () => {
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([
          { id: 'a', name: 'A', children: [{ id: 'a-1', name: 'A1' }] }
        ]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    expect(wrapper.findAll('tr.grid-row').length).toBe(1)
  })

  it('does not fire onRowClick when chevron is clicked', async () => {
    let rowClickCount = 0
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([{ id: 'a', name: 'A' }]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
        onRowClick: () => { rowClickCount += 1 },
      }
    })
    await flushPromises()
    await wrapper.find('[data-qa="grid-chevron"]').trigger('click')
    expect(rowClickCount).toBe(0)
  })

  it('auto re-emits expand when an expanded row reappears without children after items change', async () => {
    rowState.set('a', 'expanded', true)
    const provider = new ArrayDataProvider<Node>({ items: [{ id: 'a', name: 'A' }] })
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: provider,
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    expect(wrapper.emitted('expand')).toBeTruthy()
    const initial = wrapper.emitted('expand')!.length

    provider.setRows([{ id: 'a', name: 'A (refreshed)' }])
    await flushPromises()
    expect(wrapper.emitted('expand')!.length).toBe(initial + 1)

    provider.setRows([{ id: 'a', name: 'A (refreshed)', children: [{ id: 'a-1', name: 'A1' }] }])
    await flushPromises()
    expect(wrapper.emitted('expand')!.length).toBe(initial + 1)
  })

  it('does not auto re-emit on reactive changes that do not change the items reference', async () => {
    rowState.set('a', 'expanded', true)
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([{ id: 'a', name: 'A' }]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    const beforeCount = wrapper.emitted('expand')!.length
    rowState.set('a', 'someUnrelatedFlag', true)
    await flushPromises()
    expect(wrapper.emitted('expand')!.length).toBe(beforeCount)
  })

  it('renders #expandedRow slot only for expanded rows and exposes slot props', async () => {
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([
          { id: 'a', name: 'A' },
          { id: 'b', name: 'B' },
        ]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      },
      slots: {
        expandedRow: `<template #expandedRow="{ item, rowKey, depth }">
          <div class="panel" :data-id="rowKey" :data-depth="depth">{{ item.name }} panel</div>
        </template>`,
      },
    })
    await flushPromises()

    expect(wrapper.findAll('.grid-expanded-row').length).toBe(0)

    await wrapper.findAll('[data-qa="grid-chevron"]')[0].trigger('click')
    await flushPromises()

    const expandedRows = wrapper.findAll('.grid-expanded-row')
    expect(expandedRows.length).toBe(1)
    const panel = wrapper.find('.panel')
    expect(panel.exists()).toBe(true)
    expect(panel.text()).toBe('A panel')
    expect(panel.attributes('data-id')).toBe('a')
    expect(panel.attributes('data-depth')).toBe('0')
  })

  it('does not render an expanded-row tr when no #expandedRow slot is provided', async () => {
    rowState.set('a', 'expanded', true)
    const wrapper = mount(Grid<Node>, {
      props: {
        dataProvider: makeProvider([{ id: 'a', name: 'A' }]),
        columns: baseColumns,
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()
    expect(wrapper.findAll('.grid-expanded-row').length).toBe(0)
  })

  it('warns once when rowKey resolves to undefined for an item', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    type Bad = { name: string }
    mount(Grid<Bad>, {
      props: {
        dataProvider: new ArrayDataProvider<Bad>({ items: [{ name: 'no id 1' }, { name: 'no id 2' }] }),
        columns: [{ key: 'name', label: 'Name', expandToggle: true }] as Column<Bad>[],
        rowStateProvider: new InMemoryRowStateProvider(),
        rowKey: () => undefined,
      }
    })
    await flushPromises()
    const warnings = warnSpy.mock.calls.filter(c => String(c[0]).includes('[grid] rowKey returned undefined'))
    expect(warnings.length).toBe(1)
    warnSpy.mockRestore()
  })
})
