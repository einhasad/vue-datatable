import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GridColumnHeader from '../src/GridColumnHeader.vue'
import type { Column, SortState, SortOrder } from '../src/types'

describe('GridColumnHeader', () => {
  it('renders bold label text when column has no sort and no labelComponent', () => {
    const column = { label: 'Name' } as Column<{ name: string }>

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null }
    })

    const bold = wrapper.find('b')
    expect(bold.exists()).toBe(true)
    expect(bold.text()).toBe('Name')
  })

  it('renders a function label called with the items', () => {
    const column: Column<{ name: string }> = {
      label: (models) => `Names (${models.length})`
    }

    const wrapper = mount(GridColumnHeader, {
      props: { column, items: [{ name: 'a' }, { name: 'b' }], sortState: null }
    })

    expect(wrapper.find('b').text()).toBe('Names (2)')
  })

  it('calls a function label with an empty list when items are not given', () => {
    const column: Column<{ name: string }> = {
      label: (models) => `Names (${models.length})`
    }

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null }
    })

    expect(wrapper.find('b').text()).toBe('Names (0)')
  })

  it('renders a function label inside the sort button', () => {
    const column: Column<{ name: string }> = {
      label: (models) => `Names (${models.length})`,
      sort: 'name'
    }

    const wrapper = mount(GridColumnHeader, {
      props: { column, items: [{ name: 'a' }], sortState: null }
    })

    expect(wrapper.find('button.grid-sort-link b').text()).toBe('Names (1)')
  })

  it('renders sort link when column.sort is defined', () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null }
    })

    const link = wrapper.find('button.grid-sort-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('type')).toBe('button')
    expect(link.attributes('href')).toBeUndefined()
    expect(link.find('b').text()).toBe('Name')
  })

  it('applies asc class when sortState matches asc', () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>
    const sortState: SortState = { field: 'name', order: 'asc' }

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState }
    })

    const link = wrapper.find('button.grid-sort-link')
    expect(link.classes()).toContain('asc')
    expect(link.classes()).not.toContain('desc')
  })

  it('applies desc class when sortState matches desc', () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>
    const sortState: SortState = { field: 'name', order: 'desc' }

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState }
    })

    const link = wrapper.find('button.grid-sort-link')
    expect(link.classes()).toContain('desc')
    expect(link.classes()).not.toContain('asc')
  })

  it('has no sort class when sortState field differs from column.sort', () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>
    const sortState: SortState = { field: 'email', order: 'asc' }

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState }
    })

    const link = wrapper.find('button.grid-sort-link')
    expect(link.classes()).not.toContain('asc')
    expect(link.classes()).not.toContain('desc')
  })

  it('emits sort with asc on first click when no current sort', async () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null }
    })

    await wrapper.find('button.grid-sort-link').trigger('click')

    expect(wrapper.emitted('sort')).toHaveLength(1)
    expect(wrapper.emitted('sort')![0]).toEqual([{ field: 'name', order: 'asc' }])
  })

  it('emits sort with desc when current order is asc', async () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>
    const sortState: SortState = { field: 'name', order: 'asc' }

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState }
    })

    await wrapper.find('button.grid-sort-link').trigger('click')

    expect(wrapper.emitted('sort')).toHaveLength(1)
    expect(wrapper.emitted('sort')![0]).toEqual([{ field: 'name', order: 'desc' }])
  })

  it('emits sort with null order when current order is desc', async () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>
    const sortState: SortState = { field: 'name', order: 'desc' }

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState }
    })

    await wrapper.find('button.grid-sort-link').trigger('click')

    expect(wrapper.emitted('sort')).toHaveLength(1)
    expect(wrapper.emitted('sort')![0]).toEqual([{ field: 'name', order: null }])
  })

  it('respects custom nextSortOrder prop', async () => {
    const column = { label: 'Name', sort: 'name' } as Column<{ name: string }>
    const customNextSortOrder = (current: SortOrder): SortOrder => {
      if (current === null) return 'desc'
      if (current === 'desc') return 'asc'
      return null
    }

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null, nextSortOrder: customNextSortOrder }
    })

    // First click: null -> desc (custom)
    await wrapper.find('button.grid-sort-link').trigger('click')
    expect(wrapper.emitted('sort')![0]).toEqual([{ field: 'name', order: 'desc' }])

    // Update sortState and click again: desc -> asc (custom)
    await wrapper.setProps({ sortState: { field: 'name', order: 'desc' } })
    await wrapper.find('button.grid-sort-link').trigger('click')
    expect(wrapper.emitted('sort')![1]).toEqual([{ field: 'name', order: 'asc' }])
  })

  it('renders DynamicComponent when labelComponent is provided and no sort', () => {
    const column = {
      label: 'ignored',
      labelComponent: { is: 'span', content: '<em>Custom</em>' }
    } as unknown as Column<{ name: string }>

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null }
    })

    expect(wrapper.find('span').exists()).toBe(true)
    expect(wrapper.find('em').exists()).toBe(false)
    expect(wrapper.find('span').text()).toBe('<em>Custom</em>')
  })

  it('renders empty string when label is undefined', () => {
    const column = { label: undefined } as unknown as Column<{ name: string }>

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null }
    })

    const bold = wrapper.find('b')
    expect(bold.exists()).toBe(true)
    expect(bold.text()).toBe('')
  })

  it('renders empty string when label is null', () => {
    const column = { label: null } as unknown as Column<{ name: string }>

    const wrapper = mount(GridColumnHeader, {
      props: { column, sortState: null }
    })

    const bold = wrapper.find('b')
    expect(bold.exists()).toBe(true)
    expect(bold.text()).toBe('')
  })
})
