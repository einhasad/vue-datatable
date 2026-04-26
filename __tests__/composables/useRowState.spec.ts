import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { InMemoryRowStateProvider } from '../../src/rowState/InMemoryRowStateProvider'
import { useRowState } from '../../src/composables/useRowState'

interface Item { id: string; name: string }

function makeHost(items: Item[], provider = new InMemoryRowStateProvider()) {
  return defineComponent({
    setup() {
      const rowState = useRowState<Item>({
        rowStateProvider: provider,
        rowKey: (it) => it.id,
      })
      return { rowState, items }
    },
    render() {
      return h('div', this.items.map((it) =>
        h('span', { 'data-id': it.id, 'data-expanded': String(this.rowState.isExpanded(it)) }, it.name)
      ))
    }
  })
}

describe('useRowState', () => {
  let provider: InMemoryRowStateProvider

  beforeEach(() => {
    provider = new InMemoryRowStateProvider()
  })

  it('isExpanded reads provider via rowKey', () => {
    provider.set('a', 'expanded', true)
    const wrapper = mount(makeHost([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], provider))
    expect(wrapper.find('[data-id="a"]').attributes('data-expanded')).toBe('true')
    expect(wrapper.find('[data-id="b"]').attributes('data-expanded')).toBe('false')
  })

  it('toggleExpanded flips the expanded flag for the item', async () => {
    const Host = defineComponent({
      setup() {
        const rowState = useRowState<Item>({ rowStateProvider: provider, rowKey: (it) => it.id })
        return { rowState }
      },
      render() {
        return h('button', { onClick: () => this.rowState.toggleExpanded({ id: 'a', name: 'A' }) }, 'toggle')
      }
    })
    const wrapper = mount(Host)
    await wrapper.find('button').trigger('click')
    expect(provider.get('a', 'expanded')).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(provider.get('a', 'expanded')).toBe(false)
  })

  it('forwards generic flag access (set/get/toggle) to the provider', () => {
    const wrapper = mount(makeHost([{ id: 'a', name: 'A' }], provider))
    const vm = wrapper.vm as unknown as { rowState: ReturnType<typeof useRowState<Item>> }
    vm.rowState.set({ id: 'a', name: 'A' }, 'selected', true)
    expect(provider.get('a', 'selected')).toBe(true)
    vm.rowState.toggle({ id: 'a', name: 'A' }, 'selected')
    expect(provider.get('a', 'selected')).toBe(false)
    expect(vm.rowState.get({ id: 'a', name: 'A' }, 'selected')).toBe(false)
  })

  it('entries() returns row keys for the flag', () => {
    provider.set('a', 'selected', true)
    provider.set('b', 'selected', true)
    const wrapper = mount(makeHost([], provider))
    const vm = wrapper.vm as unknown as { rowState: ReturnType<typeof useRowState<Item>> }
    expect(vm.rowState.entries('selected').sort()).toEqual(['a', 'b'])
  })

  it('clear() wipes a flag across all rows', () => {
    provider.set('a', 'selected', true)
    provider.set('b', 'selected', true)
    const wrapper = mount(makeHost([], provider))
    const vm = wrapper.vm as unknown as { rowState: ReturnType<typeof useRowState<Item>> }
    vm.rowState.clear('selected')
    expect(provider.entries('selected')).toEqual([])
  })

  it('returns false from isExpanded when rowKey resolves to undefined', async () => {
    const wrapper = mount(makeHost(
      [{ id: undefined as unknown as string, name: 'A' }],
      provider,
    ))
    await nextTick()
    expect(wrapper.find('[data-expanded]').attributes('data-expanded')).toBe('false')
  })
})
