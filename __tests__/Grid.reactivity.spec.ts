import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, defineComponent, h } from 'vue'
import { Grid, CallbackDataProvider } from '../src/index'
import type { Column, LoadResult } from '../src/types'

interface TestItem {
  id: number
  name: string
  note: string | null
}

describe('Grid Reactivity', () => {
  it('should re-render DynamicComponent when column component function returns different component type after refresh', async () => {
    // Simulates the admin note column pattern: returns "span" when no note, "div" when has note
    const items = ref<TestItem[]>([
      { id: 1, name: 'Item 1', note: null },
      { id: 2, name: 'Item 2', note: 'Has note' },
    ])

    const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => {
      return { items: [...items.value] }
    })

    const dataProvider = new CallbackDataProvider<TestItem>({
      loadFn,
      offsetPaginationFn: () => {},
    })
    dataProvider.setOffsetPagination({ page: 1, pageSize: 20 })

    const columns: Column<TestItem>[] = [
      { label: 'Name', value: (item) => item.name },
      {
        label: 'Note',
        component: (item) => {
          if (!item.note) {
            return { is: 'span', props: {}, content: '<span class="fa fa-file-o"></span>' }
          }
          return { is: 'div', props: { class: 'has-note' }, content: '<span class="fa fa-file"></span>' }
        },
      },
    ]

    const wrapper = mount(Grid as any, {
      props: { dataProvider, columns, rowKeyField: 'id' },
    })
    await flushPromises()

    // Row 1 (Item 1, no note) should show fa-file-o
    const row0 = wrapper.find('[data-qa="row-0"]')
    expect(row0.find('.fa-file-o').exists()).toBe(true)
    expect(row0.find('.fa-file').exists()).toBe(false)

    // Row 2 (Item 2, has note) should show fa-file
    const row1 = wrapper.find('[data-qa="row-1"]')
    expect(row1.find('.fa-file').exists()).toBe(true)
    expect(row1.find('.fa-file-o').exists()).toBe(false)

    // Now update the data: Item 1 now has a note
    items.value = [
      { id: 1, name: 'Item 1', note: 'New note' },
      { id: 2, name: 'Item 2', note: 'Has note' },
    ]

    // Trigger grid refresh with updated data
    await dataProvider.refresh()
    await flushPromises()

    // Row 1 should now show fa-file (not fa-file-o)
    const updatedRow0 = wrapper.find('[data-qa="row-0"]')
    expect(updatedRow0.find('.fa-file').exists()).toBe(true)
    expect(updatedRow0.find('.fa-file-o').exists()).toBe(false)
  })

  it('should re-render DynamicComponent when item data changes and component function reads updated field', async () => {
    const items = ref<TestItem[]>([
      { id: 1, name: 'Item 1', note: null },
    ])

    const loadFn = vi.fn(async (): Promise<LoadResult<TestItem>> => {
      return { items: [...items.value] }
    })

    const dataProvider = new CallbackDataProvider<TestItem>({
      loadFn,
      offsetPaginationFn: () => {},
    })
    dataProvider.setOffsetPagination({ page: 1, pageSize: 20 })

    // Custom component that displays different content based on note
    const NoteDisplay = defineComponent({
      props: { note: { type: String, default: null } },
      template: `<span :class="note ? 'note-filled' : 'note-empty'">{{ note || 'empty' }}</span>`,
    })

    const columns: Column<TestItem>[] = [
      {
        label: 'Note',
        component: (item) => ({
          is: NoteDisplay,
          props: { note: item.note },
        }),
      },
    ]

    const wrapper = mount(Grid as any, {
      props: { dataProvider, columns, rowKeyField: 'id' },
    })
    await flushPromises()

    // Initially no note
    const row0 = wrapper.find('[data-qa="row-0"]')
    expect(row0.find('.note-empty').exists()).toBe(true)

    // Update item to have a note
    items.value = [{ id: 1, name: 'Item 1', note: 'Updated note' }]
    await dataProvider.refresh()
    await flushPromises()

    // Should now show filled state
    const updatedRow0 = wrapper.find('[data-qa="row-0"]')
    expect(updatedRow0.find('.note-filled').exists()).toBe(true)
    expect(updatedRow0.find('.note-empty').exists()).toBe(false)
    expect(updatedRow0.text()).toContain('Updated note')
  })
})
