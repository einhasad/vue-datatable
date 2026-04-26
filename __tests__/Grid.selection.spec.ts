import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Grid from '../src/Grid.vue'
import { ArrayDataProvider } from '../src/providers/ArrayDataProvider'
import { InMemoryRowStateProvider } from '../src/rowState/InMemoryRowStateProvider'
import type { Column, RowContext } from '../src/types'

interface Row { id: string; name: string }

describe('Grid + RowStateProvider — selection use case', () => {
  let rowState: InMemoryRowStateProvider

  beforeEach(() => {
    rowState = new InMemoryRowStateProvider()
  })

  it("a column.component can drive 'selected' via rowContext.rowState", async () => {
    const selectColumn: Column<Row> = {
      key: 'select',
      label: '',
      component: (_item, _i, ctx?: RowContext) => ({
        is: 'button',
        content: ctx && ctx.rowState.get('selected') ? '[x]' : '[ ]',
        events: { click: () => ctx?.rowState.toggle('selected') },
      }),
    }
    const dataColumn: Column<Row> = { key: 'name', label: 'Name' }

    const wrapper = mount(Grid<Row>, {
      props: {
        dataProvider: new ArrayDataProvider<Row>({ items: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }] }),
        columns: [selectColumn, dataColumn],
        rowStateProvider: rowState,
        rowKey: (it) => it.id,
      }
    })
    await flushPromises()

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toBe('[ ]')

    await buttons[0].trigger('click')
    await flushPromises()
    expect(rowState.get('a', 'selected')).toBe(true)
    expect(rowState.entries('selected')).toEqual(['a'])
  })
})
